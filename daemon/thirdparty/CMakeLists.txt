add_subdirectory(faiss)

if (${MKL_LIB_DIR} STREQUAL "")
    add_subdirectory(openblas)
endif()