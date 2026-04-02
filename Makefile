PYTHON ?= python

ifeq ($(OS),Windows_NT)
    CXX := g++
else
    CXX ?= c++
endif

CXXFLAGS := -O3 -Wall -shared -std=c++20 -fPIC

PYBIND11_INC := $(shell "$(PYTHON)" -c "import pybind11; print(pybind11.get_include())")
PYTHON_INC   := $(shell "$(PYTHON)" -c "import sysconfig; print(sysconfig.get_path('include'))")
EXT_SUFFIX   := $(shell "$(PYTHON)" -c "import sysconfig; print(sysconfig.get_config_var('EXT_SUFFIX'))")

INCLUDES := -I"$(PYBIND11_INC)" -I"$(PYTHON_INC)" -Isrc/include
SOURCES  := $(wildcard src/apps/*.cpp)
TARGET   := src/bindings$(EXT_SUFFIX)

ifeq ($(OS),Windows_NT)
    CXXFLAGS += -D_hypot=hypot
else
    UNAME := $(shell uname -s)
    ifeq ($(UNAME),Darwin)
        CXXFLAGS += -undefined dynamic_lookup
    endif
endif

.PHONY: all clean

all: $(TARGET)

$(TARGET): $(SOURCES)
	$(CXX) $(CXXFLAGS) $(SOURCES) $(INCLUDES) -o $@

clean:
	rm -f $(TARGET)
