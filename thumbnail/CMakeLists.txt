cmake_minimum_required(VERSION 3.15)
project(thumbnail)

set(CMAKE_CXX_STANDARD 17)

find_package(Boost 1.72.0 REQUIRED)

include_directories(../ThreadPool)

add_subdirectory(../easyipc easyipc)
add_subdirectory(../ipc-message ipc-message)

include_directories(/usr/local/include)
include_directories(../easyipc)
include_directories(../ipc-message)

add_executable(thumbnail main.cpp)
target_link_libraries(thumbnail
        easyipc
        ipc_message
        -lprotobuf
        -ljpeg
        -lpng
        -lboost_filesystem
        -lboost_random
        -L/usr/local/lib)
