"""Tests for dataset loading, preprocessing, and encoding."""

import numpy as np
import pytest

from dtaplus.data import (
    DEFAULT_KIBA_SEQ_LEN,
    DEFAULT_KIBA_SMI_LEN,
    KIBA_ACTIVE_THRESHOLD,
    DavisData,
    KibaData,
    encode_protein,
    encode_smiles,
)


def test_davis_data_loading_and_shapes():
    data = DavisData(data_dir="data/davis")

    # Y shape (68, 442)
    assert data.Y_shape == (68, 442), f"Expected Y shape (68, 442), got {data.Y_shape}"

    # 30,056 valid pairs
    assert data.num_pairs == 30056, f"Expected 30056 pairs, got {data.num_pairs}"
    assert len(data.y) == 30056

    # 5 train folds disjoint from each other and from test fold
    folds = data.official_train_folds
    assert len(folds) == 5, f"Expected 5 train folds, got {len(folds)}"

    test_set = set(data.official_test_fold.tolist())
    assert len(test_set) == 5010, f"Expected 5010 test items, got {len(test_set)}"

    for i in range(len(folds)):
        f_i = set(folds[i].tolist())
        # disjoint from test
        assert len(f_i.intersection(test_set)) == 0, f"Fold {i} overlaps with test fold!"
        # disjoint from other train folds
        for j in range(i + 1, len(folds)):
            f_j = set(folds[j].tolist())
            assert len(f_i.intersection(f_j)) == 0, f"Fold {i} overlaps with fold {j}!"

    # Union of train folds = 25,046
    assert len(data.official_train_union) == 25046, (
        f"Expected 25046 train pairs in union, got {len(data.official_train_union)}"
    )

    # Encoded tensors have shapes (N, 85) and (N, 1200)
    assert data.encoded_drugs.shape == (30056, 85), (
        f"Expected drug tensor shape (30056, 85), got {data.encoded_drugs.shape}"
    )
    assert data.encoded_proteins.shape == (30056, 1200), (
        f"Expected protein tensor shape (30056, 1200), got {data.encoded_proteins.shape}"
    )


def test_encode_helpers():
    smi = "CC(=O)OC1=CC=CC=C1C(=O)O"
    enc_smi = encode_smiles(smi, max_len=85)
    assert enc_smi.shape == (85,)
    assert enc_smi.dtype == np.int64
    assert np.all(enc_smi[: len(smi)] > 0)
    assert np.all(enc_smi[len(smi) :] == 0)

    seq = "MKWVTFISLLFLFSSAYSRG"
    enc_seq = encode_protein(seq, max_len=1200)
    assert enc_seq.shape == (1200,)
    assert enc_seq.dtype == np.int64
    assert np.all(enc_seq[: len(seq)] > 0)
    assert np.all(enc_seq[len(seq) :] == 0)

    # Error handling for invalid chars
    with pytest.raises(ValueError):
        encode_smiles("CC?INVALID")

    with pytest.raises(ValueError):
        encode_protein("MK123INVALID")


def test_top_level_modular_imports():
    # Verify root-level zero-friction modular structure
    import data_loader
    import evaluate
    import models
    import train

    assert hasattr(data_loader, "DavisData")
    assert hasattr(data_loader, "KibaData")
    assert hasattr(data_loader, "create_dataloader")
    assert hasattr(train, "train_cnn")
    assert hasattr(evaluate, "evaluate_gbm_split")
    assert hasattr(models, "DeepDTACNN")
    assert hasattr(models, "SimilarityGBM")
    assert hasattr(models, "DTAEnsemble")


def test_kiba_data_loading_and_shapes():
    data = KibaData(data_dir="data/kiba")

    # Shapes match Tang et al. (2014) / Öztürk et al. (2018)
    assert data.Y_shape == (2111, 229)
    assert data.num_drugs == 2111
    assert data.num_proteins == 229
    assert data.num_pairs == 118254
    assert len(data.y) == 118254

    # Test fold & train union
    assert len(data.official_test_fold) == 19709
    assert len(data.official_train_folds) == 5
    assert len(data.official_train_union) == 98545

    # Threshold definition
    assert KIBA_ACTIVE_THRESHOLD == 12.1
    assert (data.y >= KIBA_ACTIVE_THRESHOLD).sum() > 20000

    # Encoding lengths
    assert data.smi_len == DEFAULT_KIBA_SMI_LEN
    assert data.seq_len == DEFAULT_KIBA_SEQ_LEN
    assert data.unique_encoded_drugs.shape == (2111, DEFAULT_KIBA_SMI_LEN)
    assert data.unique_encoded_proteins.shape == (229, DEFAULT_KIBA_SEQ_LEN)

