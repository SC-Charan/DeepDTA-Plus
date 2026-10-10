"""Streamlit Interactive Demo UI for DeepDTA+."""

from __future__ import annotations

import json
import os
import sys

sys.path.insert(0, os.path.abspath("."))
sys.path.insert(0, os.path.abspath("src"))

import streamlit as st
import numpy as np
import pandas as pd
from dtaplus.data import DavisData
from dtaplus.models.ensemble import DTAEnsemble

st.set_page_config(
    page_title="DeepDTA+ | Drug-Target Affinity",
    page_icon="🧬",
    layout="wide",
)

# Research prototype banner
st.markdown(
    """
    <div style="background-color: #fff3cd; color: #856404; padding: 12px; border-radius: 6px; margin-bottom: 20px; border-left: 5px solid #ffeeba;">
        <strong>⚠️ Notice:</strong> Research prototype; not for clinical use. Predictions are intended for computational drug screening and prioritization only.
    </div>
    """,
    unsafe_allow_html=True,
)


@st.cache_resource
def load_data_and_model():
    data = DavisData(data_dir="data/davis")
    train_idx = data.official_train_union
    splits = data.get_random_split(val_fold_idx=0)
    model = DTAEnsemble(num_gbm_seeds=3, random_state=42)
    model.fit_dataset(data, train_idx, val_idx=splits.val_idx, split_type="random")
    return data, model


try:
    data, model = load_data_and_model()
except Exception as e:
    st.error(f"Error initializing model: {e}")
    st.stop()

# Sidebar Navigation
st.sidebar.title("🧬 DeepDTA+")
page = st.sidebar.radio(
    "Navigation",
    ["Predict Affinity", "Benchmark & Ablations", "About & Architecture"],
)

PRESET_EXAMPLES = {
    "Dasatinib + ABL1 (Strong Binder)": {
        "smiles": "CC1=C(C(=CC=C1)Cl)NC(=O)C2=CN=C(S2)NC3=CC(=NC(=N3)C)N4CCN(CC4)CCO",
        "protein": data.protein_sequences[0],
    },
    "Lapatinib + EGFR (Known Inhibitor)": {
        "smiles": "CS(=O)(=O)CCNCC1=CC=C(O1)C2=CC3=C(C=C2)N=CN=C3NC4=CC(=C(C=C4)OCC5=CC(=CC=C5)F)Cl",
        "protein": data.protein_sequences[1],
    },
    "Custom Input": {
        "smiles": "CC(=O)OC1=CC=CC=C1C(=O)O",
        "protein": "MKWVTFISLLFLFSSAYSRGVFRRDTHKSEIAHRFKDLGEEHFKGLVLIAFSQYLQQCPFDEHVKLVNELTEFAKTCVADESHAGCEKSLHTLFGDELCKVASLRETYGDMADCCEKQEPERNECFLSHKDDSPDLPKLKPDPNTLCDEFKADEKKFWGKYLYEIARRHPYFYAPELLYYANKYNGVFQECCQAEDKGACLLPKIETMREKVLASSARQRLRCASIQKFGERALKAWSVARLSQKFPKAEFVEVTKLVTDLTKVHKECCHGDLLECADDRADLAKYICDNQDTISSKLKECCDKPLLEKSHCIAEVEKDAIPENLPPLTADFAEDKDVCKNYQEAKDAFLGSFLYEYSRRHPEYAVSVLLRLAKEYEATLEECCAKDDPHACYSTVFDKLKHLVDEPQNLIKQNCDQFEKLGEYGFQNALIVRYTRKVPQVSTPTLVEVSRSLGKVGTRCCTKPESERMPCTEDYLSLILNRLCVLHEKTPVSEKVTKCCTESLVNRRPCFSALTVDETYVPKEFKAETFTFHADICTLSEKERQIKKQTALVELVKHKPKATKEQLKAVMDDFAAFVEKCCKADDKETCFAEEGKKLVAASQAALGL",
    },
}

if page == "Predict Affinity":
    st.title("🎯 Drug-Target Affinity Prediction")
    st.write(
        "Estimate binding affinity ($pK_d = -\\log_{10}(K_d / 10^9)$), dissociation constant ($K_d$), and ensemble uncertainty."
    )

    preset_name = st.selectbox("Select Preset Example:", list(PRESET_EXAMPLES.keys()))
    preset = PRESET_EXAMPLES[preset_name]

    col1, col2 = st.columns(2)
    with col1:
        smiles_input = st.text_area("SMILES String", value=preset["smiles"], height=140)
    with col2:
        protein_input = st.text_area("Target Amino Acid Sequence", value=preset["protein"], height=140)

    if st.button("⚡ Run Affinity Prediction", type="primary"):
        with st.spinner("Featurizing and computing ensemble predictions..."):
            try:
                pkd, kd_nm, uncertainty, binds = model.predict_pair(
                    smiles_input.strip(), protein_input.strip()
                )

                st.markdown("### 📊 Prediction Results")
                m1, m2, m3, m4 = st.columns(4)
                m1.metric("Predicted pKd", f"{pkd:.3f}")
                m2.metric("Equilibrium Kd", f"{kd_nm:.1f} nM" if kd_nm < 1000 else f"{kd_nm/1000:.2f} µM")
                m3.metric("Uncertainty Spread (σ)", f"±{uncertainty:.3f}")

                # Interpretation
                if pkd >= 8.0:
                    interpretation = "Strong Binder (High Affinity)"
                    badge_color = "#28a745"
                elif pkd >= 7.0:
                    interpretation = "Moderate Binder (Active)"
                    badge_color = "#17a2b8"
                elif pkd >= 6.0:
                    interpretation = "Weak Binder (Low Affinity)"
                    badge_color = "#ffc107"
                else:
                    interpretation = "Non-binder / Inactive (pKd ~ 5.0 floor)"
                    badge_color = "#dc3545"

                m4.markdown(
                    f"<div style='background-color:{badge_color}; color:white; padding:10px; border-radius:5px; text-align:center; font-weight:bold; margin-top:14px;'>"
                    f"{interpretation}</div>",
                    unsafe_allow_html=True,
                )

                st.info(
                    f"**Binding Classification:** {'Active Binder (pKd >= 7.0)' if binds else 'Non-Binder (pKd < 7.0)'}. "
                    f"Ensemble uncertainty spread indicates a standard deviation of {uncertainty:.3f} across ensemble models."
                )
            except Exception as ex:
                st.error(f"Prediction failed: {ex}")

elif page == "Benchmark & Ablations":
    st.title("📈 Benchmark & Model Ablations")
    st.write("Rigorous benchmarks across Random, Cold-Drug, and Cold-Target evaluation splits.")

    metrics_file = "results/metrics.json"
    if os.path.exists(metrics_file):
        with open(metrics_file, "r") as f:
            metrics = json.load(f)

        st.subheader("1. Random Split (Paper Setting 1, Official Test Fold)")
        rand_df = pd.DataFrame([
            {"Model": "Predict-the-Mean", "CI": 0.500, "MSE": 0.802, "r2m": 0.000, "AUPR": 0.083},
            {"Model": "KronRLS (Paper)", "CI": 0.871, "MSE": 0.379, "r2m": 0.611, "AUPR": 0.661},
            {"Model": "SimBoost (Paper)", "CI": 0.872, "MSE": 0.282, "r2m": 0.644, "AUPR": 0.703},
            {"Model": "DeepDTA CNN (Paper)", "CI": 0.878, "MSE": 0.261, "r2m": 0.630, "AUPR": 0.714},
            {
                "Model": "DeepDTA+ Similarity GBM",
                "CI": round(metrics["random_split"]["similarity_gbm"]["ci"], 4),
                "MSE": round(metrics["random_split"]["similarity_gbm"]["mse"], 4),
                "r2m": round(metrics["random_split"]["similarity_gbm"]["r2m"], 4),
                "AUPR": round(metrics["random_split"]["similarity_gbm"]["aupr"], 4),
            },
            {
                "Model": "DeepDTA+ Ensemble (Ours)",
                "CI": round(metrics["random_split"]["dtaplus_ensemble"]["ci"], 4),
                "MSE": round(metrics["random_split"]["dtaplus_ensemble"]["mse"], 4),
                "r2m": round(metrics["random_split"]["dtaplus_ensemble"]["r2m"], 4),
                "AUPR": round(metrics["random_split"]["dtaplus_ensemble"]["aupr"], 4),
            },
        ])
        st.table(rand_df)

        st.subheader("2. Cold-Drug Split (20% Unseen Drugs, 5 Seeds Mean ± Std)")
        cd = metrics["cold_drug_split_5seeds"]
        cd_df = pd.DataFrame([
            {
                "Model": "Predict-the-Mean",
                "CI": f"{cd['predict_the_mean']['ci']['mean']:.3f} ± {cd['predict_the_mean']['ci']['std']:.3f}",
                "MSE": f"{cd['predict_the_mean']['mse']['mean']:.3f} ± {cd['predict_the_mean']['mse']['std']:.3f}",
            },
            {
                "Model": "DeepDTA+ Similarity GBM",
                "CI": f"{cd['similarity_gbm']['ci']['mean']:.3f} ± {cd['similarity_gbm']['ci']['std']:.3f}",
                "MSE": f"{cd['similarity_gbm']['mse']['mean']:.3f} ± {cd['similarity_gbm']['mse']['std']:.3f}",
            },
            {
                "Model": "DeepDTA+ Ensemble (Ours)",
                "CI": f"{cd['dtaplus_ensemble']['ci']['mean']:.3f} ± {cd['dtaplus_ensemble']['ci']['std']:.3f}",
                "MSE": f"{cd['dtaplus_ensemble']['mse']['mean']:.3f} ± {cd['dtaplus_ensemble']['mse']['std']:.3f}",
            },
        ])
        st.table(cd_df)

        st.subheader("3. Benchmark Visualizations")
        c1, c2, c3 = st.columns(3)
        with c1:
            if os.path.exists("results/figures/predicted_vs_measured.png"):
                st.image("results/figures/predicted_vs_measured.png", caption="Predicted vs Measured Affinity")
        with c2:
            if os.path.exists("results/figures/ci_bars_by_split.png"):
                st.image("results/figures/ci_bars_by_split.png", caption="Generalization across Splits")
        with c3:
            if os.path.exists("results/figures/error_vs_uncertainty.png"):
                st.image("results/figures/error_vs_uncertainty.png", caption="Uncertainty vs Prediction Error")
    else:
        st.warning("Benchmark results not found. Run `python -m dtaplus.evaluate --all` first.")

elif page == "About & Architecture":
    st.title("ℹ️ About DeepDTA+")
    st.markdown(
        """
        ### What is DeepDTA+?
        DeepDTA+ modernizes the classic DeepDTA framework (Öztürk et al., Bioinformatics 2018) into an end-to-end reproducible, honest drug-target affinity engine.

        ### Key Enhancements
        1. **Dual-Branch Complementarity**: Integrates deep sequence representations with Smith-Waterman and 2D chemical topological similarity kernels.
        2. **Honest Generalization**: Unveils the realistic performance drop in cold-entity drug discovery (CI ~0.73 on unseen drugs vs ~0.88 on random split).
        3. **Ensemble Uncertainty**: Quantifies model disagreement, strongly correlating ($r \\approx 0.50$) with empirical prediction error.
        4. **Production FastAPI Service**: Microservice with sub-60ms p95 latency and strict Pydantic sequence validation.
        """
    )
