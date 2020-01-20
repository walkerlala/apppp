project(faiss)

cmake_minimum_required(VERSION 3.10.2)

set(CMAKE_CXX_FLAGS "-fopenmp")
include_directories(${CMAKE_SOURCE_DIR}/include)
add_definitions("-Wall" "-Wno-sign-compare" "-g" "-std=c++1z")
add_definitions("-mavx2") #avx256
add_definitions("-DFINTEGER=int") #openblas
add_definitions("-fopenmp") #openmp

file(GLOB FAISS_IMPL_SOURCE ${CMAKE_SOURCE_DIR}/impl/*.cpp)
file(GLOB FAISS_UTILS_SOURCE ${CMAKE_SOURCE_DIR}/utils/*.cpp)
MESSAGE(STATUS "Impl source files: ${FAISS_IMPL_SOURCE}")
MESSAGE(STATUS "Util source files: ${FAISS_UTILS_SOURCE}")
SET(FAISS_SOURCE ${FAISS_IMPL_SOURCE} ${FAISS_UTILS_SOURCE})
MESSAGE(STATUS "\n")
MESSAGE(STATUS "Faiss source files: ${FAISS_SOURCE}")

add_library(faiss ${FAISS_SOURCE})
target_link_libraries(faiss openblas lapack)

add_subdirectory(tutorial)
