add_library(ThreadPool ThreadPool.cpp)
if (UNIX)
    target_link_libraries(ThreadPool pthread)
endif()