cmake_minimum_required(VERSION 3.12)
project(easyipc)

set(CMAKE_CXX_STANDARD 14)

set(CMAKE_CXX_FLAGS "-fvisibility-inlines-hidden")
include_directories(../ThreadPool)
add_library(easyipc easyipc.cpp easyipc.h utils.h ../third_party/ThreadPool)

add_executable(example example.cpp)
target_link_libraries(example easyipc)
