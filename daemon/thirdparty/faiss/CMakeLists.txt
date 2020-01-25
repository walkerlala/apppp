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

set(OPENBLAS_LIBS openblas gfortran)

add_library(faiss ${FAISS_SOURCE})
target_link_libraries(faiss ${OPENBLAS_LIBS} ${DL})

add_subdirectory(tutorial)
add_subdirectory(tests)
