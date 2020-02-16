cmake_minimum_required(VERSION 3.0 FATAL_ERROR)
project(classifier)

add_library(classify src/classify.cpp src/infer.cpp src/opencvutils.cpp src/torchutils.cpp)

target_include_directories(classify PRIVATE includes)
target_link_libraries(classify "${TORCH_LIBRARIES}")
target_link_libraries(classify "${OpenCV_LIBS}")

# example executable to use classifier API
add_executable(classify-example examples/example.cpp)
target_link_libraries(classify-example classify)
target_include_directories(classify-example PRIVATE includes)

# benchmark of classifier API (without RPC cost)
add_executable(classify-benchmark examples/benchmark.cpp)
target_link_libraries(classify-benchmark classify ${Boost_LIBRARIES})
target_include_directories(classify-benchmark PRIVATE includes ${Boost_INCLUDE_DIRS})

# example executable to use classifier-server RPC service
add_executable(classify-client examples/client.cpp)
target_include_directories(classify-client PRIVATE includes ${Boost_INCLUDE_DIRS})
target_include_directories(classify-client PRIVATE ${GFLAGS_INCLUDE_DIR} ${GLOG_INCLUDE_DIR} ${FMT_INCLUDE_DIR})
target_include_directories(classify-client PRIVATE ${ANI_THIRDPARTY_DIR})
target_include_directories(classify-client PRIVATE ${ANI_DIR}/easyipc ${ANI_DIR}/ipc-message)
target_link_libraries(classify-client easyipc ipc_message ThreadPool)
target_link_libraries(classify-client ${Boost_LIBRARIES})
target_link_libraries(classify-client ${GFLAGS_LIB} ${GLOG_LIB})
target_link_libraries(classify-client ${FMT_LIB})

# classifier (server) executable
add_executable(classifier src/main.cpp)

target_include_directories(classifier PRIVATE includes ${Boost_INCLUDE_DIRS})
target_include_directories(classifier PRIVATE ${GFLAGS_INCLUDE_DIR} ${GLOG_INCLUDE_DIR})
target_include_directories(classifier PRIVATE ${FMT_INCLUDE_DIR})
target_include_directories(classifier PRIVATE ${ANI_THIRDPARTY_DIR})
target_include_directories(classifier PRIVATE ${ANI_DIR}/easyipc)
target_include_directories(classifier PRIVATE ${ANI_DIR}/ipc-message)

target_link_libraries(classifier classify easyipc ipc_message ThreadPool)
target_link_libraries(classifier ${Boost_LIBRARIES})
target_link_libraries(classifier ${GFLAGS_LIB} ${GLOG_LIB})
target_link_libraries(classifier ${FMT_LIB})

# install necessary asset files to bin
install(FILES asset/classifier.conf
              asset/labels.txt
              asset/reset18_cpu.pth
              asset/mobilenet_v2_cpu.pth
        DESTINATION ${CMAKE_BINARY_DIR}/bin/classifier_asset)