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
      - x86_64-pc-msys    : POSIX emulation layer (WRONG for Python extensions)
      - x86_64-w64-mingw32: Native Windows target (CORRECT)
    We detect which one we have by checking `g++ -dumpmachine`, and when we
    find an MSYS2-native one we derive the MSYS2 root from its path and look
    for the mingw64/ucrt64 sub-environment there.
    """
    def _machine(exe):
        try:
            return subprocess.check_output(
                [exe, "-dumpmachine"], stderr=subprocess.DEVNULL, timeout=5
            ).decode().strip()
        except Exception:
            return ""

    msys2_roots = set()

    # First pass: PATH-visible compilers
    for cxx in [
        "x86_64-w64-mingw32-g++",  # explicit MinGW-w64 name
        "/mingw64/bin/g++",          # MSYS2 mingw64 shell env
        "/ucrt64/bin/g++",           # MSYS2 ucrt64 shell env
        "/clang64/bin/g++",
        "g++",                       # generic fallback
    ]:
        exe = shutil.which(cxx) or (cxx if os.path.isfile(cxx) else None)
        if not exe:
            continue
        m = _machine(exe)
        if "mingw" in m:
            print(f"[build] Compiler: {exe}  (target: {m})")
            return exe
        if "msys" in m or "cygwin" in m:
            # Derive MSYS2 root: .../msys64/usr/bin/g++.EXE → .../msys64
            root = os.path.dirname(os.path.dirname(os.path.dirname(exe)))
            if os.path.isdir(root):
                msys2_roots.add(root)
            print(f"[build] Skipping {exe} (target: {m} — not a Windows-native toolchain)")

    # Second pass: look inside the detected MSYS2 installation for mingw64/ucrt64
    for root in msys2_roots:
        for subenv in ["mingw64", "ucrt64", "clang64", "mingw32"]:
            cxx = os.path.join(root, subenv, "bin", "g++.exe")
            if not os.path.isfile(cxx):
                continue
            m = _machine(cxx)
            if "mingw" in m:
                print(f"[build] Compiler: {cxx}  (target: {m})")
                return cxx

    print(
        "[build] ERROR: No MinGW-w64 compiler found.\n"
        "        Open an MSYS2 terminal and run:\n"
        "          pacman -S mingw-w64-x86_64-gcc\n"
        "        The compiler will be installed to C:\\msys64\\mingw64\\bin\\g++.exe"
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

# Ensure the compiler's bin directory is in PATH so it can find its own DLLs
# (WebStorm may not include C:\msys64\mingw64\bin in its environment).
build_env = os.environ.copy()
compiler_bin = os.path.dirname(os.path.abspath(compiler))
if compiler_bin not in build_env.get("PATH", "").split(os.pathsep):
    build_env["PATH"] = compiler_bin + os.pathsep + build_env.get("PATH", "")

result = subprocess.run(cmd, stdin=subprocess.DEVNULL, env=build_env)

if result.returncode == 0:
    print(f"Success! Built: bindings{extension_suffix}")
else:
    print("Build failed.")
    sys.exit(result.returncode)
