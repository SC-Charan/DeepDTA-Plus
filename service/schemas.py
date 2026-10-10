"""Pydantic schemas and validators for the DeepDTA+ FastAPI service."""

from __future__ import annotations

import logging

from pydantic import BaseModel, Field, field_validator

from dtaplus.data import CHARISOSMISET, CHARPROTSET

logger = logging.getLogger("dtaplus.service")


class HealthResponse(BaseModel):
    status: str = "ok"
    model_version: str = "0.1.0"
    dataset: str = "davis"


class PredictionRequest(BaseModel):
    smiles: str = Field(..., description="Canonical or isomeric SMILES string.", min_length=1)
    protein_sequence: str = Field(..., description="Target amino acid sequence.", min_length=1)

    @field_validator("smiles")
    @classmethod
    def validate_smiles(cls, v: str) -> str:
        s = v.strip()
        if not s:
            raise ValueError("SMILES string cannot be empty.")
        # Check for invalid characters
        invalid = [ch for ch in s if ch not in CHARISOSMISET]
        if invalid:
            raise ValueError(f"SMILES contains invalid characters: {set(invalid)}")
        return s

    @field_validator("protein_sequence")
    @classmethod
    def validate_protein(cls, v: str) -> str:
        s = v.strip().upper()
        if not s:
            raise ValueError("Protein sequence cannot be empty.")
        invalid = [ch for ch in s if ch not in CHARPROTSET]
        if invalid:
            raise ValueError(f"Protein sequence contains invalid amino acids: {set(invalid)}")
        return s


class PredictionResponse(BaseModel):
    pkd: float = Field(..., description="Predicted binding affinity (-log10 Kd/1e9).")
    kd_nM: float = Field(..., description="Predicted equilibrium dissociation constant in nM.")
    uncertainty: float = Field(..., description="Ensemble standard deviation spread.")
    binds: bool = Field(..., description="Binary classification (True if pKd >= 7.0 / Kd <= 100 nM).")


class BatchPredictionRequest(BaseModel):
    items: list[PredictionRequest] = Field(..., min_length=1, max_length=256)

    @field_validator("items")
    @classmethod
    def validate_batch_size(cls, v: list[PredictionRequest]) -> list[PredictionRequest]:
        if len(v) == 0:
            raise ValueError("Batch cannot be empty.")
        if len(v) > 256:
            raise ValueError("Batch exceeds maximum size of 256 items.")
        return v
