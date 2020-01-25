cmake_minimum_required(VERSION 3.10.2)

add_executable(flat "1-Flat.cpp")
target_link_libraries(flat faiss ${MKL_LIBS} ${MKL_LIBS} dl)

add_executable(IVFFlat "2-IVFFlat.cpp")
target_link_libraries(IVFFlat faiss ${MKL_LIBS} ${MKL_LIBS} dl)

add_executable(IVFPQ "3-IVFPQ.cpp")
target_link_libraries(IVFPQ faiss ${MKL_LIBS} ${MKL_LIBS} dl)
