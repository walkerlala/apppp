cmake_minimum_required(VERSION 3.15)
project(thumbnail)

set(CMAKE_CXX_STANDARD 17)

include_directories(../third_party/ThreadPool)

add_subdirectory(../easyipc easyipc)
add_subdirectory(../ipc-message ipc-message)

include_directories(/usr/local/include)
include_directories(../easyipc)
include_directories(../ipc-message)
include_directories(../third_party/boost)

set(CMAKE_CXX_FLAGS "-fvisibility-inlines-hidden")
add_executable(thumbnail main.cpp gen_thumbnails.cpp)
target_link_directories(thumbnail PRIVATE ../third_party/boost/stage/lib)
target_link_libraries(thumbnail
        easyipc
        ipc_message
        -lprotobuf
        -ljpeg
        -lpng
        -lboost_filesystem
        -lboost_random
        -L/usr/local/lib)
