"""
Evaluates uniform vs. inverse-MSE weighted ensemble on the Davis random split.
Prints before/after CI and MSE so we can confirm the improvement.
"""
from __future__ import annotations

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))

import numpy as np
from dtaplus.data import DavisData
from dtaplus.models.ensemble import DTAEnsemble
from dtaplus.metrics import concordance_index

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "davis")
CKPT = os.path.join(os.path.dirname(__file__), "..", "results", "checkpoints", "deepdta_cnn_best.pt")


def mse(y_true, y_pred):
    return float(np.mean((np.array(y_true) - np.array(y_pred)) ** 2))


def run(use_weighted: bool):
    data = DavisData(data_dir=DATA_DIR)
    splits = data.get_random_split(val_fold_idx=0)
    train_idx = data.official_train_union
    val_idx = splits.val_idx
    test_idx = splits.test_idx

    ckpt_path = CKPT if os.path.exists(CKPT) else None

    ensemble = DTAEnsemble(num_gbm_seeds=3, random_state=42, cnn_checkpoint_path=ckpt_path)

    if use_weighted:
        ensemble.fit_dataset(data, train_idx, val_idx=val_idx, split_type="random")
    else:
        ensemble.fit_dataset(data, train_idx, val_idx=None, split_type="random")

    preds, _ = ensemble.predict_indices(data, test_idx)
    y_true = data.y[test_idx]

    ci = concordance_index(y_true, preds)
    m = mse(y_true, preds)

    label = "Inverse-MSE Weighted" if use_weighted else "Uniform (current)"
    print(f"\n{'='*50}")
    print(f"  {label}")
    print(f"{'='*50}")
    print(f"  CI  (↑): {ci:.4f}")
    print(f"  MSE (↓): {m:.4f}")
    print(f"  Weights: {np.round(ensemble.weights, 4)}")
    return ci, m


if __name__ == "__main__":
    print("\nRunning comparison: Uniform vs Inverse-MSE Weighted Ensemble")
    print("Davis dataset — official random split test fold\n")

    ci_u, mse_u = run(use_weighted=False)
    ci_w, mse_w = run(use_weighted=True)

    print(f"\n{'='*50}")
    print("  SUMMARY")
    print(f"{'='*50}")
    print(f"  CI  change:  {ci_u:.4f} → {ci_w:.4f}  (Δ {ci_w - ci_u:+.4f})")
    print(f"  MSE change:  {mse_u:.4f} → {mse_w:.4f}  (Δ {mse_w - mse_u:+.4f})")
    paper_mse = 0.261
    print(f"\n  Paper MSE target: {paper_mse}")
    if mse_w < paper_mse:
        print(f"  ✅ Beats paper MSE! ({mse_w:.4f} < {paper_mse})")
    else:
        print(f"  Gap to paper MSE: {mse_w - paper_mse:+.4f}")
