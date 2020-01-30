project(ani)

cmake_minimum_required(VERSION 3.10.2)

set(ANI_DIR ${CMAKE_SOURCE_DIR})
set(ANI_DAEMON_DIR ${CMAKE_CURRENT_SOURCE_DIR}/daemon)
set(ANI_EASYIPC_DIR ${CMAKE_CURRENT_SOURCE_DIR}/easyipc)
set(ANI_IPC_MESSAGE_DIR ${CMAKE_CURRENT_SOURCE_DIR}/ipc-message)
set(ANI_THIRDPARTY_DIR ${CMAKE_CURRENT_SOURCE_DIR}/thirdparty)
set(ANI_THIRDPARTY_BINARY_DIR ${CMAKE_CURRENT_BINARY_DIR}/thirdparty)
set(ANI_THUMBNAIL_DIR ${CMAKE_CURRENT_SOURCE_DIR}/thumbnail)

include_directories("${ANI_THIRDPARTY_INSTALL_DIR}/include")
link_directories("${ANI_THIRDPARTY_INSTALL_DIR}/lib")
include("${ANI_THIRDPARTY_INSTALL_DIR}/lib/libpng/libpng16.cmake")
include("${ANI_THIRDPARTY_INSTALL_DIR}/cmake/protobuf-config.cmake")
include("${ANI_THIRDPARTY_INSTALL_DIR}/lib/cmake/ZLIB/ZLIBConfig.cmake")

add_subdirectory(thirdparty)
#add_subdirectory(daemon)
add_subdirectory(easyipc)
add_subdirectory(ipc-message)
add_subdirectory(thumbnail)
