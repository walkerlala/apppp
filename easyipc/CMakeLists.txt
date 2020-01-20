cmake_minimum_required(VERSION 3.12)
project(easyipc)

set(CMAKE_CXX_STANDARD 14)

include_directories(../ThreadPool)
add_library(easyipc easyipc.cpp easyipc.h utils.h ../ThreadPool)

add_executable(example example.cpp)
target_link_libraries(example easyipc)
