"""DeepDTA+ package."""

import os

# Prevent Windows Anaconda OpenMP conflict and deadlocks
os.environ.setdefault("KMP_DUPLICATE_LIB_OK", "TRUE")
os.environ.setdefault("OMP_NUM_THREADS", "1")
os.environ.setdefault("MKL_NUM_THREADS", "1")
os.environ.setdefault("OPENBLAS_NUM_THREADS", "1")

__version__ = "0.1.0"
