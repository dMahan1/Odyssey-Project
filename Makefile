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
    # Patch pybind11 to use _strdup instead of strdup (hidden in strict C++20/MinGW).
    # Also remap _hypot -> hypot for Python/MinGW compatibility.
    CXXFLAGS += -D_hypot=hypot
    PATCH_CMD := "$(PYTHON)" src/fix_pybind11_mingw.py
else
    UNAME := $(shell uname -s)
    ifeq ($(UNAME),Darwin)
        CXXFLAGS += -undefined dynamic_lookup
    endif
    PATCH_CMD :=
endif

.PHONY: all clean patch-pybind11

all: patch-pybind11 $(TARGET)

patch-pybind11:
ifneq ($(PATCH_CMD),)
	$(PATCH_CMD)
endif

$(TARGET): $(SOURCES)
	$(CXX) $(CXXFLAGS) $(SOURCES) $(INCLUDES) -o $@

clean:
	rm -f $(TARGET)
