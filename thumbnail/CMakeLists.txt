cmake_minimum_required(VERSION 3.15)
project(ani-thumbnail)

set(CMAKE_CXX_FLAGS "-fvisibility-inlines-hidden")
add_executable(ani-thumbnail main.cpp gen_thumbnails.cpp read_exif.cpp exif.cpp)

target_include_directories(ani-thumbnail SYSTEM PRIVATE ${Boost_INCLUDE_DIRS})
target_include_directories(ani-thumbnail PRIVATE ${ANI_THIRDPARTY_DIR})
target_include_directories(ani-thumbnail PRIVATE ${ANI_DIR}/easyipc)
target_include_directories(ani-thumbnail PRIVATE ${ANI_DIR}/ipc-message)

target_link_libraries(ani-thumbnail easyipc ipc_message ThreadPool)
target_link_libraries(ani-thumbnail ${Boost_LIBRARIES})
target_link_libraries(ani-thumbnail ${PNG_LIB})
target_link_libraries(ani-thumbnail ${JPEG_LIB})
target_link_libraries(ani-thumbnail ${Z_LIB})
