project(ani)

cmake_minimum_required(VERSION 3.10.2)

set(ANI_DIR ${CMAKE_SOURCE_DIR})
set(ANI_DAEMON_DIR ${CMAKE_CURRENT_SOURCE_DIR}/daemon)
set(ANI_EASYIPC_DIR ${CMAKE_CURRENT_SOURCE_DIR}/easyipc)
set(ANI_IPC_MESSAGE_DIR ${CMAKE_CURRENT_SOURCE_DIR}/ipc-message)
set(ANI_THIRDPARTY_DIR ${CMAKE_CURRENT_SOURCE_DIR}/thirdparty)
set(ANI_THIRDPARTY_BINARY_DIR ${CMAKE_CURRENT_BINARY_DIR}/thirdparty)
set(ANI_THUMBNAIL_DIR ${CMAKE_CURRENT_SOURCE_DIR}/thumbnail)

if (NOT DEFINED ANI_THIRDPARTY_INSTALL_DIR)
    MESSAGE(FATAL_ERROR "ANI_THIRDPARTY_INSTALL_DIR not defined. Forget to add -DANI_THIRDPARTY_INSTALL_DIR to cmake command ?")
endif()
if (NOT DEFINED ANI_BOOST_INSTALL_DIR)
    MESSAGE(FATAL_ERROR "ANI_BOOST_INSTALL_DIR not defined. Forget to add -DANI_BOOST_INSTALL_DIR to cmake command ?")
endif()

include_directories("${ANI_THIRDPARTY_INSTALL_DIR}/include")
link_directories("${ANI_THIRDPARTY_INSTALL_DIR}/lib")
find_package(protobuf PATHS ${ANI_THIRDPARTY_INSTALL_DIR})
find_package(ZLIB PATHS ${ANI_THIRDPARTY_INSTALL_DIR})
find_library(Z_LIB
             NAMES "libz.a" "zlibstatic.lib"
             PATHS ${ANI_THIRDPARTY_INSTALL_DIR}/lib)
find_library(PNG_LIB
             NAMES "libpng.a" "libpng16_static.lib"
             PATHS ${ANI_THIRDPARTY_INSTALL_DIR}/lib)
find_library(JPEG_LIB
             NAMES "libjpeg.a" "jpeg-static.lib"
             PATHS ${ANI_THIRDPARTY_INSTALL_DIR}/lib)

set(Boost_USE_STATIC_LIBS ON)
find_package(Boost 1.70 REQUIRED
             COMPONENTS filesystem random # Boost_LIBRARIES will define these components
             PATHS ${ANI_BOOST_INSTALL_DIR})

if (UNIX AND NOT APPLE)
    set(CMAKE_EXE_LINKER_FLAGS "-static-libgcc -static-libstdc++")
endif()

add_subdirectory(thirdparty)
#add_subdirectory(daemon)
add_subdirectory(easyipc)
add_subdirectory(ipc-message)
add_subdirectory(thumbnail)
