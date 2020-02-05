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

#### print all cmake variables
#MESSAGE(STATUS "--------------------------------------------")
#get_cmake_property(_variableNames VARIABLES)
#list (SORT _variableNames)
#foreach (_variableName ${_variableNames})
#    message(STATUS "${_variableName}=${${_variableName}}")
#endforeach()
#MESSAGE(STATUS "--------------------------------------------")

find_package(ZLIB PATHS ${ANI_THIRDPARTY_INSTALL_DIR})

######## Variables from protobuf-targets.cmake ############
#
# protobuf-targets.cmake add this variable but does not specify
# the locations. Other libs (such as pytorch) use these variables
# and will get something like "protobuf::libprotobuf-NOTFOUND"
# So we define them ourself so that reference to them will be OK
#
########################################################## 
# Create imported target protobuf::libprotobuf-lite
add_library(protobuf::libprotobuf-lite STATIC IMPORTED)
set_target_properties(protobuf::libprotobuf-lite PROPERTIES
  IMPORTED_LOCATION ${ANI_THIRDPARTY_INSTALL_DIR}/lib/libprotobuf-lite.a
)
# Create imported target protobuf::libprotobuf
add_library(protobuf::libprotobuf STATIC IMPORTED)
set_target_properties(protobuf::libprotobuf PROPERTIES
  IMPORTED_LOCATION ${ANI_THIRDPARTY_INSTALL_DIR}/lib/libprotobuf.a
)
# Create imported target protobuf::libprotoc
add_library(protobuf::libprotoc STATIC IMPORTED)
set_target_properties(protobuf::libprotoc PROPERTIES
  IMPORTED_LOCATION ${ANI_THIRDPARTY_INSTALL_DIR}/lib/libprotoc.a
  INTERFACE_LINK_LIBRARIES "protobuf::libprotobuf"
)

# protobuf libs reference by internal sub-modules
find_library(PROTOBUF_LIB
             NAMES "libprotobuf.a" "libprotobuf.lib"
             PATHS ${ANI_THIRDPARTY_INSTALL_DIR}/lib)
find_library(PROTOBUF_LITE_LIB
             NAMES "libprotobuf-lite.a" "libprotobuf-lite.lib"
             PATHS ${ANI_THIRDPARTY_INSTALL_DIR}/lib)
find_library(PROTO_C_LIB
             NAMES "libprotoc.a" "libprotoc.lib"
             PATHS ${ANI_THIRDPARTY_INSTALL_DIR}/lib)
set(ANI_PROTOBUF_LIBS ${PROTOBUF_LIB} ${PROTOBUF_LITE_LIB} ${PROTO_C_LIB})

find_library(Z_LIB
             NAMES "libz.a" "zlibstatic.lib"
             PATHS ${ANI_THIRDPARTY_INSTALL_DIR}/lib)
find_library(PNG_LIB
             NAMES "libpng.a" "libpng16_static.lib"
             PATHS ${ANI_THIRDPARTY_INSTALL_DIR}/lib)
find_library(JPEG_LIB
             NAMES "libjpeg.a" "jpeg-static.lib"
             PATHS ${ANI_THIRDPARTY_INSTALL_DIR}/lib)

find_package(Torch REQUIRED PATHS ${ANI_THIRDPARTY_INSTALL_DIR}/libtorch)
find_package(OpenCV REQUIRED PATHS ${ANI_THIRDPARTY_INSTALL_DIR}/opencv)

set(Boost_USE_STATIC_LIBS ON)
find_package(Boost 1.70 REQUIRED
             COMPONENTS filesystem random # Boost_LIBRARIES will define these components
             PATHS ${ANI_BOOST_INSTALL_DIR})
MESSAGE(STATUS "Boost_LIBRARIES: ${Boost_LIBRARIES}")


if (UNIX AND NOT APPLE)
    set(CMAKE_EXE_LINKER_FLAGS "-static-libgcc -static-libstdc++")
endif()

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_ARCHIVE_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/lib) # static lib
set(CMAKE_LIBRARY_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/lib) # dynamic lib
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin) # executable

# the main daemon process
add_executable(daemon main.cpp)
target_include_directories(daemon SYSTEM PRIVATE ${Boost_INCLUDE_DIRS})
target_link_libraries(daemon ${Boost_LIBRARIES})


add_subdirectory(thirdparty)
#add_subdirectory(daemon)
add_subdirectory(easyipc)
add_subdirectory(ipc-message)
add_subdirectory(thumbnail)
add_subdirectory(classifier)
