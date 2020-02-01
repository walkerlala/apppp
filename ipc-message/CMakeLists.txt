cmake_minimum_required(VERSION 3.10)
project(ipc_message)

set(CMAKE_CXX_STANDARD 17)

file(GLOB source_files
        "./ipc-message/*.h"
        "./ipc-message/*.cpp"
        "./ipc-message/*.cc")

add_library(ipc_message STATIC ${source_files})
if (WIN32)
    target_link_libraries(ipc_message protobuf::libprotobuf protobuf::libprotobuf-lite)
else()
    target_link_libraries(ipc_message protobuf)
endif()
