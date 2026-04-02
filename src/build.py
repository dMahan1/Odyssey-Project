import glob
import os
import subprocess
import sys
import sysconfig

import pybind11

# On Windows + MinGW, pybind11 unconditionally defines PYBIND11_COMPAT_STRDUP
# to `strdup`, which is hidden in strict C++20 mode (__STRICT_ANSI__).
# Patch the installed header to use _strdup instead before compiling.
def _patch_pybind11_mingw():
    OLD = "#    define PYBIND11_COMPAT_STRDUP strdup"
    NEW = "#    define PYBIND11_COMPAT_STRDUP _strdup"

    candidates = [
        pybind11.get_include() + "/pybind11/detail/common.h",
        pybind11.get_include() + "/pybind11/pybind11.h",
    ]
    for header in candidates:
        if not os.path.exists(header):
            continue
        with open(header, "r", encoding="utf-8") as f:
            src = f.read()
        if OLD not in src:
            print(f"[build] pybind11 already patched: {header}")
            return
        with open(header, "w", encoding="utf-8") as f:
            f.write(src.replace(OLD, NEW))
        print(f"[build] pybind11 patched: {header}")
        return
    print("[build] pybind11 patch pattern not found — skipping")

# Run from project root regardless of CWD
_here = os.path.dirname(os.path.abspath(__file__))
_root = os.path.dirname(_here)
os.chdir(_root)

if sys.platform == "win32":
    _patch_pybind11_mingw()

# Include paths
includes = [
    pybind11.get_include(),
    sysconfig.get_path("include"),
    os.path.join(_root, "src", "include"),
]

extension_suffix = sysconfig.get_config_var("EXT_SUFFIX")

source_files = glob.glob("src/apps/*.cpp")
if not source_files:
    print("Error: No source files found in src/apps/")
    sys.exit(1)

compiler = "g++" if sys.platform == "win32" else "c++"

cmd = [
    compiler,
    "-O3", "-Wall", "-shared", "-std=c++20", "-fPIC",
    *source_files,
    *[f"-I{i}" for i in includes],
    "-o", f"src/bindings{extension_suffix}",
]

if sys.platform == "win32":
    cmd += ["-D_hypot=hypot"]
elif sys.platform == "darwin":
    cmd += ["-undefined", "dynamic_lookup"]

print(f"Building for {sys.platform}...")
result = subprocess.run(cmd, stdin=subprocess.DEVNULL)

if result.returncode == 0:
    print(f"Success! Built: bindings{extension_suffix}")
else:
    print("Build failed.")
    sys.exit(result.returncode)
