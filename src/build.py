import glob
import os
import subprocess
import sys
import sysconfig

import pybind11

# 1. Get ALL necessary include paths upfront
includes = [
    pybind11.get_include(False),  # Main pybind11 headers
    pybind11.get_include(True),  # pybind11-specific python headers
    sysconfig.get_path("include"),  # THE FIX: Standard Python.h headers
    os.path.abspath("src/include"),  # Your local project headers
]

# 2. Extension suffix
extension_suffix = sysconfig.get_config_var("EXT_SUFFIX")

# 3. Source files
source_files = glob.glob("src/apps/*.cpp")

if not source_files:
    print("Error: No source files found in src/apps/")
    sys.exit(1)

# 4. Construct the Command
if sys.platform == "win32":
    # MSVC (Visual Studio) Logic
    cmd = [
        "cl",
        "/O2",
        "/W3",
        "/LD",
        "/std:c++20",
        "/EHsc",
        *source_files,
        *[f"/I{i}" for i in includes],
        f"/Fe:bindings{extension_suffix}",
    ]
else:
    # Unix-like (Linux/macOS) Logic
    cmd = [
        "g++",
        "-O3",
        "-Wall",
        "-shared",
        "-std=c++20",
        "-fPIC",
        *source_files,
        *[f"-I{i}" for i in includes],
        "-o",
        f"src/bindings{extension_suffix}",
    ]

    # macOS specific flag
    if sys.platform == "darwin":
        cmd += ["-undefined", "dynamic_lookup"]

# 5. Run the build
print(f"Building for {sys.platform}...")
# Print each include for debugging if it fails again
for inc in includes:
    print(f"  Including: {inc}")

result = subprocess.run(cmd)

if result.returncode == 0:
    print(f"\nSuccess! Built: bindings{extension_suffix}")
else:
    print("\nBuild failed.")
