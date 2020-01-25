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
#include <faiss/index_io.h>

TEST(IVFPQ, accuracy)
{

    // dimension of the vectors to index
    int d = 64;

    // size of the database we plan to index
    int64_t nb = 1000;

    // make a set of nt training vectors in the unit cube
    // (could be the database)
    int64_t nt = 1500;

    // make the index object and train it
    faiss::IndexFlatL2 coarse_quantizer(d);

    // a reasonable number of cetroids to index nb vectors
    int ncentroids = 25;

    faiss::IndexIVFPQ index(&coarse_quantizer, d,
                            ncentroids, 16, 8);

    // index that gives the ground-truth
    faiss::IndexFlatL2 index_gt(d);

    {                           // training
        std::random_device rd;  //Will be used to obtain a seed for the random number engine
        std::mt19937 gen(rd()); //Standard mersenne_twister_engine seeded with rd()
        std::uniform_real_distribution<> dis(0.0, 1.0);
        std::vector<float> trainvecs(nt * d);
        for (int64_t i = 0; i < nt * d; i++)
        {
            trainvecs[i] = dis(gen);
        }
        index.verbose = true;
        index.train(nt, trainvecs.data());
    }

    {                           // populating the database
        std::random_device rd;  //Will be used to obtain a seed for the random number engine
        std::mt19937 gen(rd()); //Standard mersenne_twister_engine seeded with rd()
        std::uniform_real_distribution<> dis(0.0, 1.0);
        std::vector<float> database(nb * d);
        for (int64_t i = 0; i < nb * d; i++)
        {
            database[i] = dis(gen);
        }

        index.add(nb, database.data());
        index_gt.add(nb, database.data());
    }

    int nq = 200;
    int n_ok;

    { // searching the database

        std::random_device rd;  //Will be used to obtain a seed for the random number engine
        std::mt19937 gen(rd()); //Standard mersenne_twister_engine seeded with rd()
        std::uniform_real_distribution<> dist(0.0, 1.0);
        std::vector<float> queries(nq * d);
        for (int64_t i = 0; i < nq * d; i++)
        {
            queries[i] = dist(gen);
        }

        std::vector<faiss::Index::idx_t> gt_nns(nq);
        std::vector<float> gt_dis(nq);

        index_gt.search(nq, queries.data(), 1,
                        gt_dis.data(), gt_nns.data());

        index.nprobe = 5;
        int k = 5;
        std::vector<faiss::Index::idx_t> nns(k * nq);
        std::vector<float> dis(k * nq);

        index.search(nq, queries.data(), k, dis.data(), nns.data());

        n_ok = 0;
        for (int q = 0; q < nq; q++)
        {

            for (int i = 0; i < k; i++)
                if (nns[q * k + i] == gt_nns[q])
                    n_ok++;
        }
        EXPECT_GT(n_ok, nq * 0.4);
    }
}
