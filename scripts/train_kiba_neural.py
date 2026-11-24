"""Training and evaluation script for the Deep 2-Tower Neural Interaction Model on KIBA."""

from __future__ import annotations

import os
import sys
import time

# Ensure src is on sys.path
_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if os.path.join(_ROOT, "src") not in sys.path:
    sys.path.insert(0, os.path.join(_ROOT, "src"))

import numpy as np
import torch
from torch import nn
from torch.utils.data import DataLoader, TensorDataset
from sklearn.decomposition import TruncatedSVD
from sklearn.feature_extraction.text import TfidfVectorizer

from dtaplus.data import KibaData
from dtaplus.metrics import concordance_index, mean_squared_error, r2_score_modified, aupr_score
from dtaplus.models.cnn import Deep2TowerDTA


def build_kiba_features(data: KibaData, n_drug_svd: int = 256, n_prot_svd: int = 128):
    """Builds TF-IDF + TruncatedSVD feature matrices for KIBA compounds and targets."""
    drug_vect = TfidfVectorizer(analyzer="char", ngram_range=(2, 4), min_df=2)
    prot_vect = TfidfVectorizer(analyzer="char", ngram_range=(3, 4), min_df=2)

    drug_tfidf = drug_vect.fit_transform(data.drug_smiles)
    prot_tfidf = prot_vect.fit_transform(data.protein_sequences)

    svd_drug = TruncatedSVD(n_components=n_drug_svd, random_state=42)
    svd_prot = TruncatedSVD(n_components=n_prot_svd, random_state=42)

    d_svd = svd_drug.fit_transform(drug_tfidf)
    p_svd = svd_prot.fit_transform(prot_tfidf)

    d_norm = d_svd / (np.linalg.norm(d_svd, axis=1, keepdims=True) + 1e-8)
    p_norm = p_svd / (np.linalg.norm(p_svd, axis=1, keepdims=True) + 1e-8)

    return d_norm, p_norm


def evaluate_model(model: nn.Module, loader: DataLoader, device: torch.device):
    """Evaluates model on held-out loader and returns predictions."""
    model.eval()
    preds = []
    with torch.no_grad():
        for d_batch, p_batch, _ in loader:
            p = model(d_batch.to(device), p_batch.to(device))
            preds.extend(p.cpu().numpy().tolist())
    return np.array(preds)


def main():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Loading KIBA dataset (Setting 1) on {device}...")
    data = KibaData(data_dir="data/kiba")

    print(f"Extracted {len(data.drug_smiles)} drugs and {len(data.protein_sequences)} targets ({data.num_pairs} pairs).")
    d_feat, p_feat = build_kiba_features(data)

    splits = data.get_random_split(val_fold_idx=0)
    train_idx = data.official_train_union
    test_idx = data.official_test_fold

    ckpt_path = os.path.join(_ROOT, "results", "checkpoints", "deepdta_kiba_neural_best.pt")
    model = Deep2TowerDTA(d_in=256, p_in=128, hidden=128).to(device)

    if os.path.exists(ckpt_path):
        print(f"Loading pre-trained checkpoint from {ckpt_path}...")
        ckpt = torch.load(ckpt_path, map_location=device, weights_only=False)
        model.load_state_dict(ckpt["model_state_dict"])
    else:
        print("No checkpoint found. Training from scratch for 15 epochs...")
        # Tensor datasets
        d_tr = torch.from_numpy(d_feat[data.ri[train_idx]]).float()
        p_tr = torch.from_numpy(p_feat[data.ci[train_idx]]).float()
        y_tr = torch.from_numpy(data.y[train_idx]).float()
        train_loader = DataLoader(TensorDataset(d_tr, p_tr, y_tr), batch_size=256, shuffle=True)

        optimizer = torch.optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-4)
        criterion = nn.MSELoss()

        for epoch in range(1, 16):
            model.train()
            total_loss = 0.0
            for d_b, p_b, y_b in train_loader:
                optimizer.zero_grad()
                pred = model(d_b.to(device), p_b.to(device))
                loss = criterion(pred, y_b.to(device))
                loss.backward()
                optimizer.step()
                total_loss += loss.item()
            print(f"Epoch {epoch:02d}/15 - Loss: {total_loss / len(train_loader):.4f}")

    # Evaluate on held-out test fold
    d_te = torch.from_numpy(d_feat[data.ri[test_idx]]).float()
    p_te = torch.from_numpy(p_feat[data.ci[test_idx]]).float()
    y_te = data.y[test_idx]
    test_loader = DataLoader(TensorDataset(d_te, p_te, torch.from_numpy(y_te).float()), batch_size=512, shuffle=False)

    print(f"Evaluating on held-out test set ({len(test_idx)} pairs)...")
    test_preds = evaluate_model(model, test_loader, device)

    ci = concordance_index(y_te, test_preds)
    mse = mean_squared_error(y_te, test_preds)
    r2m = r2_score_modified(y_te, test_preds)
    aupr = aupr_score(y_te, test_preds, threshold=12.1)

    print("\n================ OFFICIAL KIBA BENCHMARK EVALUATION ================")
    print(f"Concordance Index (CI) : {ci:.4f}  (Paper: 0.8630)")
    print(f"Mean Squared Error (MSE): {mse:.4f}  (Paper: 0.1940)")
    print(f"Modified R^2 (R^2_m)   : {r2m:.4f}  (Paper: 0.6730)")
    print(f"AUPR (Threshold 12.1)  : {aupr:.4f}  (Paper: 0.9000)")
    print("====================================================================\n")


if __name__ == "__main__":
    main()
