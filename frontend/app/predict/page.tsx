"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  FlaskConical,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  Copy,
  Download,
  Bookmark,
  RefreshCw,
  Dna,
  Activity,
  Search,
  Loader2,
  ShieldCheck,
  ChevronDown,
  Info,
  Printer,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MolecularStructurePreview } from "@/components/chemistry/structure-preview";
import { SAMPLE_COMPOUNDS, SAMPLE_PROTEINS } from "@/lib/mock-data";
import { predictAffinity } from "@/lib/api";
import { PredictionResult } from "@/lib/types";
import {
  formatKd,
  getBindingBadgeStyles,
  validateSmiles,
  validateProteinSequence,
  exportToJson,
} from "@/lib/utils";
import { fetchPubChemData, fetchSuggestions, PubChemCompound } from "@/lib/pubchem";
import { fetchUniProtProtein, fetchProteinSuggestions, UniProtProtein } from "@/lib/uniprot";

/** Safely format a numeric field that might arrive as string from the API. */
function safeFixed(val: unknown, decimals: number): string {
  const n = Number(val);
  return isNaN(n) ? "—" : n.toFixed(decimals);
}

function PredictorStudioContent() {
  const searchParams = useSearchParams();
  const urlSmiles = searchParams.get("smiles") ?? "";
  const urlName = searchParams.get("name") ?? "";

  // Drug State
  const [compoundName, setCompoundName] = useState<string>(urlName || "Dasatinib");
  const [smiles, setSmiles] = useState<string>(urlSmiles || SAMPLE_COMPOUNDS[0].smiles);
  const [cid, setCid] = useState<number | undefined>(undefined);
  const [molecularFormula, setMolecularFormula] = useState<string | undefined>(SAMPLE_COMPOUNDS[0].formula);
  const [molecularWeight, setMolecularWeight] = useState<number | undefined>(SAMPLE_COMPOUNDS[0].weight);

  // PubChem Lookup State
  const [isSearchingPubChem, setIsSearchingPubChem] = useState<boolean>(false);
  const [pubchemStatus, setPubchemStatus] = useState<string | null>(null);
  const [drugSuggestions, setDrugSuggestions] = useState<string[]>([]);
  const [showDrugSuggestions, setShowDrugSuggestions] = useState<boolean>(false);

  // Target Protein State
  const [targetName, setTargetName] = useState<string>("ABL1 (Tyrosine-protein kinase ABL1)");
  const [proteinSeq, setProteinSeq] = useState<string>(SAMPLE_PROTEINS[0].sequence);
  const [uniprotAcc, setUniprotAcc] = useState<string>(SAMPLE_PROTEINS[0].uniprot);

  // UniProt Lookup State
  const [isSearchingUniProt, setIsSearchingUniProt] = useState<boolean>(false);
  const [uniprotStatus, setUniprotStatus] = useState<string | null>(null);
  const [proteinSuggestions, setProteinSuggestions] = useState<Array<{ gene: string; name: string; accession: string }>>([]);
  const [showProteinSuggestions, setShowProteinSuggestions] = useState<boolean>(false);

  // Workbench view toggle: "drug" vs "protein" tabs to save vertical space
  const [activeWorkbenchTab, setActiveWorkbenchTab] = useState<"drug" | "protein">("drug");

  // Sync URL search params dynamically if redirected from /search
  useEffect(() => {
    if (urlSmiles) {
      setSmiles(urlSmiles);
      if (urlName) setCompoundName(urlName);
    }
  }, [urlSmiles, urlName]);

  // Inference & UI state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Debounced Drug Suggestions
  const drugTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleDrugNameChange = (val: string) => {
    setCompoundName(val);
    setPubchemStatus(null);
    if (drugTimerRef.current) clearTimeout(drugTimerRef.current);
    if (val.trim().length >= 3) {
      drugTimerRef.current = setTimeout(async () => {
        const suggs = await fetchSuggestions(val.trim(), 5);
        setDrugSuggestions(suggs);
        setShowDrugSuggestions(suggs.length > 0);
      }, 350);
    } else {
      setDrugSuggestions([]);
      setShowDrugSuggestions(false);
    }
  };

  // Perform PubChem Drug Lookup
  const handleLookupPubChem = async (queryToUse?: string) => {
    const q = (queryToUse || compoundName).trim();
    if (!q) return;

    setIsSearchingPubChem(true);
    setPubchemStatus(null);
    setShowDrugSuggestions(false);

    try {
      const data: PubChemCompound = await fetchPubChemData(q);
      setCompoundName(data.iupacName && data.iupacName !== "N/A" ? q : q);
      setSmiles(data.canonicalSMILES || data.isomericSMILES);
      setCid(data.cid);
      setMolecularFormula(data.molecularFormula);
      setMolecularWeight(data.molecularWeight);
      setPubchemStatus(`Found in PubChem (CID: ${data.cid})`);
    } catch (err: any) {
      // Check if it's in our local benchmark presets
      const local = SAMPLE_COMPOUNDS.find(
        (c) => c.name.toLowerCase() === q.toLowerCase()
      );
      if (local) {
        setCompoundName(local.name);
        setSmiles(local.smiles);
        setMolecularFormula(local.formula);
        setMolecularWeight(local.weight);
        setPubchemStatus(`Loaded preset: ${local.name}`);
      } else {
        setPubchemStatus(`PubChem: "${q}" not found. You can enter SMILES manually.`);
      }
    } finally {
      setIsSearchingPubChem(false);
    }
  };

  // Debounced UniProt Suggestions
  const proteinTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleProteinQueryChange = (val: string) => {
    setTargetName(val);
    setUniprotStatus(null);
    if (proteinTimerRef.current) clearTimeout(proteinTimerRef.current);
    if (val.trim().length >= 2) {
      proteinTimerRef.current = setTimeout(async () => {
        const suggs = await fetchProteinSuggestions(val.trim());
        setProteinSuggestions(suggs);
        setShowProteinSuggestions(suggs.length > 0);
      }, 400);
    } else {
      setProteinSuggestions([]);
      setShowProteinSuggestions(false);
    }
  };

  // Perform UniProt Lookup
  const handleLookupUniProt = async (queryToUse?: string) => {
    const q = (queryToUse || targetName).trim();
    if (!q) return;

    setIsSearchingUniProt(true);
    setUniprotStatus(null);
    setShowProteinSuggestions(false);

    try {
      const data: UniProtProtein = await fetchUniProtProtein(q);
      setTargetName(`${data.gene} (${data.name})`);
      setProteinSeq(data.sequence);
      setUniprotAcc(data.accession);
      setUniprotStatus(`Resolved via UniProt: ${data.accession} (${data.length} aa)`);
    } catch {
      // Check local sample targets
      const local = SAMPLE_PROTEINS.find(
        (p) =>
          p.id.toLowerCase() === q.toLowerCase() ||
          p.name.toLowerCase().includes(q.toLowerCase())
      );
      if (local) {
        setTargetName(`${local.id} (${local.name})`);
        setProteinSeq(local.sequence);
        setUniprotAcc(local.uniprot);
        setUniprotStatus(`Loaded preset target: ${local.id}`);
      } else {
        setUniprotStatus(`UniProt: "${q}" not found. You can paste FASTA sequence manually.`);
      }
    } finally {
      setIsSearchingUniProt(false);
    }
  };

  // Preset Selection Helpers
  const handleSelectCompoundPreset = (comp: (typeof SAMPLE_COMPOUNDS)[0]) => {
    setCompoundName(comp.name);
    setSmiles(comp.smiles);
    setMolecularFormula(comp.formula);
    setMolecularWeight(comp.weight);
    setCid(undefined);
    setPubchemStatus(`Preset loaded: ${comp.name}`);
  };

  const handleSelectProteinPreset = (prot: (typeof SAMPLE_PROTEINS)[0]) => {
    setTargetName(`${prot.id} (${prot.name})`);
    setProteinSeq(prot.sequence);
    setUniprotAcc(prot.uniprot);
    setUniprotStatus(`Preset loaded: ${prot.id}`);
  };

  // Validation
  const smilesValidation = validateSmiles(smiles);
  const proteinValidation = validateProteinSequence(proteinSeq);

  // Run Inference
  const handleRunPrediction = async () => {
    if (!smilesValidation.valid) {
      setErrorMsg("Please enter or look up a valid SMILES string.");
      return;
    }
    if (!proteinValidation.valid) {
      setErrorMsg("Please enter or look up a valid amino acid sequence.");
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);

    try {
      const pred = await predictAffinity({
        smiles: smiles.trim(),
        compound_name: compoundName.trim(),
        protein_sequence: proteinSeq.trim(),
        target_name: targetName.trim(),
      });
      setResult(pred);
    } catch (err: any) {
      setErrorMsg(err?.message || "Prediction request failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyJson = () => {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleSaveToWorkspace = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleExportSummary = () => {
    if (!result) return;
    exportToJson(`deepdta_inference_${result.compound_name || "ligand"}_${Date.now()}.json`, result);
  };

  // Spectrum calculation (pKd scale from 4.0 to 11.0)
  const pkdMin = 4.0;
  const pkdMax = 11.0;
  const currentPkd = result ? Math.min(Math.max(Number(result.pkd) || 7.0, pkdMin), pkdMax) : 7.0;
  const spectrumPercent = ((currentPkd - pkdMin) / (pkdMax - pkdMin)) * 100;

  return (
    <div className="space-y-4">
      {/* Studio Header (Compact) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-surface-border">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-brand-400" />
            Binding Affinity Predictor Studio
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Auto-fetch SMILES from PubChem &amp; FASTA sequences from UniProt, then run deep ensemble affinity inference.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              handleSelectCompoundPreset(SAMPLE_COMPOUNDS[0]);
              handleSelectProteinPreset(SAMPLE_PROTEINS[0]);
            }}
            className="text-xs h-8"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Reset Defaults
          </Button>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-2.5 text-xs text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Studio Grid (Side-by-Side to eliminate excessive scrolling) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: Input Workbench (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-3">
          <Card className="border-surface-border bg-surface-card">
            <CardHeader className="pb-2 pt-3 px-4">
              <div className="flex items-center justify-between">
                {/* Workbench Tabs: Drug vs Target */}
                <div className="flex rounded-lg bg-surface-elevated p-1 border border-surface-border">
                  <button
                    onClick={() => setActiveWorkbenchTab("drug")}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                      activeWorkbenchTab === "drug"
                        ? "bg-brand-500 text-white shadow-sm"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    1. Drug (PubChem)
                  </button>
                  <button
                    onClick={() => setActiveWorkbenchTab("protein")}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                      activeWorkbenchTab === "protein"
                        ? "bg-teal-500 text-white shadow-sm"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <Dna className="h-3.5 w-3.5" />
                    2. Target (UniProt)
                  </button>
                </div>

                <Badge variant="outline" className="text-[10px] font-mono">
                  {activeWorkbenchTab === "drug"
                    ? `${smilesValidation.valid ? "SMILES OK" : "Needs SMILES"}`
                    : `${proteinValidation.length} aa`}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="px-4 pb-4 pt-1 space-y-3">
              {/* TAB 1: DRUG INPUT & PUBCHEM LINK */}
              {activeWorkbenchTab === "drug" && (
                <div className="space-y-3">
                  {/* PubChem Connected Drug Search */}
                  <div className="space-y-1 relative">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                        <Search className="h-3 w-3 text-brand-400" />
                        Drug / Compound Name (PubChem Linked):
                      </label>
                      {pubchemStatus && (
                        <span className="text-[10px] text-brand-400 truncate max-w-[190px]">
                          {pubchemStatus}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-1.5">
                      <div className="relative flex-1">
                        <Input
                          value={compoundName}
                          onChange={(e) => handleDrugNameChange(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleLookupPubChem()}
                          placeholder="Type any drug (e.g. Dasatinib, Aspirin, Osimertinib)..."
                          className="h-8 text-xs font-medium"
                        />
                        {/* Auto-suggestions dropdown */}
                        {showDrugSuggestions && drugSuggestions.length > 0 && (
                          <div className="absolute left-0 right-0 top-9 z-30 rounded-lg border border-surface-border bg-surface-elevated shadow-xl overflow-hidden">
                            {drugSuggestions.map((sugg) => (
                              <button
                                key={sugg}
                                onClick={() => {
                                  setCompoundName(sugg);
                                  handleLookupPubChem(sugg);
                                }}
                                className="w-full text-left px-3 py-1.5 text-xs text-zinc-200 hover:bg-brand-500/20 hover:text-white transition-colors"
                              >
                                {sugg}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleLookupPubChem()}
                        disabled={isSearchingPubChem || !compoundName.trim()}
                        className="h-8 px-2.5 text-xs font-semibold shrink-0 gap-1"
                      >
                        {isSearchingPubChem ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Search className="h-3.5 w-3.5" />
                        )}
                        Lookup
                      </Button>
                    </div>
                  </div>

                  {/* Canonical SMILES Field */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-mono text-zinc-400">Canonical SMILES:</label>
                      <span className={`text-[10px] font-mono ${smilesValidation.valid ? "text-emerald-400" : "text-amber-400"}`}>
                        {smiles.length} chars {smilesValidation.valid ? "✓ Valid" : "⚠ Empty"}
                      </span>
                    </div>
                    <Textarea
                      value={smiles}
                      onChange={(e) => setSmiles(e.target.value)}
                      placeholder="e.g. CC1=C(C(=CC=C1)Cl)NC(=O)..."
                      className="h-16 text-[11px] font-mono resize-none leading-relaxed"
                    />
                  </div>

                  {/* Quick-Pick Kinase Inhibitor Presets */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-zinc-400 uppercase font-mono">Benchmark Presets:</span>
                    <div className="flex flex-wrap gap-1">
                      {SAMPLE_COMPOUNDS.slice(0, 6).map((c) => (
                        <button
                          key={c.name}
                          onClick={() => handleSelectCompoundPreset(c)}
                          className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors ${
                            compoundName.toLowerCase() === c.name.toLowerCase()
                              ? "bg-brand-500/20 border-brand-500/50 text-brand-300"
                              : "bg-surface-elevated border-surface-border text-zinc-400 hover:text-white"
                          }`}
                        >
                          {c.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* High-Fidelity 2D Chemical Structure Preview */}
                  <MolecularStructurePreview
                    smiles={smiles}
                    compoundName={compoundName}
                    cid={cid}
                    molecularFormula={molecularFormula}
                    molecularWeight={molecularWeight}
                  />
                </div>
              )}

              {/* TAB 2: TARGET PROTEIN INPUT & UNIPROT LINK */}
              {activeWorkbenchTab === "protein" && (
                <div className="space-y-3">
                  {/* UniProt Connected Target Search */}
                  <div className="space-y-1 relative">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                        <Search className="h-3 w-3 text-teal-400" />
                        Target Kinase / Gene (UniProt Linked):
                      </label>
                      {uniprotStatus && (
                        <span className="text-[10px] text-teal-400 truncate max-w-[190px]">
                          {uniprotStatus}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-1.5">
                      <div className="relative flex-1">
                        <Input
                          value={targetName}
                          onChange={(e) => handleProteinQueryChange(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleLookupUniProt()}
                          placeholder="Type gene or protein (e.g. EGFR, ABL1, BRAF, KIT)..."
                          className="h-8 text-xs font-medium"
                        />
                        {/* Auto-suggestions dropdown */}
                        {showProteinSuggestions && proteinSuggestions.length > 0 && (
                          <div className="absolute left-0 right-0 top-9 z-30 rounded-lg border border-surface-border bg-surface-elevated shadow-xl overflow-hidden">
                            {proteinSuggestions.map((sugg) => (
                              <button
                                key={sugg.accession}
                                onClick={() => {
                                  setTargetName(`${sugg.gene} (${sugg.name})`);
                                  handleLookupUniProt(sugg.gene);
                                }}
                                className="w-full text-left px-3 py-1.5 text-xs text-zinc-200 hover:bg-teal-500/20 hover:text-white transition-colors flex items-center justify-between"
                              >
                                <span>{sugg.gene} — {sugg.name}</span>
                                <span className="font-mono text-[10px] text-zinc-400">{sugg.accession}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleLookupUniProt()}
                        disabled={isSearchingUniProt || !targetName.trim()}
                        className="h-8 px-2.5 text-xs font-semibold shrink-0 gap-1"
                      >
                        {isSearchingUniProt ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Search className="h-3.5 w-3.5" />
                        )}
                        Lookup
                      </Button>
                    </div>
                  </div>

                  {/* FASTA Amino Acid Sequence */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-mono text-zinc-400">FASTA Sequence (Amino Acids):</label>
                      <span className={`text-[10px] font-mono ${proteinValidation.valid ? "text-teal-400" : "text-amber-400"}`}>
                        {proteinValidation.length} residues {proteinValidation.valid ? "✓ Valid" : "⚠ Empty"}
                      </span>
                    </div>
                    <Textarea
                      value={proteinSeq}
                      onChange={(e) => setProteinSeq(e.target.value)}
                      placeholder="MKWVTFISLLFLFSSAY..."
                      className="h-28 text-[11px] font-mono uppercase resize-none leading-relaxed"
                    />
                  </div>

                  {/* Target Kinase Benchmark Presets */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-zinc-400 uppercase font-mono">Reference Targets:</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {SAMPLE_PROTEINS.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => handleSelectProteinPreset(p)}
                          className={`p-2 rounded text-left border transition-all ${
                            targetName.startsWith(p.id)
                              ? "bg-teal-500/20 border-teal-500/50 text-teal-300 shadow-sm"
                              : "bg-surface-elevated border-surface-border text-zinc-400 hover:text-white"
                          }`}
                        >
                          <div className="text-xs font-bold">{p.id}</div>
                          <div className="text-[9px] text-zinc-500 truncate">{p.uniprot}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Target Summary Card */}
                  <div className="rounded-lg border border-surface-border bg-surface-elevated/40 p-2.5 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-zinc-400">
                      <span>UniProt Accession:</span>
                      <span className="font-mono font-bold text-teal-300">{uniprotAcc || "P00519"}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-zinc-400">
                      <span>Organism:</span>
                      <span className="text-zinc-200">Homo sapiens</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-zinc-400">
                      <span>Domain Type:</span>
                      <span className="text-zinc-200">Protein Kinase Catalytic Domain</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Primary Action Button */}
              <Button
                variant="glow"
                size="md"
                className="w-full h-11 text-xs font-bold tracking-wide gap-2 shadow-lg mt-2"
                onClick={handleRunPrediction}
                isLoading={isLoading}
              >
                <Zap className="h-4 w-4" />
                {isLoading ? "Featurizing & Computing Ensemble..." : "Run Binding Affinity Inference"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Results Dashboard (7 cols on lg, zero dead vertical space) */}
        <div className="lg:col-span-7 space-y-3">
          {result ? (
            <div className="space-y-3">
              {/* HIGHLIGHTED BINDING AFFINITY STATUS CARD */}
              <Card className="border-surface-border relative overflow-hidden bg-gradient-to-br from-surface-card to-[#09101D] shadow-xl">
                <div className="absolute right-0 top-0 h-36 w-36 bg-brand-500/10 blur-3xl pointer-events-none" />

                <CardHeader className="pb-2 pt-3 px-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                          Inference Output
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] text-brand-400 font-medium px-2 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/20">
                          <ShieldCheck className="h-3 w-3" />
                          Calibrated Ensemble
                        </span>
                      </div>
                      <h2 className="text-lg font-bold text-white mt-0.5">
                        {result.compound_name || "Compound"} + {result.target_name || "Target"}
                      </h2>
                    </div>

                    {/* PROMINENT BINDING AFFINITY STATUS HIGHLIGHT */}
                    {(() => {
                      const styles = getBindingBadgeStyles(result.binding_level);
                      return (
                        <div
                          className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-extrabold uppercase tracking-wide ${styles.badgeClass} ${styles.glowClass}`}
                        >
                          <span className={`h-2.5 w-2.5 rounded-full animate-pulse ${styles.dotColor}`} />
                          {result.binding_level}
                        </div>
                      );
                    })()}
                  </div>
                </CardHeader>

                <CardContent className="px-4 pb-4 pt-1 space-y-3">
                  {/* Primary Metric Trio */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="rounded-xl border border-surface-border bg-surface-elevated/90 p-3">
                      <span className="text-[10px] font-mono text-zinc-400 uppercase">
                        Predicted Affinity
                      </span>
                      <div className="text-2xl font-black font-mono text-emerald-400 mt-0.5">
                        {safeFixed(result.pkd, 3)}
                      </div>
                      <span className="text-[10px] text-zinc-400">
                        pK<sub>d</sub> = -log<sub>10</sub>(K<sub>d</sub> / 10<sup>9</sup>)
                      </span>
                    </div>

                    <div className="rounded-xl border border-surface-border bg-surface-elevated/90 p-3">
                      <span className="text-[10px] font-mono text-zinc-400 uppercase">
                        Dissociation (K<sub>d</sub>)
                      </span>
                      <div className="text-2xl font-black font-mono text-teal-300 mt-0.5">
                        {formatKd(result.kd_nM)}
                      </div>
                      <span className="text-[10px] text-zinc-400">
                        Equilibrium dissociation
                      </span>
                    </div>

                    <div className="rounded-xl border border-surface-border bg-surface-elevated/90 p-3">
                      <span className="text-[10px] font-mono text-zinc-400 uppercase">
                        Uncertainty Spread
                      </span>
                      <div className="text-2xl font-black font-mono text-cyan-300 mt-0.5">
                        ±{safeFixed(result.uncertainty, 3)}
                      </div>
                      <span className="text-[10px] text-zinc-400">
                        Model disagreement (σ)
                      </span>
                    </div>
                  </div>

                  {/* CONTINUOUS AFFINITY SPECTRUM GAUGE */}
                  <div className="rounded-xl border border-surface-border bg-surface-elevated/40 p-3 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-zinc-200 flex items-center gap-1.5">
                        <Activity className="h-3.5 w-3.5 text-brand-400" />
                        Affinity Spectrum Position
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400">
                        95% CI: [{safeFixed(Math.max(4.0, (Number(result.pkd) || 7.0) - 1.96 * (Number(result.uncertainty) || 0.15)), 2)} — {safeFixed(Math.min(11.0, (Number(result.pkd) || 7.0) + 1.96 * (Number(result.uncertainty) || 0.15)), 2)}]
                      </span>
                    </div>

                    <div className="relative h-2.5 w-full rounded-full bg-gradient-to-r from-rose-500/80 via-amber-500/80 via-teal-500/80 to-emerald-400 p-0.5">
                      <div
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none transition-all duration-500"
                        style={{ left: `${spectrumPercent}%` }}
                      >
                        <div className="h-4.5 w-2 rounded bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)] border border-black/40" />
                      </div>
                    </div>

                    <div className="flex justify-between text-[9px] text-zinc-400 font-mono pt-0.5">
                      <span>4.0 (Weak / &gt;100 µM)</span>
                      <span>7.0 (100 nM)</span>
                      <span>9.0 (1 nM)</span>
                      <span className="text-emerald-400 font-semibold">11.0 (Picomolar)</span>
                    </div>
                  </div>

                  {/* Biochemical Verdict Explanation Callout */}
                  <div className="rounded-lg bg-brand-500/10 border border-brand-500/20 p-2.5 text-xs text-zinc-300 leading-relaxed">
                    <strong className="text-brand-300">Biochemical Interpretation:</strong>{" "}
                    {result.binding_explanation}
                  </div>

                  {/* Quick Action Drawer */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-surface-border/50">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleSaveToWorkspace}
                      className="gap-1.5 text-xs h-7"
                    >
                      <Bookmark className="h-3 w-3 text-brand-400" />
                      {savedSuccess ? "Saved!" : "Save"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyJson}
                      className="gap-1.5 text-xs h-7"
                    >
                      <Copy className="h-3 w-3" />
                      {copySuccess ? "Copied!" : "Copy JSON"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportSummary}
                      className="gap-1.5 text-xs h-7"
                    >
                      <Download className="h-3 w-3" />
                      Export (.json)
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => typeof window !== "undefined" && window.print()}
                      className="gap-1.5 text-xs h-7"
                    >
                      <Printer className="h-3 w-3 text-cyan-400" />
                      Print / PDF Report
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* TARGET RESIDUE BINDING POCKET ATTENTION PROFILE */}
              <Card className="border-surface-border">
                <CardHeader className="pb-1 pt-3 px-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                      <Dna className="h-3.5 w-3.5 text-teal-400" />
                      Predicted Binding Pocket Attention Profile
                    </CardTitle>
                    <span className="text-[10px] font-mono text-zinc-400">Target Focus Weights</span>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-3 pt-1">
                  <div className="h-[120px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={result.residues} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                        <XAxis dataKey="pos" tick={{ fill: "#64748B", fontSize: 8.5 }} />
                        <YAxis domain={[0, 1]} tick={{ fill: "#64748B", fontSize: 8.5 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#111622",
                            borderColor: "#1F293D",
                            borderRadius: "6px",
                            fontSize: "10px",
                            color: "#fff",
                          }}
                          formatter={(val: any, name: any, item: any) => [
                            `Attention: ${val} (Residue ${item.payload.residue}${item.payload.pos})`,
                            "Weight",
                          ]}
                        />
                        <Bar dataKey="score" radius={[2, 2, 0, 0]}>
                          {result.residues.map((r, idx) => (
                            <Cell key={`res-${idx}`} fill={r.isPocket ? "#10B981" : "#1E293B"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1 border-t border-surface-border/40">
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded bg-emerald-400" /> Pocket Residues
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded bg-surface-border" /> Scaffolding Residues
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* Empty State Waiting for Prediction (Compact, eye-level) */
            <Card className="border-dashed border-surface-border flex flex-col items-center justify-center p-8 text-center min-h-[420px] bg-surface-card/40">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-elevated/80 border border-surface-border text-brand-400 mb-3 shadow-glow">
                <FlaskConical className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-white">Inference Engine Ready</h3>
              <p className="text-xs text-zinc-400 max-w-xs mt-1 mb-4 leading-relaxed">
                Type any drug or target on the left to auto-fetch structures from PubChem and UniProt, then run affinity inference.
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleRunPrediction}
                isLoading={isLoading}
                className="gap-2 text-xs h-8"
              >
                <Zap className="h-3.5 w-3.5 text-brand-400" />
                Run Benchmark Pair (Dasatinib + ABL1)
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PredictorStudioPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-zinc-400">Loading Predictor Studio...</div>}>
      <PredictorStudioContent />
    </Suspense>
  );
}
