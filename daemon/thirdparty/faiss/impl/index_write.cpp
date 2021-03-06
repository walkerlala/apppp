/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// -*- c++ -*-

#include <faiss/index_io.h>

#include <cstdio>
#include <cstdlib>

#include <faiss/FaissAssert.h>
#include <faiss/FaissIO.h>

#include <faiss/IndexFlat.h>
#include <faiss/VectorTransform.h>
#include <faiss/IndexPreTransform.h>
#include <faiss/IndexLSH.h>
#include <faiss/IndexPQ.h>
#include <faiss/IndexIVF.h>
#include <faiss/IndexIVFPQ.h>
#include <faiss/IndexIVFPQR.h>
#include <faiss/Index2Layer.h>
#include <faiss/IndexIVFFlat.h>
#include <faiss/IndexIVFSpectralHash.h>
#include <faiss/MetaIndexes.h>
#include <faiss/IndexScalarQuantizer.h>
#include <faiss/IndexHNSW.h>
#include <faiss/IndexLattice.h>

#include <faiss/OnDiskInvertedLists.h>
#include <faiss/IndexBinaryFlat.h>
#include <faiss/IndexBinaryFromFloat.h>
#include <faiss/IndexBinaryHNSW.h>
#include <faiss/IndexBinaryIVF.h>



/*************************************************************
 * The I/O format is the content of the class. For objects that are
 * inherited, like Index, a 4-character-code (fourcc) indicates which
 * child class this is an instance of.
 *
 * In this case, the fields of the parent class are written first,
 * then the ones for the child classes. Note that this requires
 * classes to be serialized to have a constructor without parameters,
 * so that the fields can be filled in later. The default constructor
 * should set reasonable defaults for all fields.
 *
 * The fourccs are assigned arbitrarily. When the class changed (added
 * or deprecated fields), the fourcc can be replaced. New code should
 * be able to read the old fourcc and fill in new classes.
 *
 * TODO: serialization to strings for use in Python pickle or Torch
 * serialization.
 *
 * TODO: in this file, the read functions that encouter errors may
 * leak memory.
 **************************************************************/



namespace faiss {


/*************************************************************
 * I/O macros
 *
 * we use macros so that we have a line number to report in abort
 * (). This makes debugging a lot easier. The IOReader or IOWriter is
 * always called f and thus is not passed in as a macro parameter.
 **************************************************************/


#define WRITEANDCHECK(ptr, n) {                                 \
        int64_t ret = (*f)(ptr, sizeof(*(ptr)), n);              \
        FAISS_THROW_IF_NOT_FMT(ret == (n),                      \
            "write error in %s:  %" PRId64 " !=  %" PRId64 " (%s)",               \
            f->name.c_str(), ret, int64_t(n), strerror(errno));  \
    }

#define WRITE1(x) WRITEANDCHECK(&(x), 1)

#define WRITEVECTOR(vec) {                      \
        int64_t size = (vec).size ();            \
        WRITEANDCHECK (&size, 1);               \
        WRITEANDCHECK ((vec).data (), size);    \
    }



/*************************************************************
 * Write
 **************************************************************/
static void write_index_header (const Index *idx, IOWriter *f) {
    WRITE1 (idx->d);
    WRITE1 (idx->ntotal);
    Index::idx_t dummy = 1 << 20;
    WRITE1 (dummy);
    WRITE1 (dummy);
    WRITE1 (idx->is_trained);
    WRITE1 (idx->metric_type);
    if (idx->metric_type > 1) {
        WRITE1 (idx->metric_arg);
    }
}

void write_VectorTransform (const VectorTransform *vt, IOWriter *f) {
    if (const LinearTransform * lt =
           dynamic_cast < const LinearTransform *> (vt)) {
        if (dynamic_cast<const RandomRotationMatrix *>(lt)) {
            uint32_t h = fourcc ("rrot");
            WRITE1 (h);
        } else if (const PCAMatrix * pca =
                   dynamic_cast<const PCAMatrix *>(lt)) {
            uint32_t h = fourcc ("PcAm");
            WRITE1 (h);
            WRITE1 (pca->eigen_power);
            WRITE1 (pca->random_rotation);
            WRITE1 (pca->balanced_bins);
            WRITEVECTOR (pca->mean);
            WRITEVECTOR (pca->eigenvalues);
            WRITEVECTOR (pca->PCAMat);
        } else if (const ITQMatrix * itqm =
                   dynamic_cast<const ITQMatrix *>(lt)) {
            uint32_t h = fourcc ("Viqm");
            WRITE1 (h);
            WRITE1 (itqm->max_iter);
            WRITE1 (itqm->seed);
        } else {
            // generic LinearTransform (includes OPQ)
            uint32_t h = fourcc ("LTra");
            WRITE1 (h);
        }
        WRITE1 (lt->have_bias);
        WRITEVECTOR (lt->A);
        WRITEVECTOR (lt->b);
    } else if (const RemapDimensionsTransform *rdt =
               dynamic_cast<const RemapDimensionsTransform *>(vt)) {
        uint32_t h = fourcc ("RmDT");
        WRITE1 (h);
        WRITEVECTOR (rdt->map);
    } else if (const NormalizationTransform *nt =
               dynamic_cast<const NormalizationTransform *>(vt)) {
        uint32_t h = fourcc ("VNrm");
        WRITE1 (h);
        WRITE1 (nt->norm);
    } else if (const CenteringTransform *ct =
               dynamic_cast<const CenteringTransform *>(vt)) {
        uint32_t h = fourcc ("VCnt");
        WRITE1 (h);
        WRITEVECTOR (ct->mean);
    } else if (const ITQTransform *itqt =
               dynamic_cast<const ITQTransform*> (vt)) {
        uint32_t h = fourcc ("Viqt");
        WRITE1 (h);
        WRITEVECTOR (itqt->mean);
        WRITE1 (itqt->do_pca);
        write_VectorTransform (&itqt->itq, f);
        write_VectorTransform (&itqt->pca_then_itq, f);
    } else {
        FAISS_THROW_MSG ("cannot serialize this");
    }
    // common fields
    WRITE1 (vt->d_in);
    WRITE1 (vt->d_out);
    WRITE1 (vt->is_trained);
}

void write_ProductQuantizer (const ProductQuantizer *pq, IOWriter *f) {
    WRITE1 (pq->d);
    WRITE1 (pq->M);
    WRITE1 (pq->nbits);
    WRITEVECTOR (pq->centroids);
}

static void write_ScalarQuantizer (
        const ScalarQuantizer *ivsc, IOWriter *f) {
    WRITE1 (ivsc->qtype);
    WRITE1 (ivsc->rangestat);
    WRITE1 (ivsc->rangestat_arg);
    WRITE1 (ivsc->d);
    WRITE1 (ivsc->code_size);
    WRITEVECTOR (ivsc->trained);
}

void write_InvertedLists (const InvertedLists *ils, IOWriter *f) {
    if (ils == nullptr) {
        uint32_t h = fourcc ("il00");
        WRITE1 (h);
    } else if (const auto & ails =
               dynamic_cast<const ArrayInvertedLists *>(ils)) {
        uint32_t h = fourcc ("ilar");
        WRITE1 (h);
        WRITE1 (ails->nlist);
        WRITE1 (ails->code_size);
        // here we store either as a full or a sparse data buffer
        int64_t n_non0 = 0;
        for (int64_t i = 0; i < ails->nlist; i++) {
            if (ails->ids[i].size() > 0)
                n_non0++;
        }
        if (n_non0 > ails->nlist / 2) {
            uint32_t list_type = fourcc("full");
            WRITE1 (list_type);
            std::vector<int64_t> sizes;
            for (int64_t i = 0; i < ails->nlist; i++) {
                sizes.push_back (ails->ids[i].size());
            }
            WRITEVECTOR (sizes);
        } else {
            int list_type = fourcc("sprs"); // sparse
            WRITE1 (list_type);
            std::vector<int64_t> sizes;
            for (int64_t i = 0; i < ails->nlist; i++) {
                int64_t n = ails->ids[i].size();
                if (n > 0) {
                    sizes.push_back (i);
                    sizes.push_back (n);
                }
            }
            WRITEVECTOR (sizes);
        }
        // make a single contiguous data buffer (useful for mmapping)
        for (int64_t i = 0; i < ails->nlist; i++) {
            int64_t n = ails->ids[i].size();
            if (n > 0) {
                WRITEANDCHECK (ails->codes[i].data(), n * ails->code_size);
                WRITEANDCHECK (ails->ids[i].data(), n);
            }
        }
    } else if (const auto & od =
               dynamic_cast<const OnDiskInvertedLists *>(ils)) {
        uint32_t h = fourcc ("ilod");
        WRITE1 (h);
        WRITE1 (ils->nlist);
        WRITE1 (ils->code_size);
        // this is a POD object
        WRITEVECTOR (od->lists);

        {
            std::vector<OnDiskInvertedLists::Slot> v(
                      od->slots.begin(), od->slots.end());
            WRITEVECTOR(v);
        }
        {
            std::vector<char> x(od->filename.begin(), od->filename.end());
            WRITEVECTOR(x);
        }
        WRITE1(od->totsize);

    } else {
        fprintf(stderr, "WARN! write_InvertedLists: unsupported invlist type, "
                "saving null invlist\n");
        uint32_t h = fourcc ("il00");
        WRITE1 (h);
    }
}


void write_ProductQuantizer (const ProductQuantizer*pq, const char *fname) {
    FileIOWriter writer(fname);
    write_ProductQuantizer (pq, &writer);
}

static void write_HNSW (const HNSW *hnsw, IOWriter *f) {

    WRITEVECTOR (hnsw->assign_probas);
    WRITEVECTOR (hnsw->cum_nneighbor_per_level);
    WRITEVECTOR (hnsw->levels);
    WRITEVECTOR (hnsw->offsets);
    WRITEVECTOR (hnsw->neighbors);

    WRITE1 (hnsw->entry_point);
    WRITE1 (hnsw->max_level);
    WRITE1 (hnsw->efConstruction);
    WRITE1 (hnsw->efSearch);
    WRITE1 (hnsw->upper_beam);
}

static void write_ivf_header (const IndexIVF *ivf, IOWriter *f) {
    write_index_header (ivf, f);
    WRITE1 (ivf->nlist);
    WRITE1 (ivf->nprobe);
    write_index (ivf->quantizer, f);
    WRITE1 (ivf->maintain_direct_map);
    WRITEVECTOR (ivf->direct_map);
}

void write_index (const Index *idx, IOWriter *f) {
    if (const IndexFlat * idxf = dynamic_cast<const IndexFlat *> (idx)) {
        uint32_t h = fourcc (
              idxf->metric_type == METRIC_INNER_PRODUCT ? "IxFI" :
              idxf->metric_type == METRIC_L2 ? "IxF2" : nullptr);
        WRITE1 (h);
        write_index_header (idx, f);
        WRITEVECTOR (idxf->xb);
    } else if(const IndexLSH * idxl = dynamic_cast<const IndexLSH *> (idx)) {
        uint32_t h = fourcc ("IxHe");
        WRITE1 (h);
        write_index_header (idx, f);
        WRITE1 (idxl->nbits);
        WRITE1 (idxl->rotate_data);
        WRITE1 (idxl->train_thresholds);
        WRITEVECTOR (idxl->thresholds);
        WRITE1 (idxl->bytes_per_vec);
        write_VectorTransform (&idxl->rrot, f);
        WRITEVECTOR (idxl->codes);
    } else if(const IndexPQ * idxp = dynamic_cast<const IndexPQ *> (idx)) {
        uint32_t h = fourcc ("IxPq");
        WRITE1 (h);
        write_index_header (idx, f);
        write_ProductQuantizer (&idxp->pq, f);
        WRITEVECTOR (idxp->codes);
        // search params -- maybe not useful to store?
        WRITE1 (idxp->search_type);
        WRITE1 (idxp->encode_signs);
        WRITE1 (idxp->polysemous_ht);
    } else if(const Index2Layer * idxp =
              dynamic_cast<const Index2Layer *> (idx)) {
        uint32_t h = fourcc ("Ix2L");
        WRITE1 (h);
        write_index_header (idx, f);
        write_index (idxp->q1.quantizer, f);
        WRITE1 (idxp->q1.nlist);
        WRITE1 (idxp->q1.quantizer_trains_alone);
        write_ProductQuantizer (&idxp->pq, f);
        WRITE1 (idxp->code_size_1);
        WRITE1 (idxp->code_size_2);
        WRITE1 (idxp->code_size);
        WRITEVECTOR (idxp->codes);
    } else if(const IndexScalarQuantizer * idxs =
              dynamic_cast<const IndexScalarQuantizer *> (idx)) {
        uint32_t h = fourcc ("IxSQ");
        WRITE1 (h);
        write_index_header (idx, f);
        write_ScalarQuantizer (&idxs->sq, f);
        WRITEVECTOR (idxs->codes);
    } else if(const IndexLattice * idxl =
              dynamic_cast<const IndexLattice *> (idx)) {
        uint32_t h = fourcc ("IxLa");
        WRITE1 (h);
        WRITE1 (idxl->d);
        WRITE1 (idxl->nsq);
        WRITE1 (idxl->scale_nbit);
        WRITE1 (idxl->zn_sphere_codec.r2);
        write_index_header (idx, f);
        WRITEVECTOR (idxl->trained);
    } else if(const IndexIVFFlatDedup * ivfl =
              dynamic_cast<const IndexIVFFlatDedup *> (idx)) {
        uint32_t h = fourcc ("IwFd");
        WRITE1 (h);
        write_ivf_header (ivfl, f);
        {
            std::vector<Index::idx_t> tab (2 * ivfl->instances.size());
            int64_t i = 0;
            for (auto it = ivfl->instances.begin();
                 it != ivfl->instances.end(); ++it) {
                tab[i++] = it->first;
                tab[i++] = it->second;
            }
            WRITEVECTOR (tab);
        }
        write_InvertedLists (ivfl->invlists, f);
    } else if(const IndexIVFFlat * ivfl =
              dynamic_cast<const IndexIVFFlat *> (idx)) {
        uint32_t h = fourcc ("IwFl");
        WRITE1 (h);
        write_ivf_header (ivfl, f);
        write_InvertedLists (ivfl->invlists, f);
    } else if(const IndexIVFScalarQuantizer * ivsc =
              dynamic_cast<const IndexIVFScalarQuantizer *> (idx)) {
        uint32_t h = fourcc ("IwSq");
        WRITE1 (h);
        write_ivf_header (ivsc, f);
        write_ScalarQuantizer (&ivsc->sq, f);
        WRITE1 (ivsc->code_size);
        WRITE1 (ivsc->by_residual);
        write_InvertedLists (ivsc->invlists, f);
    } else if(const IndexIVFSpectralHash *ivsp =
              dynamic_cast<const IndexIVFSpectralHash *>(idx)) {
        uint32_t h = fourcc ("IwSh");
        WRITE1 (h);
        write_ivf_header (ivsp, f);
        write_VectorTransform (ivsp->vt, f);
        WRITE1 (ivsp->nbit);
        WRITE1 (ivsp->period);
        WRITE1 (ivsp->threshold_type);
        WRITEVECTOR (ivsp->trained);
        write_InvertedLists (ivsp->invlists, f);
    } else if(const IndexIVFPQ * ivpq =
              dynamic_cast<const IndexIVFPQ *> (idx)) {
        const IndexIVFPQR * ivfpqr = dynamic_cast<const IndexIVFPQR *> (idx);

        uint32_t h = fourcc (ivfpqr ? "IwQR" : "IwPQ");
        WRITE1 (h);
        write_ivf_header (ivpq, f);
        WRITE1 (ivpq->by_residual);
        WRITE1 (ivpq->code_size);
        write_ProductQuantizer (&ivpq->pq, f);
        write_InvertedLists (ivpq->invlists, f);
        if (ivfpqr) {
            write_ProductQuantizer (&ivfpqr->refine_pq, f);
            WRITEVECTOR (ivfpqr->refine_codes);
            WRITE1 (ivfpqr->k_factor);
        }

    } else if(const IndexPreTransform * ixpt =
              dynamic_cast<const IndexPreTransform *> (idx)) {
        uint32_t h = fourcc ("IxPT");
        WRITE1 (h);
        write_index_header (ixpt, f);
        int nt = ixpt->chain.size();
        WRITE1 (nt);
        for (int i = 0; i < nt; i++)
            write_VectorTransform (ixpt->chain[i], f);
        write_index (ixpt->index, f);
    } else if(const MultiIndexQuantizer * imiq =
              dynamic_cast<const MultiIndexQuantizer *> (idx)) {
        uint32_t h = fourcc ("Imiq");
        WRITE1 (h);
        write_index_header (imiq, f);
        write_ProductQuantizer (&imiq->pq, f);
    } else if(const IndexRefineFlat * idxrf =
              dynamic_cast<const IndexRefineFlat *> (idx)) {
        uint32_t h = fourcc ("IxRF");
        WRITE1 (h);
        write_index_header (idxrf, f);
        write_index (idxrf->base_index, f);
        write_index (&idxrf->refine_index, f);
        WRITE1 (idxrf->k_factor);
    } else if(const IndexIDMap * idxmap =
              dynamic_cast<const IndexIDMap *> (idx)) {
        uint32_t h =
            dynamic_cast<const IndexIDMap2 *> (idx) ? fourcc ("IxM2") :
            fourcc ("IxMp");
        // no need to store additional info for IndexIDMap2
        WRITE1 (h);
        write_index_header (idxmap, f);
        write_index (idxmap->index, f);
        WRITEVECTOR (idxmap->id_map);
    } else if(const IndexHNSW * idxhnsw =
              dynamic_cast<const IndexHNSW *> (idx)) {
        uint32_t h =
            dynamic_cast<const IndexHNSWFlat*>(idx)   ? fourcc("IHNf") :
            dynamic_cast<const IndexHNSWPQ*>(idx)     ? fourcc("IHNp") :
            dynamic_cast<const IndexHNSWSQ*>(idx)     ? fourcc("IHNs") :
            dynamic_cast<const IndexHNSW2Level*>(idx) ? fourcc("IHN2") :
            0;
        FAISS_THROW_IF_NOT (h != 0);
        WRITE1 (h);
        write_index_header (idxhnsw, f);
        write_HNSW (&idxhnsw->hnsw, f);
        write_index (idxhnsw->storage, f);
    } else {
      FAISS_THROW_MSG ("don't know how to serialize this type of index");
    }
}

void write_index (const Index *idx, FILE *f) {
    FileIOWriter writer(f);
    write_index (idx, &writer);
}

void write_index (const Index *idx, const char *fname) {
    FileIOWriter writer(fname);
    write_index (idx, &writer);
}

void write_VectorTransform (const VectorTransform *vt, const char *fname) {
    FileIOWriter writer(fname);
    write_VectorTransform (vt, &writer);
}


/*************************************************************
 * Write binary indexes
 **************************************************************/


static void write_index_binary_header (const IndexBinary *idx, IOWriter *f) {
    WRITE1 (idx->d);
    WRITE1 (idx->code_size);
    WRITE1 (idx->ntotal);
    WRITE1 (idx->is_trained);
    WRITE1 (idx->metric_type);
}

static void write_binary_ivf_header (const IndexBinaryIVF *ivf, IOWriter *f) {
    write_index_binary_header (ivf, f);
    WRITE1 (ivf->nlist);
    WRITE1 (ivf->nprobe);
    write_index_binary (ivf->quantizer, f);
    WRITE1 (ivf->maintain_direct_map);
    WRITEVECTOR (ivf->direct_map);
}

void write_index_binary (const IndexBinary *idx, IOWriter *f) {
    if (const IndexBinaryFlat *idxf =
        dynamic_cast<const IndexBinaryFlat *> (idx)) {
        uint32_t h = fourcc ("IBxF");
        WRITE1 (h);
        write_index_binary_header (idx, f);
        WRITEVECTOR (idxf->xb);
    } else if (const IndexBinaryIVF *ivf =
               dynamic_cast<const IndexBinaryIVF *> (idx)) {
        uint32_t h = fourcc ("IBwF");
        WRITE1 (h);
        write_binary_ivf_header (ivf, f);
        write_InvertedLists (ivf->invlists, f);
    } else if(const IndexBinaryFromFloat * idxff =
              dynamic_cast<const IndexBinaryFromFloat *> (idx)) {
        uint32_t h = fourcc ("IBFf");
        WRITE1 (h);
        write_index_binary_header (idxff, f);
        write_index (idxff->index, f);
    } else if (const IndexBinaryHNSW *idxhnsw =
               dynamic_cast<const IndexBinaryHNSW *> (idx)) {
        uint32_t h = fourcc ("IBHf");
        WRITE1 (h);
        write_index_binary_header (idxhnsw, f);
        write_HNSW (&idxhnsw->hnsw, f);
        write_index_binary (idxhnsw->storage, f);
    } else if(const IndexBinaryIDMap * idxmap =
              dynamic_cast<const IndexBinaryIDMap *> (idx)) {
        uint32_t h =
            dynamic_cast<const IndexBinaryIDMap2 *> (idx) ? fourcc ("IBM2") :
            fourcc ("IBMp");
        // no need to store additional info for IndexIDMap2
        WRITE1 (h);
        write_index_binary_header (idxmap, f);
        write_index_binary (idxmap->index, f);
        WRITEVECTOR (idxmap->id_map);
    } else {
        FAISS_THROW_MSG ("don't know how to serialize this type of index");
    }
}

void write_index_binary (const IndexBinary *idx, FILE *f) {
    FileIOWriter writer(f);
    write_index_binary(idx, &writer);
}

void write_index_binary (const IndexBinary *idx, const char *fname) {
    FileIOWriter writer(fname);
    write_index_binary (idx, &writer);
}


} // namespace faiss
