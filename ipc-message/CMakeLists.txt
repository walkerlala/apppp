cmake_minimum_required(VERSION 3.10)
project(ipc_message)

file(GLOB source_files
        "./ipc-message/*.h"
        "./ipc-message/*.cpp"
        "./ipc-message/*.cc")

add_library(ipc_message STATIC ${source_files})
target_link_libraries(ipc_message ${ANI_PROTOBUF_LIBS})
