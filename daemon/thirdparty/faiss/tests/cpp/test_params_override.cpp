/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#include <cstdio>
#include <cstdlib>
#include <random>

#include <memory>
#include <vector>

#include <gtest/gtest.h>

#include <faiss/IndexIVF.h>
#include <faiss/IndexBinaryIVF.h>
#include <faiss/index_factory.h>
#include <faiss/AutoTune.h>
#include <faiss/IVFlib.h>

using namespace faiss;

namespace
{

typedef Index::idx_t idx_t;

// dimension of the vectors to index
int d = 32;

// size of the database we plan to index
int64_t nb = 1000;

// nb of queries
int64_t nq = 200;

std::vector<float> make_data(int64_t n)
{
    std::random_device rd;  //Will be used to obtain a seed for the random number engine
    std::mt19937 gen(rd()); //Standard mersenne_twister_engine seeded with rd()
    std::uniform_real_distribution<> dis(0.0, 1.0);
    std::vector<float> database(n * d);
    for (int64_t i = 0; i < n * d; i++)
    {
        database[i] = dis(gen);
    }
    return database;
}

std::unique_ptr<Index> make_index(const char *index_type,
                                  MetricType metric,
                                  const std::vector<float> &x)
{
    std::unique_ptr<Index> index(index_factory(d, index_type, metric));
    index->train(nb, x.data());
    index->add(nb, x.data());
    return index;
}

std::vector<idx_t> search_index(Index *index, const float *xq)
{
    int k = 10;
    std::vector<idx_t> I(k * nq);
    std::vector<float> D(k * nq);
    index->search(nq, xq, k, D.data(), I.data());
    return I;
}

std::vector<idx_t> search_index_with_params(
    Index *index, const float *xq, IVFSearchParameters *params)
{
    int k = 10;
    std::vector<idx_t> I(k * nq);
    std::vector<float> D(k * nq);
    ivflib::search_with_parameters(index, nq, xq, k,
                                   D.data(), I.data(), params);
    return I;
}

/*************************************************************
 * Test functions for a given index type
 *************************************************************/

int test_params_override(const char *index_key, MetricType metric)
{
    std::vector<float> xb = make_data(nb); // database vectors
    auto index = make_index(index_key, metric, xb);
    //index->train(nb, xb.data());
    // index->add(nb, xb.data());
    std::vector<float> xq = make_data(nq);
    ParameterSpace ps;
    ps.set_index_parameter(index.get(), "nprobe", 2);
    auto res2ref = search_index(index.get(), xq.data());
    ps.set_index_parameter(index.get(), "nprobe", 9);
    auto res9ref = search_index(index.get(), xq.data());
    ps.set_index_parameter(index.get(), "nprobe", 1);

    IVFSearchParameters params;
    params.max_codes = 0;
    params.nprobe = 2;
    auto res2new = search_index_with_params(index.get(), xq.data(), &params);
    params.nprobe = 9;
    auto res9new = search_index_with_params(index.get(), xq.data(), &params);

    if (res2ref != res2new)
        return 2;

    if (res9ref != res9new)
        return 9;

    return 0;
}

} // namespace

/*************************************************************
 * Test entry points
 *************************************************************/

TEST(TPO, IVFFlat)
{
    int err1 = test_params_override("IVF32,Flat", METRIC_L2);
    EXPECT_EQ(err1, 0);
    int err2 = test_params_override("IVF32,Flat", METRIC_INNER_PRODUCT);
    EXPECT_EQ(err2, 0);
}

TEST(TPO, IVFPQ)
{
    int err1 = test_params_override("IVF32,PQ8np", METRIC_L2);
    EXPECT_EQ(err1, 0);
    int err2 = test_params_override("IVF32,PQ8np", METRIC_INNER_PRODUCT);
    EXPECT_EQ(err2, 0);
}

TEST(TPO, IVFSQ)
{
    int err1 = test_params_override("IVF32,SQ8", METRIC_L2);
    EXPECT_EQ(err1, 0);
    int err2 = test_params_override("IVF32,SQ8", METRIC_INNER_PRODUCT);
    EXPECT_EQ(err2, 0);
}

TEST(TPO, IVFFlatPP)
{
    int err1 = test_params_override("PCA16,IVF32,SQ8", METRIC_L2);
    EXPECT_EQ(err1, 0);
    int err2 = test_params_override("PCA16,IVF32,SQ8", METRIC_INNER_PRODUCT);
    EXPECT_EQ(err2, 0);
}

/*************************************************************
 * Same for binary indexes
 *************************************************************/

std::vector<uint8_t> make_data_binary(int64_t n)
{
    std::random_device rd;  //Will be used to obtain a seed for the random number engine
    std::mt19937 gen(rd()); //Standard mersenne_twister_engine seeded with rd()
    std::uniform_int_distribution<> dis(0, INT8_MAX-1);
    std::vector<uint8_t> database(n * d / 8);
    for (int64_t i = 0; i < n * d / 8; i++)
    {
        database[i] = dis(gen);
    }
    return database;
}

std::unique_ptr<IndexBinaryIVF> make_index(const char *index_type,
                                           const std::vector<uint8_t> &x)
{

    auto index = std::unique_ptr<IndexBinaryIVF>(dynamic_cast<IndexBinaryIVF *>(index_binary_factory(d, index_type)));
    index->train(nb, x.data());
    index->add(nb, x.data());
    return index;
}

std::vector<idx_t> search_index(IndexBinaryIVF *index, const uint8_t *xq)
{
    int k = 10;
    std::vector<idx_t> I(k * nq);
    std::vector<int32_t> D(k * nq);
    index->search(nq, xq, k, D.data(), I.data());
    return I;
}

std::vector<idx_t> search_index_with_params(
    IndexBinaryIVF *index, const uint8_t *xq, IVFSearchParameters *params)
{
    int k = 10;
    std::vector<idx_t> I(k * nq);
    std::vector<int32_t> D(k * nq);

    std::vector<idx_t> Iq(params->nprobe * nq);
    std::vector<int32_t> Dq(params->nprobe * nq);

    index->quantizer->search(nq, xq, params->nprobe,
                             Dq.data(), Iq.data());
    index->search_preassigned(nq, xq, k, Iq.data(), Dq.data(),
                              D.data(), I.data(),
                              false, params);
    return I;
}

int test_params_override_binary(const char *index_key)
{
    std::vector<uint8_t> xb = make_data_binary(nb); // database vectors
    auto index = make_index(index_key, xb);
    index->train(nb, xb.data());
    index->add(nb, xb.data());
    std::vector<uint8_t> xq = make_data_binary(nq);
    index->nprobe = 2;
    auto res2ref = search_index(index.get(), xq.data());
    index->nprobe = 9;
    auto res9ref = search_index(index.get(), xq.data());
    index->nprobe = 1;

    IVFSearchParameters params;
    params.max_codes = 0;
    params.nprobe = 2;
    auto res2new = search_index_with_params(index.get(), xq.data(), &params);
    params.nprobe = 9;
    auto res9new = search_index_with_params(index.get(), xq.data(), &params);

    if (res2ref != res2new)
        return 2;

    if (res9ref != res9new)
        return 9;

    return 0;
}

TEST(TPOB, IVF)
{
    int err1 = test_params_override_binary("BIVF32");
    EXPECT_EQ(err1, 0);
}
