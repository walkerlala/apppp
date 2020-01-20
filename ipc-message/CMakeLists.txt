cmake_minimum_required(VERSION 3.10)
project(ipc_message)

set(CMAKE_CXX_STANDARD 11)

file(GLOB source_files
        "./ipc-message/*.h"
        "./ipc-message/*.cpp"
        "./ipc-message/*.cc")

include_directories(/usr/local/include)

add_library(ipc_message ${source_files})
