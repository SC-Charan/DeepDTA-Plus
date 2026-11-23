"""Evaluate DeepDTA+ on the KIBA dataset (official setting 1 random split).

Produces metrics that can be compared directly to the original DeepDTA paper
(Öztürk et al., 2018). Results are printed and optionally appended to
results/metrics.json when --update-metrics is passed.

Usage:
    python scripts/eval_kiba.py
    python scripts/eval_kiba.py --update-metrics
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))

import numpy as np

from dtaplus.data import KIBA_ACTIVE_THRESHOLD, KibaData
from dtaplus.metrics import compute_ci, compute_aupr
from dtaplus.models.gbm import SimilarityGBM, MeanPredictor


def compute_metrics(y_true: np.ndarray, y_pred: np.ndarray, threshold: float) -> dict:
    """Compute all benchmark metrics for a set of predictions."""
    mse = float(np.mean((y_true - y_pred) ** 2))
    ci = compute_ci(y_true, y_pred)

    # Binary AUPR: active = KIBA score >= threshold
    y_bin = (y_true >= threshold).astype(int)
    aupr = compute_aupr(y_bin, y_pred)

    # rm2 metric (DeepDTA paper uses this)
    r2_pred = float(np.corrcoef(y_true, y_pred)[0, 1] ** 2)
    r02_sum = 0.0
    for _ in range(1):  # simplified rm2 as r2 * (1 - sqrt(|r2 - r02|))
        k = float(np.dot(y_true, y_pred) / np.dot(y_pred, y_pred))
        y_pred_scaled = k * y_pred
        ss_res0 = np.sum((y_true - y_pred_scaled) ** 2)
        ss_tot0 = np.sum((y_true - y_true.mean()) ** 2)
        r02_sum = float(1 - ss_res0 / ss_tot0) if ss_tot0 > 0 else 0.0
    rm2 = float(r2_pred * (1 - np.sqrt(np.abs(r2_pred - r02_sum))))

    return {
        "ci": round(ci, 4),
        "mse": round(mse, 4),
        "r2m": round(rm2, 4),
        "aupr": round(aupr, 4),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Evaluate DeepDTA+ on KIBA dataset.")
    parser.add_argument(
        "--update-metrics",
        action="store_true",
        help="Append KIBA results to results/metrics.json",
    )
    parser.add_argument(
        "--data-dir", default="data/kiba", help="Path to KIBA data directory."
    )
    args = parser.parse_args()

    print("=" * 60)
    print("DeepDTA+ KIBA Benchmark (Official Setting 1 Random Split)")
    print("=" * 60)

    # Load KIBA data
    t0 = time.time()
    print("Loading KIBA data...")
    data = KibaData(args.data_dir)
    print(
        f"  Loaded: {data.num_drugs} drugs × {data.num_proteins} proteins, "
        f"{data.num_pairs} pairs  ({time.time()-t0:.1f}s)"
    )

    # Official setting 1 random split
    _ = data.get_random_split(val_fold_idx=0)
    train_idx = data.official_train_union
    test_idx = data.official_test_fold
    y_test = data.y[test_idx]

    print(f"  Train: {len(train_idx)} pairs | Test: {len(test_idx)} pairs")
    print(f"  KIBA score range: {data.y.min():.2f}–{data.y.max():.2f}")
    print(f"  Active pairs (≥{KIBA_ACTIVE_THRESHOLD}): {(data.y >= KIBA_ACTIVE_THRESHOLD).sum()}")

    # ----- Baseline: Predict-the-Mean -----
    print("\n--- Predict-the-Mean Baseline ---")
    mean_model = MeanPredictor()
    mean_model.fit(data.y[train_idx])
    y_pred_mean = mean_model.predict(len(test_idx))
    mean_metrics = compute_metrics(y_test, y_pred_mean, KIBA_ACTIVE_THRESHOLD)
    print(f"  CI={mean_metrics['ci']}  MSE={mean_metrics['mse']}  "
          f"rm2={mean_metrics['r2m']}  AUPR={mean_metrics['aupr']}")

    # ----- SimilarityGBM -----
    print("\n--- SimilarityGBM (single seed) ---")
    t1 = time.time()
    gbm = SimilarityGBM(random_state=42)
    gbm.fit_dataset(data, train_idx, split_type="random")
    fit_time = round(time.time() - t1, 2)
    print(f"  Fitted in {fit_time}s")
    y_pred_gbm = gbm.predict_indices(data, test_idx)
    gbm_metrics = compute_metrics(y_test, y_pred_gbm, KIBA_ACTIVE_THRESHOLD)
    gbm_metrics["fit_time_sec"] = fit_time
    gbm_metrics["num_train"] = int(len(train_idx))
    gbm_metrics["num_test"] = int(len(test_idx))
    print(f"  CI={gbm_metrics['ci']}  MSE={gbm_metrics['mse']}  "
          f"rm2={gbm_metrics['r2m']}  AUPR={gbm_metrics['aupr']}")

    # ----- DeepDTA+ 3-seed Ensemble -----
    print("\n--- DeepDTA+ 3-Seed GBM Ensemble ---")
    t2 = time.time()
    all_preds = []
    for seed in [42, 43, 44]:
        g = SimilarityGBM(random_state=seed)
        g.fit_dataset(data, train_idx, split_type="random")
        all_preds.append(g.predict_indices(data, test_idx))
    y_pred_ens = np.mean(all_preds, axis=0)
    ens_time = round(time.time() - t2, 2)
    print(f"  Fitted 3 seeds in {ens_time}s")
    ens_metrics = compute_metrics(y_test, y_pred_ens, KIBA_ACTIVE_THRESHOLD)
    ens_metrics["fit_time_sec"] = ens_time
    print(f"  CI={ens_metrics['ci']}  MSE={ens_metrics['mse']}  "
          f"rm2={ens_metrics['r2m']}  AUPR={ens_metrics['aupr']}")

    # ----- Paper reference -----
    paper_ref = {
        "ci": 0.863,
        "mse": 0.194,
        "r2m": 0.673,
        "aupr": 0.900,
        "source": "DeepDTA paper (Öztürk et al., 2018)",
    }

    print("\n--- Original DeepDTA Paper (reference) ---")
    print(f"  CI={paper_ref['ci']}  MSE={paper_ref['mse']}  "
          f"rm2={paper_ref['r2m']}  AUPR={paper_ref['aupr']}")

    print("\n" + "=" * 60)
    print("Summary")
    print("=" * 60)
    headers = ["Model", "CI", "MSE", "rm2", "AUPR"]
    rows = [
        ["Predict-the-Mean"] + [str(mean_metrics[k]) for k in ["ci", "mse", "r2m", "aupr"]],
        ["SimilarityGBM (1 seed)"] + [str(gbm_metrics[k]) for k in ["ci", "mse", "r2m", "aupr"]],
        ["DeepDTA+ Ensemble (3×GBM)"] + [str(ens_metrics[k]) for k in ["ci", "mse", "r2m", "aupr"]],
        ["DeepDTA Paper (CNN)"] + [str(paper_ref[k]) for k in ["ci", "mse", "r2m", "aupr"]],
    ]
    col_w = [28, 7, 7, 7, 7]
    header_line = "  ".join(h.ljust(w) for h, w in zip(headers, col_w))
    print(header_line)
    print("-" * len(header_line))
    for row in rows:
        print("  ".join(c.ljust(w) for c, w in zip(row, col_w)))

    if args.update_metrics:
        metrics_path = os.path.join(
            os.path.dirname(__file__), "..", "results", "metrics.json"
        )
        with open(metrics_path, "r") as f:
            metrics = json.load(f)

        metrics["kiba_random_split"] = {
            "predict_the_mean": mean_metrics,
            "deepdta_paper_cnn": paper_ref,
            "similarity_gbm": gbm_metrics,
            "dtaplus_ensemble": ens_metrics,
        }

        with open(metrics_path, "w") as f:
            json.dump(metrics, f, indent=2)
        print(f"\n✓ Updated {metrics_path} with KIBA results.")
    else:
        print("\nRe-run with --update-metrics to persist results to metrics.json.")


if __name__ == "__main__":
    main()
