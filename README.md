# DeepDTA-Plus 🧬

> **Research & Implementation Project — Team G1542**
>
> Predicting how strongly a drug may bind to a protein using deep learning on SMILES and amino acid sequences.

Built on the original **DeepDTA CNN paper** (Öztürk et al., 2018 · *Bioinformatics 34(17)*) and enhanced with **PyTorch** for model development and **RDKit** for chemistry-aware molecular handling.

---

## 🚀 Application Features

| # | Feature | Description |
|---|---------|-------------|
| 01 | **Predict** | Enter a drug SMILES & protein sequence to get a predicted binding affinity (pKd) |
| 02 | **Molecule View** | Search any compound via PubChem — get structure, formula, weight, and SMILES |
| 03 | **Virtual Screening** | Upload a CSV to batch-screen drug-protein pairs and rank them |
| 04 | **Model View** | Explore the two-branch CNN architecture, hyperparameters, and PyTorch code |
| 05 | **Data & Metrics** | Davis and KIBA dataset stats + benchmark results against published baselines |
| 06 | **History** | Review past predictions and manage your workspace |

---

## 🏗️ Architecture Overview

```
Drug SMILES ──► RDKit validation ──► Embedding + Conv1D ×3 ──► Max Pool ──┐
                                                                            ├──► Concat ──► Dense(1024→1024→512→1) ──► pKd
Protein Seq ──────────────────────► Embedding + Conv1D ×3 ──► Max Pool ──┘
```

**Key hyperparameters:**
- SMILES max length: 85 · Protein max length: 1200
- Embedding dim: 128 · Conv filters: 32 → 64 → 96
- Dense: 1024 → 1024 → 512 → 1
- Framework: **PyTorch** · Chemistry: **RDKit**

---

## 📊 Results

| Model | CI ↑ | MSE ↓ | R²m ↑ | AUPR ↑ |
|-------|------|-------|-------|--------|
| **DeepDTA+ Ensemble (Ours)** | **0.8852** | 0.274 | 0.601 | 0.709 |
| DeepDTA CNN (Original paper) | 0.878 | 0.261 | 0.630 | 0.714 |
| SimBoost | 0.872 | 0.282 | 0.644 | 0.703 |
| KronRLS | 0.871 | 0.379 | 0.611 | 0.661 |

> CI scores on the Davis dataset random test split.

**Honest generalisation splits:**

| Split | Our CI | Baseline CI |
|-------|--------|-------------|
| Random Split | 0.885 | 0.878 |
| Cold-Drug Split | 0.731 | 0.722 |
| Cold-Target Split | 0.748 | 0.741 |

---

## 🗂️ Datasets

| Dataset | Drugs | Proteins | Pairs | Metric |
|---------|-------|----------|-------|--------|
| Davis | 68 | 442 | 30,056 | pKd |
| KIBA | 2,111 | 229 | 118,254 | KIBA Score |

---

## 🛠️ Local Development

### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev        # → http://localhost:3000
```

### Backend (FastAPI + PyTorch)

```bash
pip install -r requirements.txt
uvicorn service.app:app --reload   # → http://localhost:8000
```

The frontend will automatically use the FastAPI backend if it's running, or fall back to built-in mock predictions.

---

## 🚀 Deploy to Vercel

1. Push to GitHub.
2. Import the repo on [vercel.com](https://vercel.com).
3. Set **Root Directory** to `frontend`.
4. Set `NEXT_PUBLIC_API_URL` to your deployed FastAPI URL (optional — mock fallback works out of the box).
5. Click **Deploy**.

---

## 👥 Team G1542

| Name | Roll No. |
|------|----------|
| SaiCharan | 245525733021 | Team Lead
| Havisha | 245525733012 | asst. Team Lead
| Abhinov | 245525733001 |
| Rishitha | 245525733020 |
| Hariharan | 245525733002 |

---

## 📄 Reference

> Öztürk, H., Özgür, A., & Ozkirimli, E. (2018). DeepDTA: deep drug–target binding affinity prediction. *Bioinformatics*, 34(17), i821–i829. https://doi.org/10.1093/bioinformatics/bty593
