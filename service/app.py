"""FastAPI prediction service for DeepDTA+."""

from __future__ import annotations

import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, status

from dtaplus.data import DavisData
from dtaplus.models.ensemble import DTAEnsemble
from service.schemas import (
    BatchPredictionRequest,
    HealthResponse,
    PredictionRequest,
    PredictionResponse,
    categorize_binding_affinity,
)

# Structured logger setup
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("dtaplus.api")

# Global singleton model
model_instance: DTAEnsemble | None = None

DEFAULT_CHECKPOINT_PATH = "results/checkpoints/deepdta_cnn_best.pt"


@asynccontextmanager
async def lifespan(app: FastAPI):
    global model_instance
    logger.info("Initializing DeepDTA+ service: loading Davis data and fitting ensemble...")
    data = DavisData(data_dir="data/davis")
    train_idx = data.official_train_union
    splits = data.get_random_split(val_fold_idx=0)

    # Initialize ensemble with CNN checkpoint path
    ckpt_path = os.environ.get("DEEPDTA_CNN_CHECKPOINT", DEFAULT_CHECKPOINT_PATH)
    model_instance = DTAEnsemble(
        num_gbm_seeds=3,
        random_state=42,
        cnn_checkpoint_path=ckpt_path if os.path.exists(ckpt_path) else None,
    )
    model_instance.fit_dataset(data, train_idx, val_idx=splits.val_idx, split_type="random")

    cnn_status = "active" if model_instance.cnn_available else "dormant (weights not found)"
    logger.info("DeepDTA+ ensemble loaded successfully (CNN branch: %s).", cnn_status)
    yield
    logger.info("Shutting down DeepDTA+ service.")


app = FastAPI(
    title="DeepDTA+ Binding Affinity Prediction API",
    description="High-throughput drug-target affinity (DTA) prediction and uncertainty estimation service.",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)


@app.get("/health", response_model=HealthResponse, tags=["Health"])
def health_check() -> HealthResponse:
    """Service health and model metadata check."""
    cnn_active = bool(model_instance and model_instance.cnn_available)
    return HealthResponse(
        status="ok",
        model_version="0.1.0",
        dataset=f"davis (CNN: {'active' if cnn_active else 'gbm-fallback'})",
    )


@app.post("/predict", response_model=PredictionResponse, tags=["Inference"])
def predict_affinity(request: PredictionRequest) -> PredictionResponse:
    """
    Predicts pKd binding affinity, Kd in nM, and ensemble uncertainty spread for a single drug-target pair.
    Supports either chemical compound name (e.g. 'Dasatinib') or SMILES string.
    """
    if model_instance is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model is not initialized.",
        )

    assert request.smiles is not None
    logger.info(
        "Received /predict request: Compound=%s, SMILES len=%d, Protein seq len=%d",
        request.compound_name or "N/A",
        len(request.smiles),
        len(request.protein_sequence),
    )

    pkd, kd_nm, unc, binds = model_instance.predict_pair(
        request.smiles, request.protein_sequence
    )
    binding_level = categorize_binding_affinity(pkd)

    return PredictionResponse(
        pkd=round(pkd, 4),
        kd_nM=round(kd_nm, 2),
        uncertainty=round(unc, 4),
        binds=binds,
        binding_level=binding_level,
        compound_name=request.compound_name,
        smiles=request.smiles,
    )


@app.post("/predict_batch", response_model=list[PredictionResponse], tags=["Inference"])
def predict_batch_affinity(request: BatchPredictionRequest) -> list[PredictionResponse]:
    """
    Predicts pKd binding affinities for a batch of drug-target pairs (up to 256 items).
    Preserves exact request ordering.
    """
    if model_instance is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model is not initialized.",
        )

    n_items = len(request.items)
    logger.info("Received /predict_batch request for %d items", n_items)

    pairs = [(item.smiles, item.protein_sequence) for item in request.items]
    batch_results = model_instance.predict_batch_pairs(pairs)  # type: ignore

    responses = []
    for req_item, r in zip(request.items, batch_results):
        responses.append(
            PredictionResponse(
                pkd=r["pkd"],
                kd_nM=r["kd_nM"],
                uncertainty=r["uncertainty"],
                binds=r["binds"],
                binding_level=categorize_binding_affinity(r["pkd"]),
                compound_name=req_item.compound_name,
                smiles=req_item.smiles,
            )
        )
    return responses
