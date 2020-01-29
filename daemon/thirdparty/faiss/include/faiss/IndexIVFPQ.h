/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// -*- c++ -*-

#ifndef FAISS_INDEX_IVFPQ_H
#define FAISS_INDEX_IVFPQ_H


#include <cinttypes>
#include <vector>

#include <faiss/IndexIVF.h>
#include <faiss/IndexPQ.h>


namespace faiss {

struct IVFPQSearchParameters: IVFSearchParameters {
    int64_t scan_table_threshold;   ///< use table computation or on-the-fly?
    int polysemous_ht;             ///< Hamming thresh for polysemous filtering
    ~IVFPQSearchParameters () {}
};


/** Inverted file with Product Quantizer encoding. Each residual
 * vector is encoded as a product quantizer code.
 */
struct IndexIVFPQ: IndexIVF {
    bool by_residual;              ///< Encode residual or plain vector?

    ProductQuantizer pq;           ///< produces the codes

    bool do_polysemous_training;   ///< reorder PQ centroids after training?
    PolysemousTraining *polysemous_training; ///< if NULL, use default

    // search-time parameters
    int64_t scan_table_threshold;   ///< use table computation or on-the-fly?
    int polysemous_ht;             ///< Hamming thresh for polysemous filtering

    /** Precompute table that speed up query preprocessing at some
     * memory cost
     * =-1: force disable
     * =0: decide heuristically (default: use tables only if they are
     *     < precomputed_tables_max_bytes)
     * =1: tables that work for all quantizers (size 256 * nlist * M)
     * =2: specific version for MultiIndexQuantizer (much more compact)
     */
    int use_precomputed_table;     ///< if by_residual, build precompute tables
    static int64_t precomputed_table_max_bytes;

    /// if use_precompute_table
    /// size nlist * pq.M * pq.ksub
    std::vector <float> precomputed_table;

    IndexIVFPQ (
            Index * quantizer, int64_t d, int64_t nlist,
            int64_t M, int64_t nbits_per_idx);

    void add_with_ids(idx_t n, const float* x, const idx_t* xids = nullptr)
        override;

    void encode_vectors(idx_t n, const float* x,
                        const idx_t *list_nos,
                        uint8_t * codes,
                        bool include_listnos = false) const override;

    void sa_decode (idx_t n, const uint8_t *bytes,
                    float *x) const override;


    /// same as add_core, also:
    /// - output 2nd level residuals if residuals_2 != NULL
    /// - use precomputed list numbers if precomputed_idx != NULL
    void add_core_o (idx_t n, const float *x,
                     const idx_t *xids, float *residuals_2,
                     const idx_t *precomputed_idx = nullptr);

    /// trains the product quantizer
    void train_residual(idx_t n, const float* x) override;

    /// same as train_residual, also output 2nd level residuals
    void train_residual_o (idx_t n, const float *x, float *residuals_2);

    void reconstruct_from_offset (int64_t list_no, int64_t offset,
                                  float* recons) const override;

    /** Find exact duplicates in the dataset.
     *
     * the duplicates are returned in pre-allocated arrays (see the
     * max sizes).
     *
     * @params lims   limits between groups of duplicates
     *                (max size ntotal / 2 + 1)
     * @params ids    ids[lims[i]] : ids[lims[i+1]-1] is a group of
     *                duplicates (max size ntotal)
     * @return n      number of groups found
     */
    int64_t find_duplicates (idx_t *ids, int64_t *lims) const;

    // map a vector to a binary code knowning the index
    void encode (idx_t key, const float * x, uint8_t * code) const;

    /** Encode multiple vectors
     *
     * @param n       nb vectors to encode
     * @param keys    posting list ids for those vectors (size n)
     * @param x       vectors (size n * d)
     * @param codes   output codes (size n * code_size)
     * @param compute_keys  if false, assume keys are precomputed,
     *                      otherwise compute them
     */
    void encode_multiple (int64_t n, idx_t *keys,
                          const float * x, uint8_t * codes,
                          bool compute_keys = false) const;

    /// inverse of encode_multiple
    void decode_multiple (int64_t n, const idx_t *keys,
                          const uint8_t * xcodes, float * x) const;

    InvertedListScanner *get_InvertedListScanner (bool store_pairs)
        const override;

    /// build precomputed table
    void precompute_table ();

    IndexIVFPQ ();

};


/// statistics are robust to internal threading, but not if
/// IndexIVFPQ::search_preassigned is called by multiple threads
struct IndexIVFPQStats {
    int64_t nrefine;  // nb of refines (IVFPQR)

    int64_t n_hamming_pass;
    // nb of passed Hamming distance tests (for polysemous)

    // timings measured with the CPU RTC
    // on all threads
    int64_t search_cycles;
    int64_t refine_cycles; // only for IVFPQR

    IndexIVFPQStats () {reset (); }
    void reset ();
};

// global var that collects them all
extern IndexIVFPQStats indexIVFPQ_stats;




} // namespace faiss


#endif
