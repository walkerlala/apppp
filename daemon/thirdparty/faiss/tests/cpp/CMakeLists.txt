cmake_minimum_required(VERSION 3.10.2)

file(GLOB FAISS_TESTS_SOURCE ${CMAKE_CURRENT_SOURCE_DIR}/*.cpp)

add_executable(gtest_faiss ${FAISS_TESTS_SOURCE})
target_link_libraries(gtest_faiss faiss gtest gtest_main ${OPENBLAS_LIBS} ${DL})
set_target_properties(gtest_faiss PROPERTIES RUNTIME_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/gtest-out")
