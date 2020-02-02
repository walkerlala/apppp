cmake_minimum_required(VERSION 3.15)
project(ani-thumbnail)

set(CMAKE_CXX_STANDARD 17)

set(CMAKE_CXX_FLAGS "-fvisibility-inlines-hidden")
add_executable(ani-thumbnail main.cpp gen_thumbnails.cpp read_exif.cpp exif.cpp)

MESSAGE(STATUS "Boost_LIBRARIES: ${Boost_LIBRARIES}")

target_include_directories(ani-thumbnail SYSTEM PRIVATE ${Boost_INCLUDE_DIRS})
target_include_directories(ani-thumbnail PRIVATE ${ANI_THIRDPARTY_DIR}/ThreadPool)
target_include_directories(ani-thumbnail PRIVATE ${ANI_DIR}/easyipc)
target_include_directories(ani-thumbnail PRIVATE ${ANI_DIR}/ipc-message)

target_link_libraries(ani-thumbnail easyipc ipc_message)
target_link_libraries(ani-thumbnail ${Boost_LIBRARIES})
target_link_libraries(ani-thumbnail jpeg)
target_link_libraries(ani-thumbnail png)
