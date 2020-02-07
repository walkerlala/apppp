cmake_minimum_required(VERSION 3.0 FATAL_ERROR)
project(classifier)

add_library(classify src/classify.cpp src/infer.cpp src/opencvutils.cpp src/torchutils.cpp)

target_include_directories(classify PRIVATE includes)
target_link_libraries(classify "${TORCH_LIBRARIES}")
target_link_libraries(classify "${OpenCV_LIBS}")

add_executable(example examples/example.cpp)
target_link_libraries(example classify)
target_include_directories(example PRIVATE includes)

add_executable(classifier src/main.cpp)

target_include_directories(classifier PRIVATE includes ${Boost_INCLUDE_DIRS})
target_include_directories(classifier PRIVATE ${GFLAGS_INCLUDE_DIR} ${GLOG_INCLUDE_DIR})
target_include_directories(classifier PRIVATE ${FMT_INCLUDE_DIR})
target_include_directories(classifier PRIVATE ${ANI_THIRDPARTY_DIR})
target_include_directories(classifier PRIVATE ${ANI_DIR}/easyipc)
target_include_directories(classifier PRIVATE ${ANI_DIR}/ipc-message)

target_link_libraries(classifier classify easyipc ipc_message)
target_link_libraries(classifier ${Boost_LIBRARIES})
target_link_libraries(classifier ${GFLAGS_LIB} ${GLOG_LIB})
target_link_libraries(classifier ${FMT_LIB})

# install necessary asset files to bin
install(FILES asset/classifier.conf
              asset/labels.txt
              asset/model_pretrained.pth
        DESTINATION ${CMAKE_BINARY_DIR}/bin/classifier_asset)