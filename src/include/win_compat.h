#pragma once
#ifdef _WIN32
// MinGW + CPython compatibility shims for -std=c++20 mode.
// Force-included via -include so these definitions precede all source.

// M_PI and friends are behind _USE_MATH_DEFINES on Windows.
// Must be set before <math.h> is pulled in.
#define _USE_MATH_DEFINES
#include <math.h>

// strdup is hidden by __STRICT_ANSI__ (set by -std=c++20).
// _strdup is the Windows CRT equivalent and is always exposed.
#include <string.h>
#ifndef strdup
#define strdup _strdup
#endif

// Python's Windows headers declare _hypot; MinGW provides hypot.
#ifndef _hypot
#define _hypot hypot
#endif
#endif
