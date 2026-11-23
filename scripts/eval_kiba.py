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
from dtaplus.metrics import concordance_index, mean_squared_error, aupr_score, rm2_score
from dtaplus.models.gbm import MeanPredictor
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.decomposition import TruncatedSVD
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer


def compute_metrics(y_true: np.ndarray, y_pred: np.ndarray, threshold: float) -> dict:
    """Compute all benchmark metrics for a set of predictions."""
    mse = float(mean_squared_error(y_true, y_pred))
    ci = float(concordance_index(y_true, y_pred))
    rm2 = float(rm2_score(y_true, y_pred))
    aupr = float(aupr_score(y_true, y_pred, threshold=threshold))

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

    # ----- Featurize with 224-dim pipeline -----
    print("\n--- Featurizing KIBA (224 dimensions) ---")
    d_tfidf = TfidfVectorizer(analyzer="char", ngram_range=(1, 4), min_df=2)
    smi_tfidf = d_tfidf.fit_transform(data.drug_smiles).astype(float)
    xd = TruncatedSVD(64, random_state=42).fit_transform(smi_tfidf)
    sd = TruncatedSVD(96, random_state=42).fit_transform(data.dsim)
    d_feat = np.hstack([sd, xd])  # 160 dims

    p_count = CountVectorizer(analyzer="char", ngram_range=(3, 3), lowercase=False)
    seq_counts = p_count.fit_transform(data.protein_sequences).astype(float)
    xp = TruncatedSVD(32, random_state=42).fit_transform(seq_counts)
    st = TruncatedSVD(32, random_state=42).fit_transform(data.tsim)
    p_feat = np.hstack([st, xp])  # 64 dims

    x_train = np.hstack([d_feat[data.ri[train_idx]], p_feat[data.ci[train_idx]]])
    x_test = np.hstack([d_feat[data.ri[test_idx]], p_feat[data.ci[test_idx]]])
    y_train = data.y[train_idx]
    print(f"  Feature shapes: train={x_train.shape}, test={x_test.shape}")

    # ----- Single Tuned GBM -----
    print("\n--- Tuned HistGBM (single seed) ---")
    t1 = time.time()
    hgb = HistGradientBoostingRegressor(
        max_iter=300,
        max_leaf_nodes=63,
        learning_rate=0.08,
        l2_regularization=2.0,
        min_samples_leaf=20,
        random_state=42,
    )
    hgb.fit(x_train, y_train)
    fit_time = round(time.time() - t1, 2)
    print(f"  Fitted in {fit_time}s")
    y_pred_gbm = hgb.predict(x_test)
    gbm_metrics = compute_metrics(y_test, y_pred_gbm, KIBA_ACTIVE_THRESHOLD)
    gbm_metrics["fit_time_sec"] = fit_time
    gbm_metrics["num_train"] = int(len(train_idx))
    gbm_metrics["num_test"] = int(len(test_idx))
    print(f"  CI={gbm_metrics['ci']}  MSE={gbm_metrics['mse']}  "
          f"rm2={gbm_metrics['r2m']}  AUPR={gbm_metrics['aupr']}")

    # ----- DeepDTA+ 3-seed Ensemble -----
    print("\n--- DeepDTA+ 3-Seed Tuned Ensemble ---")
    t2 = time.time()
    all_preds = [y_pred_gbm]
    for seed in [43, 44]:
        g = HistGradientBoostingRegressor(
            max_iter=300,
            max_leaf_nodes=63,
            learning_rate=0.08,
            l2_regularization=2.0,
            min_samples_leaf=20,
            random_state=seed,
        )
        g.fit(x_train, y_train)
        all_preds.append(g.predict(x_test))
    y_pred_ens = np.mean(all_preds, axis=0)
    ens_time = round(time.time() - t2, 2)
    print(f"  Fitted remaining seeds in {ens_time}s")
    ens_metrics = compute_metrics(y_test, y_pred_ens, KIBA_ACTIVE_THRESHOLD)
    ens_metrics["fit_time_sec"] = fit_time + ens_time
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
