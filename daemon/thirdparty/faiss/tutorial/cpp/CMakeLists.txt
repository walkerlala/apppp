cmake_minimum_required(VERSION 3.10.2)

add_executable(flat "1-Flat.cpp")
target_link_libraries(flat faiss ${OPENBLAS_LIBS} ${DL})

add_executable(IVFFlat "2-IVFFlat.cpp")
target_link_libraries(IVFFlat faiss ${OPENBLAS_LIBS} ${DL})

add_executable(IVFPQ "3-IVFPQ.cpp")
target_link_libraries(IVFPQ faiss ${OPENBLAS_LIBS} ${DL})
