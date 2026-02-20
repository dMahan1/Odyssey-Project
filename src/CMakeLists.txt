cmake_minimum_required(VERSION 3.4)
project(UserClass)
set(CMAKE_CXX_STANDARD 11)

# set pybind11 dir
set(pybind11_DIR /Users/Caleb/Softwares/pybind11)
find_package(pybind11 REQUIRED)

# set custom python interpreter(under macos)
link_libraries(/Users/Caleb/miniforge3/envs/py38/lib/libpython3.8.dylib)

add_executable(UserClass User.cpp)

target_link_libraries(UserClass PRIVATE pybind11::embed)
