#include "ThreadPool.h"

thread_local ThreadPool* ThreadPool::tp_owner = nullptr;
thread_local size_t ThreadPool::task_id = 4294967296;