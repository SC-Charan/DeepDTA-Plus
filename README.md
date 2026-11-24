### CHECK WHATSAPP 


# DeepDTA-Plus 🧬

> **Drug-Target Binding Affinity Prediction Platform — Team G1542**
>
> An end-to-end platform for predicting drug-target binding affinity ($pK_d$) using PyTorch dual-branch 1D CNNs, ensemble variance for uncertainty estimation, and modern web services.

---

## 🌟 What's New vs. Original DeepDTA (Öztürk et al., 2018)

| Dimension | Original DeepDTA (2018) | DeepDTA-Plus (Ours) |
| :--- | :--- | :--- |
| **Framework** | Keras / TensorFlow | **PyTorch 2.x** with GPU/CPU dynamic allocation |
| **Model Architecture** | Standalone dual-branch Conv1D | **Ensemble** combining 3 similarity-GBM seeds + DeepDTA CNN |
| **Uncertainty Estimation** | None (deterministic point estimate) | **Ensemble spread ($\sigma$)** exposing model variance |
| **Inference & UI** | Python CLI / scripts | **FastAPI microservice + Next.js 14 web suite** (6 interactive views) |
| **Virtual Screening** | Manual batch execution | **Batch screening studio** with flexible CSV dropzone & auto-ranking |

---

## 💡 How It Works

The prediction pipeline takes raw molecular and protein sequence inputs and computes continuous binding affinity:

```
[ Drug SMILES ] ──► Character Tokenization (max 85)  ──► PyTorch 1D-CNN Branch ──┐
                                                                                  ├──► Uniform Average ──► pKd, Kd (nM), Uncertainty (σ)
[ Protein Seq ] ──► Residue Tokenization (max 1200) ──► Similarity-GBM Branch   ──┘
```

1. **Input**: A drug compound SMILES string and a target protein amino acid sequence.
2. **Encoding**: Characters are mapped to integer index arrays with zero-padding (up to 85 for SMILES and 1200 for proteins).
3. **Dual Model Evaluation**:
   - **CNN Branch**: Two parallel 3-layer 1D convolutions extract local sequence motifs, concatenated via global max-pooling and passed through dense layers (1024 → 1024 → 512 → 1).
   - **Similarity-GBM Branch**: HistGradientBoosting models process 2D similarity and k-mer frequency projections.
4. **Ensemble Aggregation**: Member model outputs are combined by uniform averaging to produce the final predicted $pK_d$, equilibrium $K_d = 10^{(9 - pK_d)}\text{ nM}$, and standard deviation uncertainty ($\sigma$).

---

## 📁 Project Structure

```
DeepDTA-master/
├── data/                      # Benchmark datasets (Davis & KIBA)
│   └── davis/                 # Davis affinity matrices, sequences, folds
├── src/dtaplus/               # Core Python package
│   ├── data.py / data_loader.py  # Sequence tokenization and dataset splits
│   ├── models/                # PyTorch DeepDTACNN, SimilarityGBM, DTAEnsemble
│   ├── metrics.py             # Concordance Index (CI), MSE, r2m, AUPR
│   ├── train.py               # CNN training loop and checkpoint management
│   └── evaluate.py            # Evaluation across random and cold-entity splits
├── service/                   # FastAPI microservice backend
│   ├── app.py                 # REST API routes (/predict, /predict_batch, /health)
│   └── schemas.py             # Pydantic request/response validation schemas
├── frontend/                  # Next.js 14 web application
│   ├── app/                   # App router pages (predict, search, batch, model, metrics, history)
│   ├── components/            # UI cards, navigation, molecular viewer
│   └── lib/                   # API clients, mock data fallback engine
├── results/                   # Evaluation artifacts
│   ├── metrics.json           # Ground-truth benchmark evaluation numbers
│   └── checkpoints/           # Trained PyTorch weights (deepdta_cnn_best.pt)
├── train_deepdta_colab.ipynb  # GPU-accelerated Google Colab training notebook
├── train.py / evaluate.py     # Root convenience wrappers around src/dtaplus
└── README.md                  # Project documentation
```

---

## 📊 Benchmark Results

All reported numbers are verified directly against `results/metrics.json` and `results/checkpoints/training_summary.json`.

### 1. Davis Dataset (Standard Random Split)

*Evaluation on 30,056 drug-protein pairs (68 drugs, 442 targets; official test fold = 5,010 pairs).*

| Model | CI ↑ | MSE ↓ | $r_m^2$ ↑ | AUPR ↑ | Source / Notes |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **DeepDTA+ CNN (Ours)** | **0.8866** | *not evaluated on test fold* | *not evaluated on test fold* | *not evaluated on test fold* | Best validation-fold CI (epoch 70) |
| **DeepDTA+ Ensemble (Ours)** | **0.8852** | **0.2740** | 0.6009 | 0.7088 | 3 similarity-GBM seeds (test fold) |
| DeepDTA+ Similarity GBM | 0.8813 | 0.2829 | 0.6003 | 0.6975 | Single seed baseline |
| DeepDTA CNN (Original paper) | 0.878 | 0.261 | 0.630 | 0.714 | Öztürk et al. (2018) Table 1 |
| SimBoost | 0.872 | 0.282 | 0.644 | 0.703 | Published baseline in paper |
| KronRLS | 0.871 | 0.379 | 0.411 | 0.661 | Published baseline in paper |
| Predict-the-Mean | 0.500 | 0.802 | 0.000 | 0.083 | Trivial baseline floor |

> **Ensemble Architecture Clarification**: The benchmarked ensemble in `results/metrics.json` consists of 3 `SimilarityGBM` seeds evaluated on the official test fold. The live FastAPI prediction service additionally includes the trained PyTorch `DeepDTACNN` in the ensemble whenever `results/checkpoints/deepdta_cnn_best.pt` is present.
>
> **Understanding the Evaluation Metrics**: Our 100-epoch CNN achieved a best validation-fold CI of **0.8866** at epoch 70. On the test fold, our benchmarked ensemble achieves **0.8852 CI**, ranking higher than the original paper's **0.878 CI**, though with an MSE of **0.2740** compared to the paper's **0.261**. This illustrates a standard ranking vs. calibration trade-off: ensemble averaging reliably orders relative binding strengths, while slightly smoothing out extreme affinity values.

### 2. Generalization Under Cold-Entity Splits (5 Independent Seeds)

In real-world drug discovery, models must generalize to completely new molecules or uncharacterized proteins. We evaluate on rigorous leak-free splits across 5 seeds:

| Evaluation Split | Predict-the-Mean CI | Similarity-GBM CI | **DeepDTA+ Ensemble CI** | Ensemble MSE |
| :--- | :---: | :---: | :---: | :---: |
| **Random Split** | 0.500 | 0.8813 | **0.8852** | 0.2740 |
| **Cold-Drug Split (5 seeds)** | 0.500 ± 0.000 | 0.727 ± 0.026 | **0.730 ± 0.032** | 0.681 ± 0.146 |
| **Cold-Target Split (5 seeds)** | 0.500 ± 0.000 | 0.848 ± 0.008 | **0.854 ± 0.007** | 0.362 ± 0.028 |

- Under **Cold-Drug** evaluation, test molecules are completely unseen during training; ensemble CI drops to **0.730 ± 0.032**.
- Under **Cold-Target** evaluation, test proteins belong to held-out kinase families; ensemble CI achieves **0.854 ± 0.007**.
- Uncertainty spread strongly correlates with prediction error (**$r = 0.496$**, Spearman correlation), providing a reliable signal for high-risk predictions.

### 3. KIBA Dataset Reference Benchmarks

*Evaluation on 118,254 bioactivity pairs (2,111 drugs, 229 targets).*

| Model | CI ↑ | MSE ↓ | Source |
| :--- | :---: | :---: | :--- |
| **DeepDTA+ Neural 2-Tower (Ours)** | **0.8789** | **0.1434** | Dual SVD projection towers (`scripts/train_kiba_neural.py`) |
| **DeepDTA (Baseline)** | 0.863 | 0.194 | Öztürk et al. (2018) Table 1 |
| DeepDTA+ Fast GBM | 0.8302 | 0.2280 | Single-seed tabular similarity tree |
| SimBoost | 0.836 | 0.222 | Published benchmark in paper |
| KronRLS | 0.782 | 0.411 | Published benchmark in paper |

---

## 🚀 Application Modules

| View | Route | Functionality |
| :--- | :--- | :--- |
| **Predictor Studio** | `/predict` | Single-pair prediction with binding categories, $K_d$ conversion, and uncertainty spread |
| **Compound Search** | `/search` | Live PubChem REST API integration for chemical name and SMILES lookup |
| **Virtual Screening** | `/batch` | High-throughput CSV batch screening (supports custom targets and sequences) |
| **Model Architecture**| `/model` | Interactive two-branch CNN diagram, layer specifications, and PyTorch skeleton |
| **Data & Metrics** | `/metrics` | Davis/KIBA dataset distributions, radar comparison, and benchmark tables |
| **Screening History**| `/history` | Local session audit trail with CSV export |

---

## ⚠️ Transparent System Notices & Limitations

1. **Mock Fallback Notice**: When running the Next.js frontend standalone (e.g., on Vercel preview without a live GPU backend), predictions automatically use a deterministic mock engine based on sequence hashing. In the UI, these runs are **clearly labeled with an engine banner** (`Engine: Vercel Edge / Mock Fallback`) to prevent confusing simulated responses with trained PyTorch model inferences.
2. **Kinase Specificity**: The model is trained on the Davis dataset, which consists primarily of kinase inhibitors. Predictions on non-kinase targets (e.g., GPCRs, ion channels) require fine-tuning on broader databases like BindingDB.
3. **Sequence Truncation**: Protein sequences longer than 1,200 amino acids and SMILES longer than 85 characters are truncated to standard Davis input bounds.

---

## 🛠️ Local Development

### 1. Backend API (FastAPI + PyTorch)
```bash
pip install -r requirements.txt
uvicorn service.app:app --reload --port 8000
```

### 2. Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev # http://localhost:3000
```

---

## 👥 Research Team (G1542)
- **SaiCharan** (021)
- **Havisha** (012)
- **Abhinov** (001)
- **Rishitha** (020)
- **Hariharan** (002)
