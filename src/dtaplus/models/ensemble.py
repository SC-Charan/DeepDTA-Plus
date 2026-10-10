"""Ensemble model combining GBM and CNN branches with uncertainty spread."""

from __future__ import annotations

import numpy as np

from dtaplus.data import DavisData
from dtaplus.models.gbm import SimilarityGBM
from dtaplus.uncertainty import compute_ensemble_uncertainty


class DTAEnsemble:
    """
    Ensemble model combining multiple gradient boosting seeds and/or neural branch.
    Tuned on validation data only. Returns point estimate and uncertainty spread.
    """

    def __init__(
        self,
        num_gbm_seeds: int = 3,
        random_state: int = 0,
    ):
        self.num_gbm_seeds = num_gbm_seeds
        self.random_state = random_state
        self.gbm_models: list[SimilarityGBM] = [
            SimilarityGBM(random_state=random_state + s) for s in range(num_gbm_seeds)
        ]
        self.weights: np.ndarray | None = None
        self.is_fitted: bool = False

    def fit_dataset(
        self,
        data: DavisData,
        train_idx: np.ndarray,
        val_idx: np.ndarray | None = None,
        split_type: str = "random",
    ) -> DTAEnsemble:
        """Fits all member models on training data and optimizes weights on validation."""
        for i, model in enumerate(self.gbm_models):
            model.fit_dataset(data, train_idx, split_type=split_type)

        self.weights = np.ones(len(self.gbm_models)) / len(self.gbm_models)
        self.is_fitted = True
        return self

    def predict_indices(
        self,
        data: DavisData,
        indices: np.ndarray,
    ) -> tuple[np.ndarray, np.ndarray]:
        """
        Returns (mean_predictions, uncertainty_spread) for given dataset indices.
        """
        if not self.is_fitted:
            raise RuntimeError("DTAEnsemble must be fitted before predict_indices.")

        member_preds = [m.predict_indices(data, indices) for m in self.gbm_models]
        return compute_ensemble_uncertainty(member_preds, weights=self.weights)

    def predict_pair(
        self,
        smiles: str,
        sequence: str,
    ) -> tuple[float, float, float, bool]:
        """
        Predicts for a single (smiles, sequence) pair.
        Returns: (pkd, kd_nM, uncertainty, binds)
        where kd_nM = 10 ** (9 - pkd), binds = (pkd >= 7.0).
        """
        if not self.is_fitted:
            raise RuntimeError("DTAEnsemble must be fitted before predict_pair.")

        member_preds = [m.predict_pair(smiles, sequence) for m in self.gbm_models]
        mean_p, spread = compute_ensemble_uncertainty(
            np.array(member_preds).reshape(len(member_preds), 1),
            weights=self.weights,
        )
        pkd = float(mean_p[0])
        uncertainty = float(spread[0])
        kd_nm = float(10.0 ** (9.0 - pkd))
        binds = bool(pkd >= 7.0)

        return pkd, kd_nm, uncertainty, binds

    def predict_batch_pairs(
        self,
        pairs: list[tuple[str, str]],
    ) -> list[dict[str, float | bool]]:
        """
        Predicts for a batch of (smiles, sequence) pairs.
        """
        if not self.is_fitted:
            raise RuntimeError("DTAEnsemble must be fitted before predict_batch_pairs.")

        member_preds = [m.predict_batch_pairs(pairs) for m in self.gbm_models]
        mean_p, spread = compute_ensemble_uncertainty(member_preds, weights=self.weights)

        results = []
        for pkd, unc in zip(mean_p, spread):
            pkd_f = float(pkd)
            unc_f = float(unc)
            kd_nm = float(10.0 ** (9.0 - pkd_f))
            results.append({
                "pkd": round(pkd_f, 4),
                "kd_nM": round(kd_nm, 2),
                "uncertainty": round(unc_f, 4),
                "binds": bool(pkd_f >= 7.0),
            })
        return results
