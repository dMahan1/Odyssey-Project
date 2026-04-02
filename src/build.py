import glob
import os
import shutil
import subprocess
import sys
import sysconfig

import pybind11


def _find_mingw_compiler():
    """
    Find a g++ that targets Windows natively (x86_64-w64-mingw32).
    MSYS2 ships two separate compilers:
      - x86_64-pc-msys   : POSIX emulation layer (WRONG for Python extensions)
      - x86_64-w64-mingw32: Native Windows target (CORRECT)
    We detect which one we have by checking `g++ -dumpmachine`.
    """
    candidates = [
        # Explicit MinGW-w64 cross-compiler name (works in MSYS2 + standalone)
        "x86_64-w64-mingw32-g++",
        # MSYS2 environment-specific paths (mingw64 / ucrt64 / clang64)
        "/mingw64/bin/g++",
        "/ucrt64/bin/g++",
        "/clang64/bin/g++",
        # Generic fallback — might be MinGW-w64 OR MSYS2 native
        "g++",
    ]
    for cxx in candidates:
        exe = shutil.which(cxx) or (cxx if os.path.isfile(cxx) else None)
        if not exe:
            continue
        try:
            machine = subprocess.check_output(
                [exe, "-dumpmachine"], stderr=subprocess.DEVNULL, timeout=5
            ).decode().strip()
        except Exception:
            continue
        if "mingw" in machine:
            print(f"[build] Compiler: {exe}  (target: {machine})")
            return exe
        # Found a compiler but it targets MSYS2/Cygwin — skip with a warning
        print(f"[build] Skipping {exe} (target: {machine} — not a Windows-native toolchain)")

    print(
        "[build] ERROR: No MinGW-w64 compiler found.\n"
        "        Install one via MSYS2: pacman -S mingw-w64-x86_64-gcc\n"
        "        Then reopen WebStorm so the new PATH is picked up."
    )
    sys.exit(1)


def _patch_pybind11_strdup():
    """
    Patch pybind11 headers to use _strdup instead of strdup.

    In MinGW-w64, _strdup is the Windows CRT form and is declared in
    <string.h> without any __STRICT_ANSI__ guard.  strdup (the POSIX form)
    is hidden by __STRICT_ANSI__, which -std=c++20 sets unconditionally.
    """
    OLD = "#    define PYBIND11_COMPAT_STRDUP strdup"
    NEW = "#    define PYBIND11_COMPAT_STRDUP _strdup"
    for header in [
        pybind11.get_include() + "/pybind11/detail/common.h",
        pybind11.get_include() + "/pybind11/pybind11.h",
    ]:
        if not os.path.exists(header):
            continue
        with open(header, "r", encoding="utf-8") as f:
            src = f.read()
        if OLD not in src:
            continue  # already patched or not present in this file
        with open(header, "w", encoding="utf-8") as f:
            f.write(src.replace(OLD, NEW))
        print(f"[build] pybind11 patched (strdup → _strdup): {header}")


# ── Run from project root regardless of CWD ──────────────────────────────────
_here = os.path.dirname(os.path.abspath(__file__))
_root = os.path.dirname(_here)
os.chdir(_root)

if sys.platform == "win32":
    compiler = _find_mingw_compiler()
    _patch_pybind11_strdup()
else:
    compiler = "c++"

# ── Includes / sources / output ───────────────────────────────────────────────
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

cmd = [
    compiler,
    "-O3", "-Wall", "-shared", "-std=c++20", "-fPIC",
    *source_files,
    *[f"-I{i}" for i in includes],
    "-o", f"src/bindings{extension_suffix}",
]

if sys.platform == "win32":
    # -D_hypot=hypot  : fixes naming mismatch in Python's Windows math headers
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
