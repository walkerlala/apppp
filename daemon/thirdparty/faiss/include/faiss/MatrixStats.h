/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// -*- c++ -*-

#pragma once

#include <cinttypes>
#include <vector>
#include <string>
#include <unordered_map>
#include <stdint.h>


namespace faiss {


/** Reports some statistics on a dataset and comments on them.
 *
 * It is a class rather than a function so that all stats can also be
 * accessed from code */

struct MatrixStats {
    MatrixStats (int64_t n, int64_t d, const float *x);
    std::string comments;

    // raw statistics
    int64_t n, d;
    int64_t n_collision, n_valid, n0;
    double min_norm2, max_norm2;

    struct PerDimStats {
        int64_t n, n_nan, n_inf, n0;

        float min, max;
        double sum, sum2;

        int64_t n_valid;
        double mean, stddev;

        PerDimStats();
        void add (float x);
        void compute_mean_std ();
    };

    std::vector<PerDimStats> per_dim_stats;
    struct Occurrence {
        int64_t first;
        int64_t count;
    };
    std::unordered_map<uint64_t, Occurrence> occurrences;

    char *buf;
    int64_t nbuf;
    void do_comment (const char *fmt, ...);

};

} // namespace faiss
