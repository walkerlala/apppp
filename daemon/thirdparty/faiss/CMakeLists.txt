project(faiss)

cmake_minimum_required(VERSION 3.10.2)

set(CMAKE_CXX_FLAGS "-fopenmp") # compile and link flag
include_directories(${CMAKE_SOURCE_DIR}/include)
add_definitions("-Wall" "-Wno-sign-compare" "-g" "-std=c++1z")
add_definitions("-mavx2") #avx256
add_definitions("-DFINTEGER=int") #openblas

file(GLOB FAISS_IMPL_SOURCE ${CMAKE_SOURCE_DIR}/impl/*.cpp)
file(GLOB FAISS_UTILS_SOURCE ${CMAKE_SOURCE_DIR}/utils/*.cpp)
SET(FAISS_SOURCE ${FAISS_IMPL_SOURCE} ${FAISS_UTILS_SOURCE})

set(MKL_LIB_DIR ${CMAKE_CURRENT_SOURCE_DIR}/mkl)
set(MKL_LIBS ${MKL_LIB_DIR}/libmkl_core.a
     ${MKL_LIB_DIR}/libmkl_intel_lp64.a
     ${MKL_LIB_DIR}/libmkl_gnu_thread.a
     ${MKL_LIB_DIR}/libmkl_lapack95_lp64.a
     ${MKL_LIB_DIR}/libmkl_core.a
     ${MKL_LIB_DIR}/libmkl_intel_lp64.a
     ${MKL_LIB_DIR}/libmkl_gnu_thread.a
     ${MKL_LIB_DIR}/libmkl_lapack95_lp64.a
     ${MKL_LIB_DIR}/libmkl_core.a
     ${MKL_LIB_DIR}/libmkl_intel_lp64.a
     ${MKL_LIB_DIR}/libmkl_gnu_thread.a
     ${MKL_LIB_DIR}/libmkl_lapack95_lp64.a
     ${MKL_LIB_DIR}/libmkl_core.a)

add_library(faiss ${FAISS_SOURCE})
target_link_libraries(faiss ${MKL_LIBS} ${MKL_LIBS} dl)

add_subdirectory(tutorial)
