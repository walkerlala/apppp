cmake_minimum_required(VERSION 3.0 FATAL_ERROR)
project(cppinference)

find_package(Torch REQUIRED)
find_package(OpenCV REQUIRED)

add_library(classify src/classify.cpp src/infer.cpp src/opencvutils.cpp src/torchutils.cpp)

target_include_directories(classify PRIVATE includes)
target_link_libraries(classify "${TORCH_LIBRARIES}")
target_link_libraries(classify "${OpenCV_LIBS}")

set_property(TARGET classify PROPERTY CXX_STANDARD 14)

add_executable(example examples/example.cpp)
target_link_libraries(example classify)
target_include_directories(example PRIVATE includes)