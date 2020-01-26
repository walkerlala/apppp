if (NOT DEFINED MKL_LIB_DIR AND NOT WIN32)
    MESSAGE(STATUS "Building openblas")
    add_subdirectory(openblas)
elseif(DEFINED WIN32)
    MESSAGE(STATUS "Use openblas static lib")
    SET(OPENBLAS_STATIC_LIB ${CMAKE_CURRENT_SOURCE_DIR}/staticlibs/openblas/lib/libopenblas.a)
endif()

add_subdirectory(faiss)