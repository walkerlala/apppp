cmake_minimum_required(VERSION 3.15)
project(ani-thumbnail)

set(CMAKE_CXX_STANDARD 17)

set(CMAKE_CXX_FLAGS "-fvisibility-inlines-hidden")
add_executable(ani-thumbnail main.cpp gen_thumbnails.cpp read_exif.cpp exif.cpp)

target_include_directories(ani-thumbnail SYSTEM PRIVATE ${ANI_THIRDPARTY_DIR}/boost)
target_include_directories(ani-thumbnail PRIVATE ${ANI_THIRDPARTY_DIR}/ThreadPool)
target_include_directories(ani-thumbnail PRIVATE ${ANI_DIR}/easyipc)
target_include_directories(ani-thumbnail PRIVATE ${ANI_DIR}/ipc-message)

target_link_directories(ani-thumbnail PRIVATE ${ANI_THIRDPARTY_DIR}/boost/stage/lib)
target_link_libraries(ani-thumbnail easyipc ipc_message)
if (UNIX)
    target_link_libraries(ani-thumbnail boost_filesystem boost_random)
endif()
target_link_libraries(ani-thumbnail jpeg)
target_link_libraries(ani-thumbnail png)