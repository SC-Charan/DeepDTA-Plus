"use client";

import React from "react";
import Link from "next/link";
import {
  FlaskConical,
  Layers,
  BarChart3,
  History,
  Search,
  Cpu,
  Database,
  ArrowRight,
  Zap,
  CheckCircle2,
  TrendingUp,
  Users,
  Clock,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FEATURES = [
  {
    id: "predict",
    icon: <FlaskConical className="h-6 w-6" />,
    title: "Predict",
    desc: "Enter a drug SMILES and protein sequence to get an estimated binding score (pKd) from the DeepDTA CNN model.",
    href: "/predict",
    color: "brand",
    cta: "Open Predictor",
    badge: "01",
  },
  {
    id: "molecule",
    icon: <Search className="h-6 w-6" />,
    title: "Molecule View",
    desc: "Look up any compound by name via PubChem. Explore chemical structure, molecular formula, weight, and copy the SMILES string.",
    href: "/search",
    color: "teal",
    cta: "Search Compounds",
    badge: "02",
  },
  {
    id: "batch",
    icon: <Layers className="h-6 w-6" />,
    title: "Virtual Screening",
    desc: "Compare several drug-protein pairs via CSV upload. View ranked results by predicted binding strength.",
    href: "/batch",
    color: "cyan",
    cta: "Start Screening",
    badge: "03",
  },
  {
    id: "model",
    icon: <Cpu className="h-6 w-6" />,
    title: "Model View",
    desc: "Understand the two-branch CNN model built with PyTorch. Explore the architecture, hyperparameters, and enhancements.",
    href: "/model",
    color: "purple",
    cta: "Explore Architecture",
    badge: "04",
  },
  {
    id: "metrics",
    icon: <Database className="h-6 w-6" />,
    title: "Data & Metrics",
    desc: "Explore the Davis and KIBA benchmark datasets and compare results against published baselines.",
    href: "/metrics",
    color: "emerald",
    cta: "View Results",
    badge: "05",
  },
  {
    id: "history",
    icon: <History className="h-6 w-6" />,
    title: "History",
    desc: "Review past prediction runs, revisit results, and manage your workspace of saved inference sessions.",
    href: "/history",
    color: "zinc",
    cta: "View History",
    badge: "06",
  },
];

const colorMap: Record<string, { icon: string; border: string; bg: string; cta: string }> = {
  brand:   { icon: "text-brand-400",  border: "hover:border-brand-500/50",  bg: "bg-brand-500/10",  cta: "text-brand-400"  },
  teal:    { icon: "text-teal-400",   border: "hover:border-teal-500/50",   bg: "bg-teal-500/10",   cta: "text-teal-400"   },
  cyan:    { icon: "text-cyan-400",   border: "hover:border-cyan-500/50",   bg: "bg-cyan-500/10",   cta: "text-cyan-400"   },
  purple:  { icon: "text-purple-400", border: "hover:border-purple-500/50", bg: "bg-purple-500/10", cta: "text-purple-400" },
  emerald: { icon: "text-emerald-400",border: "hover:border-emerald-500/50",bg: "bg-emerald-500/10",cta: "text-emerald-400"},
  zinc:    { icon: "text-zinc-400",   border: "hover:border-zinc-400/50",   bg: "bg-zinc-500/10",   cta: "text-zinc-400"   },
};

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl border border-surface-border bg-gradient-to-br from-surface-card via-surface-elevated to-[#0C1320] p-8 shadow-2xl">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-32 -bottom-16 h-48 w-48 rounded-full bg-teal-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="brand" className="gap-1.5 py-1">
              <Zap className="h-3.5 w-3.5 text-brand-400" />
              RESEARCH &amp; IMPLEMENTATION PROJECT
            </Badge>
            <Badge variant="cyan" className="gap-1.5 py-1">
              Team G1542
            </Badge>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
            DeepDTA — Drug-Target Binding Affinity Prediction
          </h1>

          <p className="text-sm md:text-base text-zinc-300 leading-relaxed">
            Predicting how strongly a drug may bind to a protein using deep learning on SMILES and amino acid sequences.
            Built on the original DeepDTA CNN paper (Öztürk et al., 2018) and enhanced with{" "}
            <strong className="text-brand-300">PyTorch</strong> and{" "}
            <strong className="text-teal-300">RDKit</strong>.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link href="/predict">
              <Button variant="glow" size="lg" className="gap-2">
                <FlaskConical className="h-4 w-4" />
                Start Predicting
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/search">
              <Button variant="secondary" size="lg" className="gap-2">
                <Search className="h-4 w-4" />
                Search Compounds
              </Button>
            </Link>
            <Link href="/metrics">
              <Button variant="outline" size="lg" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                View Results
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Problem Statement Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: <Clock className="h-5 w-5 text-amber-400" />,
            stat: "10+ years",
            label: "Discovery takes time",
            desc: "Researchers must test many possible drugs against many protein targets in the lab.",
          },
          {
            icon: <DollarSign className="h-5 w-5 text-red-400" />,
            stat: "$1B+",
            label: "Lab testing is costly",
            desc: "Testing every drug-protein pair in a laboratory takes significant time and money.",
          },
          {
            icon: <Zap className="h-5 w-5 text-emerald-400" />,
            stat: "Seconds",
            label: "We can shortlist pairs",
            desc: "A computer model estimates binding strength so only promising pairs go to the lab.",
          },
        ].map((p) => (
          <Card key={p.stat} className="border-surface-border hover:border-zinc-500/30 transition-all">
            <CardContent className="pt-5 space-y-2">
              <div className="flex items-center gap-2">{p.icon}<span className="text-2xl font-bold font-mono text-white">{p.stat}</span></div>
              <div className="text-xs font-semibold text-zinc-200">{p.label}</div>
              <p className="text-xs text-zinc-400 leading-relaxed">{p.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Key Dataset Numbers */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Davis Drugs", value: "68", sub: "Kinase inhibitors", color: "text-brand-400" },
          { label: "Davis Proteins", value: "442", sub: "Kinase targets", color: "text-teal-400" },
          { label: "Training Pairs", value: "30,056", sub: "Drug-protein pairs", color: "text-cyan-400" },
          { label: "Benchmark CI", value: "0.885", sub: "Beats original 0.878", color: "text-emerald-400" },
        ].map((s) => (
          <Card key={s.label} className="hover:border-zinc-500/30 transition-all">
            <CardContent className="pt-5">
              <div className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</div>
              <div className="text-xs font-semibold text-zinc-200 mt-1">{s.label}</div>
              <div className="text-[11px] text-zinc-400 mt-0.5">{s.sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 6 Application Features */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-white">Application Features</h2>
          <p className="text-xs text-zinc-400 mt-0.5">Six ways to explore drug-protein pairs, all in one place.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => {
            const c = colorMap[f.color];
            return (
              <Card
                key={f.id}
                className={`relative group overflow-hidden border-surface-border ${c.border} transition-all`}
              >
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${c.bg} ${c.icon} border border-white/5 group-hover:scale-110 transition-transform`}>
                      {f.icon}
                    </div>
                    <span className="text-2xl font-black font-mono text-zinc-700">{f.badge}</span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white">{f.title}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">{f.desc}</p>
                  </div>
                  <Link href={f.href} className="inline-block pt-1">
                    <span className={`text-xs font-semibold ${c.cta} flex items-center gap-1 group-hover:translate-x-1 transition-transform`}>
                      {f.cta} <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* How it works */}
      <Card className="border-surface-border bg-surface-card/60">
        <CardHeader>
          <CardTitle className="text-base text-zinc-200">How It Works</CardTitle>
          <CardDescription>One round trip: send your inputs, predict in the backend, see the result.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {[
              {
                n: "01",
                title: "Enter Drug + Protein Details",
                desc: "Provide a canonical SMILES string for the drug and an amino acid sequence for the target protein.",
              },
              {
                n: "02",
                title: "RDKit Validates the Molecule",
                desc: "RDKit reads the SMILES, checks the molecular structure, and enriches the input with chemistry-aware features.",
              },
              {
                n: "03",
                title: "PyTorch DeepDTA Predicts",
                desc: "Two CNN branches process drug and protein separately, then dense layers estimate the binding strength (pKd).",
              },
              {
                n: "04",
                title: "View Score & Compound Info",
                desc: "The app shows the predicted pKd score, converted Kd in nM, and a confidence indicator alongside molecular details.",
              },
            ].map((step) => (
              <div key={step.n} className="flex items-start gap-3 rounded-lg bg-surface-elevated/50 p-3 border border-surface-border/50">
                <div className="flex-shrink-0 h-7 w-7 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 flex items-center justify-center text-[11px] font-bold">
                  {step.n}
                </div>
                <div>
                  <p className="font-semibold text-zinc-200">{step.title}</p>
                  <p className="text-zinc-400 mt-0.5 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Team */}
      <Card className="border-surface-border/50 bg-surface-card/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-zinc-300 flex items-center gap-2">
            <Users className="h-4 w-4 text-zinc-400" /> Team G1542
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 text-xs">
            {[
              { name: "Havisha", roll: "245525733012" },
              { name: "SaiCharan", roll: "245525733021" },
              { name: "Abhinov", roll: "245525733001" },
              { name: "Rishitha", roll: "245525733020" },
              { name: "Hariharan", roll: "245525733002" },
            ].map((m) => (
              <div key={m.roll} className="flex flex-col rounded-lg bg-surface-elevated border border-surface-border px-3 py-2">
                <span className="font-semibold text-zinc-200">{m.name}</span>
                <span className="text-[10px] font-mono text-zinc-500">{m.roll}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
