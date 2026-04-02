import glob
import os
import subprocess
import sys
import sysconfig

import pybind11

# On Windows + MinGW, -std=c++20 defines __STRICT_ANSI__ which hides strdup
# from MinGW's <string.h>. We pass -U__STRICT_ANSI__ to the compiler so
# strdup is visible again. pybind11's original `strdup` macro is correct;
# revert any previous _strdup patches we may have applied.
def _restore_pybind11_strdup():
    PATCHED   = "#    define PYBIND11_COMPAT_STRDUP _strdup"
    ORIGINAL  = "#    define PYBIND11_COMPAT_STRDUP strdup"

    candidates = [
        pybind11.get_include() + "/pybind11/detail/common.h",
        pybind11.get_include() + "/pybind11/pybind11.h",
    ]
    for header in candidates:
        if not os.path.exists(header):
            continue
        with open(header, "r", encoding="utf-8") as f:
            src = f.read()
        if PATCHED in src:
            with open(header, "w", encoding="utf-8") as f:
                f.write(src.replace(PATCHED, ORIGINAL))
            print(f"[build] pybind11 reverted to strdup: {header}")
        # else: already original, nothing to do

# Run from project root regardless of CWD
_here = os.path.dirname(os.path.abspath(__file__))
_root = os.path.dirname(_here)
os.chdir(_root)

if sys.platform == "win32":
    _restore_pybind11_strdup()

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
    # -U__STRICT_ANSI__: un-hides strdup (and other POSIX names) from MinGW
    #   headers without enabling _GNU_SOURCE (which would set LONG_BIT=64 and
    #   conflict with Python's pyport.h on Windows LLP64).
    # -D_hypot=hypot: fixes naming mismatch in Python's Windows math headers.
    cmd += ["-U__STRICT_ANSI__", "-D_hypot=hypot"]
elif sys.platform == "darwin":
    cmd += ["-undefined", "dynamic_lookup"]

print(f"Building for {sys.platform}...")
result = subprocess.run(cmd, stdin=subprocess.DEVNULL)

if result.returncode == 0:
    print(f"Success! Built: bindings{extension_suffix}")
else:
    print("Build failed.")
    sys.exit(result.returncode)
