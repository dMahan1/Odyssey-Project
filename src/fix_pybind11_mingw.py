"""
Patch all pybind11 headers that unconditionally define PYBIND11_COMPAT_STRDUP
to `strdup` — which is hidden in strict C++20 mode on MinGW (__STRICT_ANSI__).
Replaces every occurrence across both pybind11.h and detail/common.h with
_strdup, the Windows CRT equivalent that is always available.

This script is idempotent: running it multiple times is safe.
"""

import os
import sys
import pybind11

OLD = "#    define PYBIND11_COMPAT_STRDUP strdup"
NEW = "#    define PYBIND11_COMPAT_STRDUP _strdup"

candidates = [
    pybind11.get_include() + "/pybind11/detail/common.h",
    pybind11.get_include() + "/pybind11/pybind11.h",
]

found_any = False
for header in candidates:
    if not os.path.exists(header):
        continue
    with open(header, "r", encoding="utf-8") as f:
        src = f.read()
    if OLD not in src:
        print(f"[fix_pybind11_mingw] Already patched: {header}", flush=True)
        found_any = True
        continue
    with open(header, "w", encoding="utf-8") as f:
        f.write(src.replace(OLD, NEW))
    print(f"[fix_pybind11_mingw] Patched: {header}", flush=True)
    found_any = True

if not found_any:
    print("[fix_pybind11_mingw] No matching headers found — skipping", flush=True)
