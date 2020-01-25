/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// -*- c++ -*-

#include <faiss/OnDiskInvertedLists.h>

#include <mutex>
#include <condition_variable>
#include <thread>

#include <unordered_set>
#include <filesystem>

#include <faiss/FaissAssert.h>
#include <faiss/utils/utils.h>
#include <faiss/utils/crossplatform.h>

namespace faiss
{

/**********************************************
 * LockLevels
 **********************************************/

struct LockLevels
{
    /* There n times lock1(n), one lock2 and one lock3
     * Invariants:
     *    a single thread can hold one lock1(n) for some n
     *    a single thread can hold lock2, if it holds lock1(n) for some n
     *    a single thread can hold lock3, if it holds lock1(n) for some n
     *       AND lock2 AND no other thread holds lock1(m) for m != n
     */
    std::mutex mutex1;
    std::condition_variable level1_cv;
    std::condition_variable level2_cv;
    std::condition_variable level3_cv;

    std::unordered_set<int> level1_holders; // which level1 locks are held
    int n_level2;                           // nb threads that wait on level2
    bool level3_in_use;                     // a threads waits on level3
    bool level2_in_use;

    LockLevels()
    {
        n_level2 = 0;
        level2_in_use = false;
        level3_in_use = false;
    }

    ~LockLevels() {}

    void lock_1(int no)
    {
        std::unique_lock lk(mutex1);
        level1_cv.wait(lk, [this, no]() {
            return this->level3_in_use || this->level1_holders.count(no) > 0;
        });
        level1_holders.insert(no);
    }

    void unlock_1(int no)
    {
        std::unique_lock lk(mutex1);
        assert(level1_holders.count(no) == 1);
        level1_holders.erase(no);
        if (level3_in_use)
        { // a writer is waiting
            level3_cv.notify_one();
        }
        else
        {
            level1_cv.notify_all();
        }
    }

    void lock_2()
    {
        std::unique_lock lk(mutex1);
        n_level2++;
        if (level3_in_use)
        { // tell waiting level3 that we are blocked
            level3_cv.notify_one();
        }
        level2_cv.wait(lk, [this]() {
            return this->level2_in_use;
        });
        level2_in_use = true;
    }

    void unlock_2()
    {
        std::unique_lock lk(mutex1);
        level2_in_use = false;
        n_level2--;
        level2_cv.notify_one();
    }

    void lock_3()
    {
        std::unique_lock lk(mutex1);
        level3_in_use = true;
        // wait until there are no level1 holders anymore except the
        // ones that are waiting on level2 (we are holding lock2)
        level3_cv.wait(lk, [this]() {
            return this->level1_holders.size() > this->n_level2;
        });
        // don't release the lock!
        lk.release();
    }

    void unlock_3()
    {
        level3_in_use = false;
        // wake up all level1_holders
        level1_cv.notify_all();
        mutex1.unlock();
    }

    void print()
    {
        std::unique_lock lk(mutex1);
        printf("State: level3_in_use=%d n_level2=%d level1_holders: [", level3_in_use, n_level2);
        for (int k : level1_holders)
        {
            printf("%d ", k);
        }
        printf("]\n");
    }
};

/**********************************************
 * OngoingPrefetch
 **********************************************/

struct OnDiskInvertedLists::OngoingPrefetch
{
    static void one_list(OngoingPrefetch *pf)
    {
        while (true)
        {
            idx_t list_no = pf->get_next_list();
            if (list_no == -1)
                break;
            const OnDiskInvertedLists *od = pf->od;
            od->locks->lock_1(list_no);
            int64_t n = od->list_size(list_no);
            const Index::idx_t *idx = od->get_ids(list_no);
            const uint8_t *codes = od->get_codes(list_no);
            int cs = 0;
            for (int64_t i = 0; i < n; i++)
            {
                cs += idx[i];
            }
            const idx_t *codes8 = (const idx_t *)codes;
            idx_t n8 = n * od->code_size / 8;

            for (int64_t i = 0; i < n8; i++)
            {
                cs += codes8[i];
            }
            od->locks->unlock_1(list_no);

            global_cs += cs & 1;
            continue;
        }
    }

    std::vector<std::thread> threads;

    std::mutex list_ids_mutex;
    std::vector<idx_t> list_ids;
    int cur_list;

    // mutex for the list of tasks
    std::mutex mutex;

    // pretext to avoid code below to be optimized out
    static int global_cs;

    const OnDiskInvertedLists *od;

    explicit OngoingPrefetch(const OnDiskInvertedLists *od) : od(od)
    {
        cur_list = 0;
    }

    idx_t get_next_list()
    {
        idx_t list_no = -1;
        {
            std::unique_lock lk(list_ids_mutex);
            if (cur_list >= 0 && cur_list < list_ids.size())
            {
                list_no = list_ids[cur_list++];
            }
        }
        return list_no;
    }

    void prefetch_lists(const idx_t *list_nos, int n)
    {
        std::unique_lock lk1(mutex);

        {
            std::unique_lock lk2(list_ids_mutex);
            list_ids.clear();
        }

        for (auto &th : threads)
        {
            th.join();
        }

        threads.resize(0);
        cur_list = 0;
        int nt = std::min(n, od->prefetch_nthread);

        if (nt > 0)
        {
            // prepare tasks
            for (int i = 0; i < n; i++)
            {
                idx_t list_no = list_nos[i];
                if (list_no >= 0 && od->list_size(list_no) > 0)
                {
                    list_ids.push_back(list_no);
                }
            }
            // prepare threads
            for (int i = 0; i < nt; i++)
            {
                threads.emplace_back(one_list, this);
            }
        }
    }

    ~OngoingPrefetch()
    {
        std::unique_lock lk(mutex);
        for (auto &th : threads)
        {
            th.join();
        }
    }
};

int OnDiskInvertedLists::OngoingPrefetch::global_cs = 0;

void OnDiskInvertedLists::prefetch_lists(const idx_t *list_nos, int n) const
{
    pf->prefetch_lists(list_nos, n);
}

/**********************************************
 * OnDiskInvertedLists: mmapping
 **********************************************/

void OnDiskInvertedLists::do_mmap()
{
    const char *rw_flags = read_only ? "r" : "r+";
    int prot = read_only ? PROT_READ : PROT_WRITE | PROT_READ;
    FILE *f = fopen(filename.c_str(), rw_flags);
    FAISS_THROW_IF_NOT_FMT(f, "could not open %s in mode %s: %s",
                           filename.c_str(), rw_flags, strerror(errno));

    uint8_t *ptro = (uint8_t *)faiss_mmap(nullptr, totsize, prot, MAP_SHARED, fileno(f), 0);

    FAISS_THROW_IF_NOT_FMT(ptro != MAP_FAILED,
                           "could not mmap %s: %s",
                           filename.c_str(),
                           strerror(errno));
    ptr = ptro;
    fclose(f);
}

void OnDiskInvertedLists::update_totsize(int64_t new_size)
{

    // unmap file
    if (ptr != nullptr)
    {
        int err = faiss_munmap(ptr, totsize);
        FAISS_THROW_IF_NOT_FMT(err == 0, "munmap error: %s",
                               strerror(errno));
    }
    if (totsize == 0)
    {
        // must create file before truncating it
        FILE *f = fopen(filename.c_str(), "w");
        FAISS_THROW_IF_NOT_FMT(f, "could not open %s in mode W: %s",
                               filename.c_str(), strerror(errno));
        fclose(f);
    }

    if (new_size > totsize)
    {
        if (!slots.empty() &&
            slots.back().offset + slots.back().capacity == totsize)
        {
            slots.back().capacity += new_size - totsize;
        }
        else
        {
            slots.push_back(Slot(totsize, new_size - totsize));
        }
    }
    else
    {
        assert(!"not implemented");
    }

    totsize = new_size;

    // create file
    printf("resizing %s to  %" PRId64 " bytes\n", filename.c_str(), totsize);

    std::filesystem::resize_file(filename, totsize);

    do_mmap();
}

/**********************************************
 * OnDiskInvertedLists
 **********************************************/

#define INVALID_OFFSET (int64_t)(-1)

OnDiskInvertedLists::List::List() : size(0), capacity(0), offset(INVALID_OFFSET)
{
}

OnDiskInvertedLists::Slot::Slot(int64_t offset, int64_t capacity) : offset(offset), capacity(capacity)
{
}

OnDiskInvertedLists::Slot::Slot() : offset(0), capacity(0)
{
}

OnDiskInvertedLists::OnDiskInvertedLists(
    int64_t nlist, int64_t code_size,
    const char *filename) : InvertedLists(nlist, code_size),
                            filename(filename),
                            totsize(0),
                            ptr(nullptr),
                            read_only(false),
                            locks(new LockLevels()),
                            pf(new OngoingPrefetch(this)),
                            prefetch_nthread(32)
{
    lists.resize(nlist);

    // slots starts empty
}

OnDiskInvertedLists::OnDiskInvertedLists() : OnDiskInvertedLists(0, 0, "")
{
}

OnDiskInvertedLists::~OnDiskInvertedLists()
{
    delete pf;

    // unmap all lists
    if (ptr != nullptr)
    {
        int err = faiss_munmap(ptr, totsize);
        if (err != 0)
        {
            fprintf(stderr, "mumap error: %s",
                    strerror(errno));
        }
    }
    delete locks;
}

int64_t OnDiskInvertedLists::list_size(int64_t list_no) const
{
    return lists[list_no].size;
}

const uint8_t *OnDiskInvertedLists::get_codes(int64_t list_no) const
{
    if (lists[list_no].offset == INVALID_OFFSET)
    {
        return nullptr;
    }

    return ptr + lists[list_no].offset;
}

const Index::idx_t *OnDiskInvertedLists::get_ids(int64_t list_no) const
{
    if (lists[list_no].offset == INVALID_OFFSET)
    {
        return nullptr;
    }

    return (const idx_t *)(ptr + lists[list_no].offset +
                           code_size * lists[list_no].capacity);
}

void OnDiskInvertedLists::update_entries(
    int64_t list_no, int64_t offset, int64_t n_entry,
    const idx_t *ids_in, const uint8_t *codes_in)
{
    FAISS_THROW_IF_NOT(!read_only);
    if (n_entry == 0)
        return;
    const List &l = lists[list_no];
    assert(n_entry + offset <= l.size);
    idx_t *ids = const_cast<idx_t *>(get_ids(list_no));
    memcpy(ids + offset, ids_in, sizeof(ids_in[0]) * n_entry);
    uint8_t *codes = const_cast<uint8_t *>(get_codes(list_no));
    memcpy(codes + offset * code_size, codes_in, code_size * n_entry);
}

int64_t OnDiskInvertedLists::add_entries(
    int64_t list_no, int64_t n_entry,
    const idx_t *ids, const uint8_t *code)
{
    FAISS_THROW_IF_NOT(!read_only);
    locks->lock_1(list_no);
    int64_t o = list_size(list_no);
    resize_locked(list_no, n_entry + o);
    update_entries(list_no, o, n_entry, ids, code);
    locks->unlock_1(list_no);
    return o;
}

void OnDiskInvertedLists::resize(int64_t list_no, int64_t new_size)
{
    FAISS_THROW_IF_NOT(!read_only);
    locks->lock_1(list_no);
    resize_locked(list_no, new_size);
    locks->unlock_1(list_no);
}

void OnDiskInvertedLists::resize_locked(int64_t list_no, int64_t new_size)
{
    List &l = lists[list_no];

    if (new_size <= l.capacity &&
        new_size > l.capacity / 2)
    {
        l.size = new_size;
        return;
    }

    // otherwise we release the current slot, and find a new one

    locks->lock_2();
    free_slot(l.offset, l.capacity);

    List new_l;

    if (new_size == 0)
    {
        new_l = List();
    }
    else
    {
        new_l.size = new_size;
        new_l.capacity = 1;
        while (new_l.capacity < new_size)
        {
            new_l.capacity *= 2;
        }
        new_l.offset = allocate_slot(
            new_l.capacity * (sizeof(idx_t) + code_size));
    }

    // copy common data
    if (l.offset != new_l.offset)
    {
        int64_t n = std::min(new_size, l.size);
        if (n > 0)
        {
            memcpy(ptr + new_l.offset, get_codes(list_no), n * code_size);
            memcpy(ptr + new_l.offset + new_l.capacity * code_size,
                   get_ids(list_no), n * sizeof(idx_t));
        }
    }

    lists[list_no] = new_l;
    locks->unlock_2();
}

int64_t OnDiskInvertedLists::allocate_slot(int64_t capacity)
{
    // should hold lock2

    auto it = slots.begin();
    while (it != slots.end() && it->capacity < capacity)
    {
        it++;
    }

    if (it == slots.end())
    {
        // not enough capacity
        int64_t new_size = totsize == 0 ? 32 : totsize * 2;
        while (new_size - totsize < capacity)
            new_size *= 2;
        locks->lock_3();
        update_totsize(new_size);
        locks->unlock_3();
        it = slots.begin();
        while (it != slots.end() && it->capacity < capacity)
        {
            it++;
        }
        assert(it != slots.end());
    }

    int64_t o = it->offset;
    if (it->capacity == capacity)
    {
        slots.erase(it);
    }
    else
    {
        // take from beginning of slot
        it->capacity -= capacity;
        it->offset += capacity;
    }

    return o;
}

void OnDiskInvertedLists::free_slot(int64_t offset, int64_t capacity)
{

    // should hold lock2
    if (capacity == 0)
        return;

    auto it = slots.begin();
    while (it != slots.end() && it->offset <= offset)
    {
        it++;
    }

    int64_t inf = 1UL << 60;

    int64_t end_prev = inf;
    if (it != slots.begin())
    {
        auto prev = it;
        prev--;
        end_prev = prev->offset + prev->capacity;
    }

    int64_t begin_next = 1L << 60;
    if (it != slots.end())
    {
        begin_next = it->offset;
    }

    assert(end_prev == inf || offset >= end_prev);
    assert(offset + capacity <= begin_next);

    if (offset == end_prev)
    {
        auto prev = it;
        prev--;
        if (offset + capacity == begin_next)
        {
            prev->capacity += capacity + it->capacity;
            slots.erase(it);
        }
        else
        {
            prev->capacity += capacity;
        }
    }
    else
    {
        if (offset + capacity == begin_next)
        {
            it->offset -= capacity;
            it->capacity += capacity;
        }
        else
        {
            slots.insert(it, Slot(offset, capacity));
        }
    }

    // TODO shrink global storage if needed
}

/*****************************************
 * Compact form
 *****************************************/

int64_t OnDiskInvertedLists::merge_from(const InvertedLists **ils, int n_il,
                                        bool verbose)
{
    FAISS_THROW_IF_NOT_MSG(totsize == 0, "works only on an empty InvertedLists");

    std::vector<int64_t> sizes(nlist);
    for (int i = 0; i < n_il; i++)
    {
        const InvertedLists *il = ils[i];
        FAISS_THROW_IF_NOT(il->nlist == nlist && il->code_size == code_size);

        for (int64_t j = 0; j < nlist; j++)
        {
            sizes[j] += il->list_size(j);
        }
    }

    int64_t cums = 0;
    int64_t ntotal = 0;
    for (int64_t j = 0; j < nlist; j++)
    {
        ntotal += sizes[j];
        lists[j].size = 0;
        lists[j].capacity = sizes[j];
        lists[j].offset = cums;
        cums += lists[j].capacity * (sizeof(idx_t) + code_size);
    }

    update_totsize(cums);

    int64_t nmerged = 0;
    double t0 = getmillisecs(), last_t = t0;

#pragma omp parallel for
    for (int64_t j = 0; j < nlist; j++)
    {
        List &l = lists[j];
        for (int i = 0; i < n_il; i++)
        {
            const InvertedLists *il = ils[i];
            int64_t n_entry = il->list_size(j);
            l.size += n_entry;
            update_entries(j, l.size - n_entry, n_entry,
                           ScopedIds(il, j).get(),
                           ScopedCodes(il, j).get());
        }
        assert(l.size == l.capacity);
        if (verbose)
        {
#pragma omp critical
            {
                nmerged++;
                double t1 = getmillisecs();
                if (t1 - last_t > 500)
                {
                    printf("merged  %" PRId64 " lists in %.3f s\r",
                           nmerged, (t1 - t0) / 1000.0);
                    fflush(stdout);
                    last_t = t1;
                }
            }
        }
    }
    if (verbose)
    {
        printf("\n");
    }

    return ntotal;
}

void OnDiskInvertedLists::crop_invlists(int64_t l0, int64_t l1)
{
    FAISS_THROW_IF_NOT(0 <= l0 && l0 <= l1 && l1 <= nlist);

    std::vector<List> new_lists(l1 - l0);
    memcpy(new_lists.data(), &lists[l0], (l1 - l0) * sizeof(List));

    lists.swap(new_lists);

    nlist = l1 - l0;
}

} // namespace faiss
