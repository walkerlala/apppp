#pragma once

#include <condition_variable>
#include <functional>
#include <future>
#include <memory>
#include <mutex>
#include <queue>
#include <sstream>
#include <stdexcept>
#include <thread>
#include <vector>

#ifdef _WIN32
#include <processthreadsapi.h>
#include <windows.h>
#elif __linux__
#define _GNU_SOURCE
#include <pthread.h>
#endif

class ThreadPool final {
   public:
    static ThreadPool& GlobalPool() {
        static ThreadPool global_thread_pool("thread_pool", std::thread::hardware_concurrency());
        return global_thread_pool;
    }

    struct TaskT {
        TaskT() {}
        TaskT(size_t i, std::function<void()> f) : id(i), func(f) {}
        uint16_t id;
        std::function<void()> func;
    };

    size_t size() const { return workers.size(); }

    // check if the calling thread is a worker of this thread pool
    bool is_owner() const { return tp_owner == this; }

    // Add task without specifying task id
    template <class F, class... Args>
    auto add_task(F&& f, Args&&... args) -> std::future<typename std::result_of<F(Args...)>::type> {
        if (tp_owner == this)
            throw std::logic_error("add task in worker thread");

        auto task =
            std::make_shared<std::packaged_task<typename std::result_of<F(Args...)>::type()>>(
                std::bind(std::forward<F>(f), std::forward<Args>(args)...));

        auto res = task->get_future();
        {
            std::unique_lock<std::mutex> lock(queue_mutex);
            // don't allow enqueuing if we are stopping
            if (stop)
                throw std::runtime_error("add task on stopped thread pool");
            tasks.emplace(0u, [task]() { (*task)(); });
        }
        condition.notify_one();
        return res;
    }

    // Similar to add_task, but specify thread id
    template <class F, class... Args>
    auto add_taski(F&& f, uint16_t id, Args&&... args)
        -> std::future<typename std::result_of<F(Args...)>::type> {
        if (tp_owner == this)
            throw std::logic_error("add task in worker thread");

        auto task =
            std::make_shared<std::packaged_task<typename std::result_of<F(Args...)>::type()>>(
                std::bind(std::forward<F>(f), std::forward<Args>(args)...));

        auto res = task->get_future();
        {
            std::unique_lock<std::mutex> lock(queue_mutex);
            // don't allow enqueuing if we are stopping
            if (stop)
                throw std::runtime_error("add task on stopped thread pool");
            tasks.emplace(id, [task]() { (*task)(); });
        }
        condition.notify_one();
        return res;
    }

    thread_local static size_t task_id;
    size_t GetTaskID() const { return is_owner() ? task_id : 0u; }

   private:
    ThreadPool(const std::string& name, size_t sz = std::thread::hardware_concurrency())
        : name(name) {
        for (size_t i = 0; i < sz; ++i)
            workers.emplace_back([this, i]() {
                tp_owner = this;

                // set thread name
                // thread name is restricted to 16 characters, including the terminating null byte
                std::string suffix = "[" + std::to_string(i) + "]";
                std::string tname = this->name.substr(0, 15 - suffix.size()) + suffix;
#ifdef _WIN32
                HRESULT r = SetThreadDescription(GetCurrentThread(), tname);
#elif __linux__
                if (::pthread_setname_np(pthread_self(), tname.c_str()) != 0)
                    throw std::system_error(errno, std::system_category(),
                                            "failed to set thread name");
#elif __APPLE__
                if (::pthread_setname_np(tname.c_str()) != 0)
                    throw std::system_error(errno, std::system_category(),
                                            "failed to set thread name");
#endif  // _WIN32

                TaskT task;
                while (true) {
                    {
                        std::unique_lock<std::mutex> lock(queue_mutex);
                        condition.wait(lock, [this] { return this->stop || !this->tasks.empty(); });
                        if (stop && tasks.empty())
                            return;
                        task = std::move(tasks.front());
                        tasks.pop();
                    }

                    task_id = task.id;
                    task.func();
                    task_id = kInvalidTaskID;
                }
            });
    }
    const size_t kInvalidTaskID = 8832151515;
    ThreadPool(const ThreadPool&) = delete;
    void operator=(const ThreadPool&) = delete;

    ~ThreadPool() {
        {
            std::unique_lock<std::mutex> lock(queue_mutex);
            stop = true;
        }
        condition.notify_all();
        for (auto& worker : workers) worker.join();
    }

   private:
    thread_local static ThreadPool* tp_owner;
    std::vector<std::thread> workers;
    // std::queue<std::function<void()>> tasks;
    std::queue<TaskT> tasks;

    std::string name;
    std::mutex queue_mutex;
    std::condition_variable condition;
    bool stop = false;
};

// shortcut for waiting for a group of task to finish
template <typename T>
class result_set final {
    using FT = typename std::future<T>;

   public:
    result_set() {}
    void insert(FT&& v) { results.push_back(std::forward<FT>(v)); }
    size_t size() const { return results.size(); }
    T get(size_t i) { return results[i].get(); }
    void get_all() {
        for (auto&& result : results) result.get();
    }
    void get_all_with_except() {
        bool no_except = true;
        std::stringstream msg;
        for (auto&& result : results) try {
                result.get();
            } catch (std::exception& e) {
                no_except = false;
                msg << "Parallel worker run failed:" << e.what();
            } catch (...) {
                no_except = false;
                msg << "Parallel worker run failed";
            }
        if (!no_except) {
            throw std::runtime_error(msg.str());
        }
    }

   private:
    std::vector<FT> results;
};
