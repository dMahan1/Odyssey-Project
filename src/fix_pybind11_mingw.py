"""
Patch the installed pybind11.h so that PYBIND11_COMPAT_STRDUP maps to
_strdup (the Windows CRT equivalent) instead of strdup, which is hidden
in strict C++20 mode (-std=c++20 implies __STRICT_ANSI__ in MinGW).

This script is idempotent: running it multiple times is safe.
"""

import re
import sys
import pybind11

header = pybind11.get_include() + "/pybind11/detail/common.h"

OLD = "#    define PYBIND11_COMPAT_STRDUP strdup"
NEW = "#    define PYBIND11_COMPAT_STRDUP _strdup"

try:
    with open(header, "r", encoding="utf-8") as f:
        src = f.read()
except FileNotFoundError:
    # Older pybind11 versions put it directly in pybind11.h
    header = pybind11.get_include() + "/pybind11/pybind11.h"
    with open(header, "r", encoding="utf-8") as f:
        src = f.read()

if OLD not in src:
    print(f"[fix_pybind11_mingw] Already patched or pattern not found in {header} — skipping", flush=True)
    sys.exit(0)

patched = src.replace(OLD, NEW)
with open(header, "w", encoding="utf-8") as f:
    f.write(patched)

print(f"[fix_pybind11_mingw] Patched: {header}", flush=True)
