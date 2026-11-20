"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FlaskConical,
  Search,
  Layers,
  Cpu,
  BarChart2,
  Clock,
  ArrowRight,
  Dna,
  ChevronRight,
  Sparkles,
  Zap,
  Activity,
  ShieldCheck,
  Play,
  RotateCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const STATS = [
  { value: "68", label: "Drugs", sub: "Davis kinase inhibitors", trend: "+100% characterized" },
  { value: "442", label: "Proteins", sub: "Kinase target sequences", trend: "Full kinome coverage" },
  { value: "30,056", label: "Interaction Pairs", sub: "Measured Kd affinities", trend: "69.6% non-binding floor" },
  { value: "0.8866", label: "Peak Val CI", sub: "Epoch 70 (CUDA T4)", trend: "vs. 0.878 paper" },
];

const QUICK_SCREEN_PAIRS = [
  {
    drug: "Dasatinib",
    target: "ABL1 Kinase",
    smiles: "CC1=C(C(=CC=C1)Cl)NC(=O)C2=CN=C(S2)NC3=CC(=NC(=N3)C)N4CCN(CC4)CCO",
    pkd: 9.85,
    kd: "0.14 nM",
    level: "Very High",
    color: "from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-300",
  },
  {
    drug: "Imatinib",
    target: "ABL1 Kinase",
    smiles: "CC1=C(C=C(C=C1)NC(=O)C2=CC=C(C=C2)CN3CCN(CC3)C)NC4=NC=CC(=N4)C5=CN=CC=C5",
    pkd: 8.65,
    kd: "2.24 nM",
    level: "High",
    color: "from-blue-500/20 to-cyan-500/20 border-cyan-500/30 text-cyan-300",
  },
  {
    drug: "Erlotinib",
    target: "EGFR Kinase",
    smiles: "COCCOC1=C(C=C2C(=C1)C(=NC=N2)NC3=CC=CC(=C3)C#C)OCCOC",
    pkd: 8.15,
    kd: "7.08 nM",
    level: "High",
    color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-300",
  },
];

const FEATURES = [
  {
    icon: FlaskConical,
    num: "01",
    title: "Predictor Studio",
    desc: "Single-pair deep inference. Input SMILES & protein sequence to calculate pKd, Kd (nM), and ensemble standard deviation uncertainty.",
    href: "/predict",
    cta: "Launch Predictor",
    badge: "Core AI Engine",
    gradient: "from-purple-500/15 via-purple-500/5 to-transparent",
    border: "group-hover:border-purple-500/40",
    glow: "group-hover:shadow-[0_0_30px_-5px_rgba(167,139,250,0.3)]",
  },
  {
    icon: Search,
    num: "02",
    title: "PubChem Explorer",
    desc: "Search millions of bioactive compounds via live NCBI PubChem REST API. Instantly retrieve formulas, weights, and canonical 2D SMILES.",
    href: "/search",
    cta: "Explore Compounds",
    badge: "Live API",
    gradient: "from-cyan-500/15 via-cyan-500/5 to-transparent",
    border: "group-hover:border-cyan-500/40",
    glow: "group-hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.3)]",
  },
  {
    icon: Layers,
    num: "03",
    title: "Virtual Screening",
    desc: "High-throughput CSV library screening. Drag-and-drop batch compound files, filter by affinity tier, and export ranked CSV results.",
    href: "/batch",
    cta: "Screen Library",
    badge: "High-Throughput",
    gradient: "from-pink-500/15 via-pink-500/5 to-transparent",
    border: "group-hover:border-pink-500/40",
    glow: "group-hover:shadow-[0_0_30px_-5px_rgba(236,72,153,0.3)]",
  },
  {
    icon: Cpu,
    num: "04",
    title: "Model Architecture",
    desc: "Dual-branch 1D CNN with global max-pooling and 4-layer MLP head. Inspect hyperparameters, tensor shapes, and PyTorch skeleton.",
    href: "/model",
    cta: "View Layers",
    badge: "PyTorch 2.x",
    gradient: "from-violet-500/15 via-violet-500/5 to-transparent",
    border: "group-hover:border-violet-500/40",
    glow: "group-hover:shadow-[0_0_30px_-5px_rgba(139,92,246,0.3)]",
  },
  {
    icon: BarChart2,
    num: "05",
    title: "Benchmarks & Data",
    desc: "Interactive Recharts radar & bar charts comparing DeepDTA+ against KronRLS, SimBoost, and original 2018 DeepDTA paper numbers.",
    href: "/metrics",
    cta: "Analyze Metrics",
    badge: "Davis & KIBA",
    gradient: "from-teal-500/15 via-teal-500/5 to-transparent",
    border: "group-hover:border-teal-500/40",
    glow: "group-hover:shadow-[0_0_30px_-5px_rgba(20,184,166,0.3)]",
  },
  {
    icon: Clock,
    num: "06",
    title: "Audit History",
    desc: "Session audit trail of all screened pairs, timestamps, confidence scores, and exported datasets stored locally in browser state.",
    href: "/history",
    cta: "Review History",
    badge: "Local Session",
    gradient: "from-blue-500/15 via-blue-500/5 to-transparent",
    border: "group-hover:border-blue-500/40",
    glow: "group-hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)]",
  },
];

const TEAM = [
  { name: "Havisha", roll: "245525733012", role: "Architecture & Data Pipeline" },
  { name: "SaiCharan", roll: "245525733021", role: "Model Training & API Services" },
  { name: "Abhinov", roll: "245525733001", role: "Benchmarks & Evaluation" },
  { name: "Rishitha", roll: "245525733020", role: "Frontend UI/UX & Visualization" },
  { name: "Hariharan", roll: "245525733002", role: "Validation & Testing" },
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<number>(0);

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      {/* ── Hero Banner with Dynamic Gradient Backdrop ── */}
      <section className="relative rounded-2xl border border-surface-border bg-gradient-to-br from-surface-card via-canvas to-surface-elevated/70 p-8 sm:p-10 overflow-hidden shadow-2xl">
        {/* Glow Spheres */}
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-accent/20 blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-accent-pink/15 blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-2xl space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent-bright">
                <Sparkles className="h-3.5 w-3.5 text-accent-bright" />
                Team G1542 · Deep Learning in Biotech
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-cyan/30 bg-accent-cyan/10 px-3 py-1 text-xs font-semibold text-accent-cyan">
                <Activity className="h-3.5 w-3.5" />
                Trained 100 Epochs (0.8866 CI)
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-heading tracking-tight leading-tight">
              DeepDTA<span className="text-gradient font-black">+</span>{" "}
              <span className="text-white">Precision Drug-Target Affinity</span>
            </h1>

            <p className="text-sm text-body leading-relaxed">
              High-throughput prediction of chemical binding potency (<span className="text-accent-bright font-mono">pK<sub>d</sub></span> and{" "}
              <span className="text-accent-pink font-mono">K<sub>d</sub> in nM</span>) using a dual-branch 1D Convolutional Neural Network and ensemble uncertainty modeling on kinase benchmark datasets.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href="/predict">
                <Button variant="glow" size="md" className="gap-2 font-bold shadow-lg shadow-accent/25">
                  <FlaskConical className="h-4 w-4" />
                  Launch Predictor
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/batch">
                <Button variant="secondary" size="md" className="gap-2 font-semibold">
                  <Layers className="h-4 w-4 text-accent-cyan" />
                  Batch Virtual Screening
                </Button>
              </Link>
              <Link href="/model">
                <Button variant="outline" size="md" className="gap-2 text-xs">
                  <Cpu className="h-3.5 w-3.5" />
                  CNN Architecture
                </Button>
              </Link>
            </div>
          </div>

          {/* Dynamic Interactive Preview Card */}
          <div className="w-full lg:w-80 rounded-xl border border-border bg-surface-elevated/70 backdrop-blur-xl p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <span className="text-xs font-bold text-heading flex items-center gap-1.5 uppercase tracking-wider">
                <Zap className="h-3.5 w-3.5 text-accent-bright fill-current" />
                Quick Benchmark Pair
              </span>
              <span className="text-[10px] font-mono text-muted">Preset {activeTab + 1}/3</span>
            </div>

            <div className="space-y-3">
              <div className="flex gap-1.5">
                {QUICK_SCREEN_PAIRS.map((item, idx) => (
                  <button
                    key={item.drug}
                    onClick={() => setActiveTab(idx)}
                    className={`flex-1 py-1 px-2 rounded text-[11px] font-semibold transition-all ${
                      activeTab === idx
                        ? "bg-accent/20 border border-accent/40 text-accent-bright"
                        : "bg-surface/50 border border-border/50 text-muted hover:text-heading"
                    }`}
                  >
                    {item.drug}
                  </button>
                ))}
              </div>

              <div className="rounded-lg border border-border/70 bg-panel/70 p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-heading">{QUICK_SCREEN_PAIRS[activeTab].drug}</span>
                  <span className="text-[10px] font-mono text-accent-cyan">{QUICK_SCREEN_PAIRS[activeTab].target}</span>
                </div>
                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-muted block">Predicted Affinity</span>
                    <span className="text-xl font-black font-mono text-accent-bright">
                      {QUICK_SCREEN_PAIRS[activeTab].pkd}{" "}
                      <span className="text-xs text-muted font-normal">pK<sub>d</sub></span>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-mono text-muted block">Equilibrium Kd</span>
                    <span className="text-xs font-bold font-mono text-accent-pink">
                      {QUICK_SCREEN_PAIRS[activeTab].kd}
                    </span>
                  </div>
                </div>
              </div>

              <Link
                href={`/predict?name=${encodeURIComponent(QUICK_SCREEN_PAIRS[activeTab].drug)}&smiles=${encodeURIComponent(QUICK_SCREEN_PAIRS[activeTab].smiles)}`}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-surface hover:bg-surface-hover border border-border text-xs font-semibold text-heading transition-colors"
              >
                <Play className="h-3 w-3 text-accent-bright fill-current" />
                Analyze In Predictor Studio
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Key Metrics Ribbon ── */}
      <section>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="group relative rounded-xl border border-border bg-panel p-5 transition-all duration-300 hover:border-accent/40 hover:-translate-y-1 hover:shadow-card-hover"
            >
              <div className="text-2xl font-black font-mono text-heading group-hover:text-accent-bright transition-colors">
                {s.value}
              </div>
              <div className="text-xs font-bold text-body mt-1">{s.label}</div>
              <div className="text-[11px] text-muted mt-0.5">{s.sub}</div>
              <div className="mt-3 inline-flex items-center gap-1 text-[10px] font-mono font-medium text-accent-cyan">
                <ShieldCheck className="h-3 w-3" />
                {s.trend}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6 Application Tools (Dynamic Cards) ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-heading tracking-tight flex items-center gap-2">
              <Zap className="h-4 w-4 text-accent-bright" />
              Integrated Research Workspace
            </h2>
            <p className="text-xs text-muted mt-0.5">Six purpose-built instruments for computational drug-target analysis.</p>
          </div>
          <Badge variant="cyan">Full Suite</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <Link
                key={f.href}
                href={f.href}
                className={`group relative rounded-xl border border-border bg-gradient-to-br ${f.gradient} p-6 transition-all duration-300 hover:-translate-y-1.5 ${f.border} ${f.glow}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border/80 bg-surface-elevated/70 text-heading shadow-sm group-hover:scale-110 transition-transform">
                    <Icon className="h-5 w-5 text-accent-bright" />
                  </div>
                  <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded border border-border bg-surface/80 text-muted group-hover:text-heading transition-colors">
                    {f.badge}
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <h3 className="text-base font-bold text-heading group-hover:text-accent-bright transition-colors">
                    {f.title}
                  </h3>
                  <span className="text-xs font-mono font-bold text-muted/60">{f.num}</span>
                </div>

                <p className="mt-2 text-xs text-body leading-relaxed min-h-[48px]">{f.desc}</p>

                <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-accent-bright group-hover:text-accent-pink transition-colors">
                  {f.cta}
                  <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Interactive How It Works Pipeline ── */}
      <section className="rounded-2xl border border-border bg-panel p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/70 pb-4">
          <div>
            <h2 className="text-base font-bold text-heading flex items-center gap-2">
              <Activity className="h-4 w-4 text-accent-pink" />
              End-to-End Prediction Flow
            </h2>
            <p className="text-xs text-muted mt-0.5">How molecules and kinase sequences are vectorized and scored.</p>
          </div>
          <span className="text-xs font-mono text-accent-cyan font-medium">Latency ~55ms</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              step: "01",
              title: "Input Parsing",
              desc: "Compound SMILES (L ≤ 85) and target FASTA sequence (L ≤ 1200) sanitized and validated.",
              detail: "PubChem API or manual input",
            },
            {
              step: "02",
              title: "Character Tokenization",
              desc: "SMILES mapped to 64-char vocabulary. Amino acids mapped to 25 single-letter codes with zero padding.",
              detail: "Integer tensor encoding",
            },
            {
              step: "03",
              title: "Dual-Branch Conv1D",
              desc: "Parallel 3-layer 1D convolutions (32→64→96 filters) extract chemical motifs and catalytic loops.",
              detail: "Global max-pooling head",
            },
            {
              step: "04",
              title: "Ensemble Scoring",
              desc: "Outputs pKd, equilibrium Kd = 10^(9-pKd) nM, and uncertainty spread (σ) across model seeds.",
              detail: "Ranking + Calibration",
            },
          ].map((item, idx) => (
            <div
              key={item.step}
              className="relative rounded-xl border border-border/70 bg-surface/50 p-5 space-y-3 hover:border-accent/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/15 border border-accent/30 text-xs font-bold text-accent-bright font-mono">
                  {item.step}
                </span>
                <span className="text-[10px] font-mono text-muted uppercase">Stage {idx + 1}</span>
              </div>
              <h4 className="text-sm font-bold text-heading">{item.title}</h4>
              <p className="text-xs text-body leading-relaxed">{item.desc}</p>
              <div className="pt-2 border-t border-border/40 text-[10px] font-mono text-accent-cyan">
                {item.detail}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Research Attribution & Team ── */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Paper Reference */}
        <div className="rounded-xl border border-border bg-panel p-6 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-heading uppercase tracking-wider">
            <Dna className="h-4 w-4 text-accent-cyan" />
            Foundational Reference
          </div>
          <p className="text-xs text-body leading-relaxed">
            Öztürk, H., Özgür, A., &amp; Ozkirimli, E. (2018).{" "}
            <em className="text-heading font-medium">DeepDTA: deep drug-target binding affinity prediction.</em>{" "}
            <span className="text-muted">Bioinformatics, 34(17), i821–i829.</span>
          </p>
          <div className="pt-2 flex items-center gap-3">
            <a
              href="https://doi.org/10.1093/bioinformatics/bty593"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-accent-bright hover:underline"
            >
              Oxford Academic DOI →
            </a>
            <span className="text-muted text-xs">·</span>
            <span className="text-xs text-muted font-mono">Davis (pKd) &amp; KIBA Datasets</span>
          </div>
        </div>

        {/* Team Members */}
        <div className="rounded-xl border border-border bg-panel p-6 space-y-3">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <div className="text-xs font-bold text-heading uppercase tracking-wider">
              Research Team (G1542)
            </div>
            <span className="text-[10px] font-mono text-accent-pink font-semibold">B.Tech 2nd Year Project</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {TEAM.map((m) => (
              <div key={m.roll} className="p-2 rounded bg-surface/60 border border-border/50 flex flex-col">
                <span className="text-xs font-semibold text-heading">{m.name}</span>
                <span className="text-[10px] font-mono text-muted">{m.roll}</span>
                <span className="text-[10px] text-accent-cyan truncate mt-0.5">{m.role}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
