"""Pytest configuration for DeepDTA+."""

import os
import sys

# Ensure OpenMP does not crash or deadlock on Windows Anaconda
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["OPENBLAS_NUM_THREADS"] = "1"

# Use tiny 200-pair subset + 1 GBM seed so test_api.py finishes in seconds
os.environ["DEEPDTA_TEST_MODE"] = "1"

# Ensure src is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src")))
