#!/bin/bash

source .venv/bin/activate

g++ -O3 -Wall -shared -std=c++20 -fPIC src/apps/*.cpp -I src/include $(python3 -m pybind11 --includes) -o bindings$(python3-config --extension-suffix)
