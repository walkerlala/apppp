/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#include <cstdio>
#include <cstdlib>
#include <random>

#include <faiss/IndexFlat.h>
#include <faiss/IndexIVFPQ.h>


int main() {
    int d = 64;                            // dimension
    int nb = 100000;                       // database size
    int nq = 10000;                        // nb of queries

    float *xb = new float[d * nb];
    float *xq = new float[d * nq];

    std::random_device rd;  //Will be used to obtain a seed for the random number engine
    std::mt19937 gen(rd()); //Standard mersenne_twister_engine seeded with rd()
    std::uniform_real_distribution<> dis(0.0, 1.0);

    for(int i = 0; i < nb; i++) {
        for(int j = 0; j < d; j++)
            xb[d * i + j] = dis(gen);
        xb[d * i] += i / 1000.;
    }

    for(int i = 0; i < nq; i++) {
        for(int j = 0; j < d; j++)
            xq[d * i + j] = dis(gen);
        xq[d * i] += i / 1000.;
    }


    int nlist = 100;
    int k = 4;
    int m = 8;                             // bytes per vector
    faiss::IndexFlatL2 quantizer(d);       // the other index
    faiss::IndexIVFPQ index(&quantizer, d, nlist, m, 8);
    // here we specify METRIC_L2, by default it performs inner-product search
    index.train(nb, xb);
    index.add(nb, xb);

    {       // sanity check
        int64_t *I = new int64_t[k * 5];
        float *D = new float[k * 5];

        index.search(5, xb, k, D, I);

        printf("I=\n");
        for(int i = 0; i < 5; i++) {
            for(int j = 0; j < k; j++)
                printf("%" PRId64, I[i * k + j]);
            printf("\n");
        }

        printf("D=\n");
        for(int i = 0; i < 5; i++) {
            for(int j = 0; j < k; j++)
                printf("%7g ", D[i * k + j]);
            printf("\n");
        }

        delete [] I;
        delete [] D;
    }

    {       // search xq
        int64_t *I = new int64_t[k * nq];
        float *D = new float[k * nq];

        index.nprobe = 10;
        index.search(nq, xq, k, D, I);

        printf("I=\n");
        for(int i = nq - 5; i < nq; i++) {
            for(int j = 0; j < k; j++)
                printf("%" PRId64, I[i * k + j]);
            printf("\n");
        }

        delete [] I;
        delete [] D;
    }



    delete [] xb;
    delete [] xq;

    return 0;
}
