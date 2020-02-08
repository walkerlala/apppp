cmake_minimum_required(VERSION 3.12)
project(easyipc)

set(CMAKE_CXX_FLAGS "-fvisibility-inlines-hidden")
add_library(easyipc STATIC easyipc.cpp)
target_include_directories(easyipc PRIVATE ${ANI_THIRDPARTY_DIR})

add_executable(easyipc_example example.cpp)
target_link_libraries(easyipc_example easyipc ThreadPool)
target_include_directories(easyipc_example PRIVATE ${ANI_THIRDPARTY_DIR})