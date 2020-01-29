/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#include <cstdio>
#include <cstdlib>
#include <random>

#include <gtest/gtest.h>

#include <faiss/IndexIVFPQ.h>
#include <faiss/IndexFlat.h>
#include <faiss/utils/utils.h>
#include <faiss/utils/distances.h>


namespace {

// dimension of the vectors to index
int d = 64;

// size of the database we plan to index
int64_t nb = 8000;


double eval_codec_error (int64_t ncentroids, int64_t m, const std::vector<float> &v)
{
    faiss::IndexFlatL2 coarse_quantizer (d);
    faiss::IndexIVFPQ index (&coarse_quantizer, d,
                             ncentroids, m, 8);
    index.pq.cp.niter = 10; // speed up train
    index.train (nb, v.data());

    // encode and decode to compute reconstruction error

    std::vector<faiss::Index::idx_t> keys (nb);
    std::vector<uint8_t> codes (nb * m);
    index.encode_multiple (nb, keys.data(), v.data(), codes.data(), true);

    std::vector<float> v2 (nb * d);
    index.decode_multiple (nb, keys.data(), codes.data(), v2.data());

    return faiss::fvec_L2sqr (v.data(), v2.data(), nb * d);
}

}  // namespace


TEST(IVFPQ, codec) {
    std::random_device rd;  //Will be used to obtain a seed for the random number engine
    std::mt19937 gen(rd()); //Standard mersenne_twister_engine seeded with rd()
    std::uniform_real_distribution<> dis(0.0, 1.0);

    std::vector <float> database (nb * d);
    for (int64_t i = 0; i < nb * d; i++) {
        database[i] = dis(gen);
    }

    double err0 = eval_codec_error(16, 8, database);

    // should be more accurate as there are more coarse centroids
    double err1 = eval_codec_error(128, 8, database);
    EXPECT_GT(err0, err1);

    // should be more accurate as there are more PQ codes
    double err2 = eval_codec_error(16, 16, database);
    EXPECT_GT(err0, err2);
}
