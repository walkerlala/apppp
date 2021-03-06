/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */


#include <faiss/gpu/GpuIndexIVF.h>
#include <faiss/impl/FaissAssert.h>
#include <faiss/IndexFlat.h>
#include <faiss/IndexIVF.h>
#include <faiss/gpu/GpuIndexFlat.h>
#include <faiss/gpu/utils/DeviceUtils.h>
#include <faiss/gpu/utils/Float16.cuh>

namespace faiss { namespace gpu {

GpuIndexIVF::GpuIndexIVF(GpuResources* resources,
                         int dims,
                         faiss::MetricType metric,
                         int nlistIn,
                         GpuIndexIVFConfig config) :
    GpuIndex(resources, dims, metric, config),
    ivfConfig_(std::move(config)),
    nlist(nlistIn),
    nprobe(1),
    quantizer(nullptr) {
  init_();
}

void
GpuIndexIVF::init_() {
  FAISS_ASSERT(nlist > 0);

  // Spherical by default if the metric is inner_product
  if (this->metric_type == faiss::METRIC_INNER_PRODUCT) {
    this->cp.spherical = true;
  }

  // here we set a low # iterations because this is typically used
  // for large clusterings
  this->cp.niter = 10;
  this->cp.verbose = this->verbose;

  if (!quantizer) {
    // Construct an empty quantizer
    GpuIndexFlatConfig config = ivfConfig_.flatConfig;
    // FIXME: inherit our same device
    config.device = device_;

    if (this->metric_type == faiss::METRIC_L2) {
      quantizer = new GpuIndexFlatL2(resources_, this->d, config);
    } else if (this->metric_type == faiss::METRIC_INNER_PRODUCT) {
      quantizer = new GpuIndexFlatIP(resources_, this->d, config);
    } else {
      // unknown metric type
      FAISS_THROW_IF_NOT_MSG(false, "unsupported metric type");
    }
  }
}

GpuIndexIVF::~GpuIndexIVF() {
  delete quantizer;
}

GpuIndexFlat*
GpuIndexIVF::getQuantizer() {
  return quantizer;
}

void
GpuIndexIVF::copyFrom(const faiss::IndexIVF* index) {
  DeviceScope scope(device_);

  this->d = index->d;
  this->metric_type = index->metric_type;

  FAISS_ASSERT(index->nlist > 0);
  FAISS_THROW_IF_NOT_FMT(index->nlist <=
                     (faiss::Index::idx_t) std::numeric_limits<int>::max(),
                     "GPU index only supports  %" PRId64 " inverted lists",
                     (int64_t) std::numeric_limits<int>::max());
  nlist = index->nlist;

  FAISS_THROW_IF_NOT_FMT(index->nprobe > 0 &&
                         index->nprobe <= getMaxKSelection(),
                         "GPU index only supports nprobe <=  %" PRId64 "; passed  %" PRId64 "",
                         (int64_t) getMaxKSelection(),
                         index->nprobe);
  nprobe = index->nprobe;

  // The metric type may have changed as well, so we might have to
  // change our quantizer
  delete quantizer;
  quantizer = nullptr;

  // Construct an empty quantizer
  GpuIndexFlatConfig config = ivfConfig_.flatConfig;
  // FIXME: inherit our same device
  config.device = device_;

  if (index->metric_type == faiss::METRIC_L2) {
    // FIXME: 2 different float16 options?
    quantizer = new GpuIndexFlatL2(resources_, this->d, config);
  } else if (index->metric_type == faiss::METRIC_INNER_PRODUCT) {
    // FIXME: 2 different float16 options?
    quantizer = new GpuIndexFlatIP(resources_, this->d, config);
  } else {
    // unknown metric type
    FAISS_ASSERT(false);
  }

  if (!index->is_trained) {
    this->is_trained = false;
    this->ntotal = 0;
    return;
  }

  // Otherwise, we can populate ourselves from the other index
  this->is_trained = true;

  // ntotal can exceed max int, but the number of vectors per inverted
  // list cannot exceed this. We check this in the subclasses.
  this->ntotal = index->ntotal;

  // Since we're trained, the quantizer must have data
  FAISS_ASSERT(index->quantizer->ntotal > 0);

  // Right now, we can only handle IndexFlat or derived classes
  auto qFlat = dynamic_cast<faiss::IndexFlat*>(index->quantizer);
  FAISS_THROW_IF_NOT_MSG(qFlat,
                         "Only IndexFlat is supported for the coarse quantizer "
                         "for copying from an IndexIVF into a GpuIndexIVF");

  quantizer->copyFrom(qFlat);
}

void
GpuIndexIVF::copyTo(faiss::IndexIVF* index) const {
  DeviceScope scope(device_);

  //
  // Index information
  //
  index->ntotal = this->ntotal;
  index->d = this->d;
  index->metric_type = this->metric_type;
  index->is_trained = this->is_trained;

  //
  // IndexIVF information
  //
  index->nlist = nlist;
  index->nprobe = nprobe;

  // Construct and copy the appropriate quantizer
  faiss::IndexFlat* q = nullptr;

  if (this->metric_type == faiss::METRIC_L2) {
    q = new faiss::IndexFlatL2(this->d);

  } else if (this->metric_type == faiss::METRIC_INNER_PRODUCT) {
    q = new faiss::IndexFlatIP(this->d);

  } else {
    // we should have one of the above metrics
    FAISS_ASSERT(false);
  }

  FAISS_ASSERT(quantizer);
  quantizer->copyTo(q);

  if (index->own_fields) {
    delete index->quantizer;
  }

  index->quantizer = q;
  index->quantizer_trains_alone = 0;
  index->own_fields = true;
  index->cp = this->cp;
  index->maintain_direct_map = false;
  index->direct_map.clear();
}

int
GpuIndexIVF::getNumLists() const {
  return nlist;
}

void
GpuIndexIVF::setNumProbes(int nprobe) {
  FAISS_THROW_IF_NOT_FMT(nprobe > 0 && nprobe <= getMaxKSelection(),
                         "GPU index only supports nprobe <= %d; passed %d",
                         getMaxKSelection(),
                         nprobe);
  this->nprobe = nprobe;
}

int
GpuIndexIVF::getNumProbes() const {
  return nprobe;
}

bool
GpuIndexIVF::addImplRequiresIDs_() const {
  // All IVF indices have storage for IDs
  return true;
}

void
GpuIndexIVF::trainQuantizer_(faiss::Index::idx_t n, const float* x) {
  if (n == 0) {
    // nothing to do
    return;
  }

  if (quantizer->is_trained && (quantizer->ntotal == nlist)) {
    if (this->verbose) {
      printf ("IVF quantizer does not need training.\n");
    }

    return;
  }

  if (this->verbose) {
    printf ("Training IVF quantizer on  %" PRId64 " vectors in %dD\n", n, d);
  }

  DeviceScope scope(device_);

  // leverage the CPU-side k-means code, which works for the GPU
  // flat index as well
  quantizer->reset();
  Clustering clus(this->d, nlist, this->cp);
  clus.verbose = verbose;
  clus.train(n, x, *quantizer);
  quantizer->is_trained = true;

  FAISS_ASSERT(quantizer->ntotal == nlist);
}

} } // namespace
