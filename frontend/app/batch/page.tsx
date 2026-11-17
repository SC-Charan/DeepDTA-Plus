"use client";

import React, { useState } from "react";
import {
  Layers,
  UploadCloud,
  FileSpreadsheet,
  Download,
  Filter,
  Search,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Sparkles,
  ArrowUpDown,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BatchItem, BindingCategory } from "@/lib/types";
import { SAMPLE_COMPOUNDS, SAMPLE_PROTEINS } from "@/lib/mock-data";
import { predictBatch } from "@/lib/api";
import { exportToCsv, formatKd, getBindingBadgeStyles } from "@/lib/utils";

export default function BatchScreeningPage() {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [targetProtein, setTargetProtein] = useState(SAMPLE_PROTEINS[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  // Load sample dataset
  const handleLoadSampleDataset = () => {
    const defaultTarget = targetProtein;
    const sampleRows: BatchItem[] = SAMPLE_COMPOUNDS.map((c, idx) => ({
      id: `batch-${idx + 1}`,
      compound_name: c.name,
      smiles: c.smiles,
      target_id: defaultTarget.id,
      target_sequence: defaultTarget.sequence,
      status: "pending",
    }));
    setItems(sampleRows);
    setProgress(0);
  };

  // CSV file parser
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split("\n").filter((l) => l.trim().length > 0);
      if (lines.length <= 1) return;

      // Simple CSV parse
      const newItems: BatchItem[] = [];
      // Skip header line
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(",").map((p) => p.replace(/^["']|["']$/g, "").trim());
        if (parts.length >= 2) {
          const compName = parts[0] || `Compound_${i}`;
          const smi = parts[1];
          const tgtId = parts[2] || targetProtein.id;
          newItems.push({
            id: `batch-upload-${i}`,
            compound_name: compName,
            smiles: smi,
            target_id: tgtId,
            target_sequence: targetProtein.sequence,
            status: "pending",
          });
        }
      }

      if (newItems.length > 0) {
        setItems(newItems);
        setProgress(0);
      }
    };
    reader.readAsText(file);
  };

  // Execute batch screening
  const handleRunBatchScreening = async () => {
    if (items.length === 0) return;
    setIsProcessing(true);
    setProgress(15);

    try {
      // Simulate stepped progress
      const progressTimer = setInterval(() => {
        setProgress((prev) => (prev < 85 ? prev + 18 : prev));
      }, 350);

      const processed = await predictBatch(items);
      clearInterval(progressTimer);

      setProgress(100);
      setItems(processed);
    } catch {
      // Error handling
    } finally {
      setIsProcessing(false);
    }
  };

  // Export to CSV
  const handleExportCsv = () => {
    if (items.length === 0) return;
    const exportRows = items.map((item, idx) => ({
      Rank: idx + 1,
      Compound_Name: item.compound_name,
      SMILES: item.smiles,
      Target_ID: item.target_id,
      Predicted_pKd: item.pkd ?? "N/A",
      Equilibrium_Kd_nM: item.kd_nM ?? "N/A",
      Binding_Level: item.binding_level ?? "Unprocessed",
      Status: item.status,
    }));
    exportToCsv(`deepdta_batch_screening_${targetProtein.id}_${Date.now()}.csv`, exportRows);
  };

  // Filtered and sorted items
  const filteredItems = items
    .filter((item) => {
      const matchSearch =
        item.compound_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.smiles.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory =
        categoryFilter === "ALL" || item.binding_level === categoryFilter;
      return matchSearch && matchCategory;
    })
    .sort((a, b) => {
      const valA = a.pkd ?? -1;
      const valB = b.pkd ?? -1;
      return sortOrder === "desc" ? valB - valA : valA - valB;
    });

  const completedCount = items.filter((x) => x.status === "completed").length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Layers className="h-6 w-6 text-teal-400" />
            Batch Screening Studio
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            High-throughput binding affinity screening of compound libraries against kinase targets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleLoadSampleDataset}
            className="text-xs gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5 text-brand-400" />
            Load Sample Library (8 Drugs)
          </Button>

          {items.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              className="text-xs gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              Export Screened CSV
            </Button>
          )}
        </div>
      </div>

      {/* Target Selector & CSV Upload Dropzone */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Target Kinase Card */}
        <Card className="border-surface-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase font-mono text-zinc-400">
              Screening Target
            </CardTitle>
            <CardDescription>Select the protein kinase domain to screen against</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              {SAMPLE_PROTEINS.map((prot) => (
                <button
                  key={prot.id}
                  onClick={() => setTargetProtein(prot)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-xs transition-all ${
                    targetProtein.id === prot.id
                      ? "bg-teal-500/15 border-teal-500/40 text-teal-300"
                      : "bg-surface-elevated/70 border-surface-border text-zinc-400 hover:text-white"
                  }`}
                >
                  <div className="text-left">
                    <span className="font-bold text-zinc-200">{prot.id}</span>
                    <span className="text-[10px] text-zinc-400 block truncate">{prot.name}</span>
                  </div>
                  <span className="font-mono text-[10px] text-zinc-500">{prot.length} aa</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CSV Dropzone (2 cols on md) */}
        <Card className="md:col-span-2 border-surface-border flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase font-mono text-zinc-400">
              Upload Compound Library
            </CardTitle>
            <CardDescription>
              Drag and drop a CSV file containing columns: <code>Compound_Name, SMILES</code>
            </CardDescription>
          </CardHeader>

          <CardContent>
            <label className="flex flex-col items-center justify-center h-36 rounded-xl border-2 border-dashed border-surface-border hover:border-brand-500/50 bg-surface-elevated/40 hover:bg-brand-500/5 transition-all cursor-pointer">
              <UploadCloud className="h-8 w-8 text-brand-400 mb-2" />
              <span className="text-xs font-semibold text-zinc-200">
                Click to browse or drop CSV library here
              </span>
              <span className="text-[10px] text-zinc-400 mt-1">
                Supports up to 256 molecules per batch screening
              </span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </CardContent>
        </Card>
      </div>

      {/* Table & Batch Operations */}
      {items.length > 0 && (
        <Card className="border-surface-border space-y-4">
          <CardHeader className="pb-3 border-b border-surface-border/60">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-teal-400" />
                  Library Queue ({items.length} Compounds)
                </CardTitle>
                <CardDescription>
                  Screening against <strong className="text-teal-300">{targetProtein.id}</strong> ({targetProtein.name})
                </CardDescription>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="glow"
                  size="sm"
                  onClick={handleRunBatchScreening}
                  isLoading={isProcessing}
                  className="text-xs font-bold gap-1.5"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  {isProcessing ? "Processing Batch..." : "Run Batch Screening"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setItems([])}
                  className="text-xs"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1" />
                  Clear
                </Button>
              </div>
            </div>

            {/* Progress bar if screening */}
            {isProcessing && (
              <div className="pt-3 space-y-1">
                <div className="flex justify-between text-xs font-mono text-zinc-400">
                  <span>Evaluating molecular features...</span>
                  <span className="text-brand-400">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-4 pt-0">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="w-full sm:w-72">
                <Input
                  icon={<Search className="h-4 w-4" />}
                  placeholder="Filter by compound name or SMILES..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="h-8 rounded-lg border border-surface-border bg-surface-elevated px-2 text-xs text-zinc-300 focus:outline-none"
                >
                  <option value="ALL">All Categories</option>
                  <option value="Very High Binding">Very High Binding (&gt; 8.0)</option>
                  <option value="High Binding">High Binding (7.0 - 8.0)</option>
                  <option value="Moderate Binding">Moderate Binding (6.0 - 7.0)</option>
                  <option value="No Significant Binding">No Significant Binding (&lt; 6.0)</option>
                </select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                  className="h-8 text-xs gap-1"
                >
                  <ArrowUpDown className="h-3 w-3" />
                  pKd ({sortOrder.toUpperCase()})
                </Button>
              </div>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto rounded-lg border border-surface-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-elevated/80 text-[11px] font-mono uppercase text-zinc-400 border-b border-surface-border">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Compound Name</th>
                    <th className="py-2.5 px-3">SMILES String</th>
                    <th className="py-2.5 px-3">Target</th>
                    <th className="py-2.5 px-3 text-right">Predicted pKd</th>
                    <th className="py-2.5 px-3 text-right">Equilibrium Kd</th>
                    <th className="py-2.5 px-3">Binding Level</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border/50">
                  {filteredItems.map((item, idx) => (
                    <tr
                      key={item.id}
                      className="hover:bg-surface-elevated/40 transition-colors"
                    >
                      <td className="py-2.5 px-3 font-mono text-zinc-400">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-semibold text-zinc-200">
                        {item.compound_name}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-zinc-400 max-w-[200px] truncate" title={item.smiles}>
                        {item.smiles}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-teal-400">{item.target_id}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                        {item.pkd !== undefined ? item.pkd.toFixed(3) : "—"}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-teal-300">
                        {item.kd_nM !== undefined ? formatKd(item.kd_nM) : "—"}
                      </td>
                      <td className="py-2.5 px-3">
                        {item.binding_level ? (
                          (() => {
                            const styles = getBindingBadgeStyles(item.binding_level as BindingCategory);
                            return (
                              <span
                                className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-medium ${styles.badgeClass}`}
                              >
                                <span className={`h-1.5 w-1.5 rounded-full ${styles.dotColor}`} />
                                {item.binding_level}
                              </span>
                            );
                          })()
                        ) : (
                          <span className="text-zinc-500">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {item.status === "completed" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                            <CheckCircle2 className="h-3 w-3" /> Done
                          </span>
                        ) : item.status === "failed" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-red-400 font-mono">
                            <AlertCircle className="h-3 w-3" /> Failed
                          </span>
                        ) : (
                          <span className="text-[10px] text-zinc-400 font-mono">Pending</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Screening summary footer */}
            <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
              <span>
                Showing {filteredItems.length} of {items.length} compounds ({completedCount} screened)
              </span>
              <span>Target: {targetProtein.id} (P00519)</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
