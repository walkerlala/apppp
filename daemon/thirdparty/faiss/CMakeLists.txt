cmake_minimum_required(VERSION 3.10.2)

include_directories(${CMAKE_CURRENT_SOURCE_DIR}/include)

file(GLOB FAISS_IMPL_SOURCE ${CMAKE_CURRENT_SOURCE_DIR}/impl/*.cpp)
file(GLOB FAISS_UTILS_SOURCE ${CMAKE_CURRENT_SOURCE_DIR}/utils/*.cpp)
SET(FAISS_SOURCE ${FAISS_IMPL_SOURCE} ${FAISS_UTILS_SOURCE})

set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -fopenmp") # compile and link flag
add_definitions("-Wall" "-Wno-sign-compare" "-g" "-std=c++1z")
add_definitions("-mavx2") #avx256
add_definitions("-DFINTEGER=int")

if (UNIX)
    set(DL "dl")
endif()

if (NOT ${MKL_LIB_DIR} STREQUAL "")
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
    set(OPENBLAS_LIBS ${MKL_LIBS} ${MKL_LIBS})
    MESSAGE(STATUS "Using mkl libs at: ${MKL_LIB_DIR}")
else()
    set(OPENBLAS_LIBS openblas gfortran)
endif()

add_library(faiss ${FAISS_SOURCE})
target_link_libraries(faiss ${OPENBLAS_LIBS} ${DL})

add_subdirectory(tutorial)
add_subdirectory(tests)
