"use client";

import React, { useState, useMemo } from "react";
import { validateSmiles } from "@/lib/utils";
import { CheckCircle2, AlertCircle, Sparkles, ExternalLink, Image as ImageIcon, Cpu, Loader2 } from "lucide-react";

interface StructurePreviewProps {
  smiles: string;
  compoundName?: string;
  cid?: number;
  molecularFormula?: string;
  molecularWeight?: number;
  className?: string;
}

interface AtomNode {
  id: number;
  symbol: string;
  x: number;
  y: number;
  color: string;
}

interface BondLine {
  id: string;
  source: AtomNode;
  target: AtomNode;
  isDouble?: boolean;
}

const ATOM_COLORS: Record<string, string> = {
  C: "#CBD5E1",
  N: "#60A5FA",
  O: "#F87171",
  S: "#FBBF24",
  Cl: "#34D399",
  F: "#38BDF8",
  Br: "#FB923C",
  P: "#F472B6",
};

export const MolecularStructurePreview: React.FC<StructurePreviewProps> = ({
  smiles,
  compoundName,
  cid,
  molecularFormula,
  molecularWeight,
  className = "",
}) => {
  const { valid, invalidChars } = useMemo(() => validateSmiles(smiles), [smiles]);
  const [viewMode, setViewMode] = useState<"pubchem" | "wireframe">("pubchem");
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);

  // Compute image URL from CID or SMILES
  const pubchemImageUrl = useMemo(() => {
    try {
      if (!valid || !smiles.trim()) return null;
      if (cid && cid > 0) {
        return `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/CID/${cid}/PNG?image_size=320x220`;
      }
      const encoded = encodeURIComponent(smiles.trim());
      if (!encoded) return null;
      return `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encoded}/PNG?image_size=320x220`;
    } catch {
      return null;
    }
  }, [cid, smiles, valid]);

  // Reset image states when smiles/cid changes
  React.useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [smiles, cid]);

  // Wireframe vector calculation (fast fallback)
  const { nodes, bonds, ringsCount, heteroCount } = useMemo(() => {
    if (!valid || !smiles.trim()) {
      return { nodes: [], bonds: [], ringsCount: 0, heteroCount: 0 };
    }

    const clean = smiles.trim();
    const atomList: AtomNode[] = [];
    const bondList: BondLine[] = [];
    const ringClosures: Record<number, number> = {};

    let currentX = 140;
    let currentY = 95;
    let currentAngle = 0;
    const bondLength = 24;

    let atomIdCounter = 0;
    let prevAtom: AtomNode | null = null;
    let doubleNext = false;
    let rCount = 0;
    let hCount = 0;

    const stack: { x: number; y: number; angle: number; atom: AtomNode | null }[] = [];

    for (let i = 0; i < clean.length; i++) {
      const char = clean[i];

      if (char === "(") {
        stack.push({ x: currentX, y: currentY, angle: currentAngle, atom: prevAtom });
        currentAngle += 60;
        continue;
      }

      if (char === ")") {
        const popped = stack.pop();
        if (popped) {
          currentX = popped.x;
          currentY = popped.y;
          currentAngle = popped.angle - 60;
          prevAtom = popped.atom;
        }
        continue;
      }

      if (char === "=") {
        doubleNext = true;
        continue;
      }
      if (char === "#") continue;

      if (/[0-9]/.test(char)) {
        const ringDigit = parseInt(char, 10);
        if (ringClosures[ringDigit] !== undefined) {
          const originAtomId = ringClosures[ringDigit];
          const originAtom = atomList.find((a) => a.id === originAtomId);
          if (originAtom && prevAtom && originAtom.id !== prevAtom.id) {
            bondList.push({
              id: `ring-${originAtom.id}-${prevAtom.id}`,
              source: prevAtom,
              target: originAtom,
            });
            rCount++;
          }
          delete ringClosures[ringDigit];
        } else if (prevAtom) {
          ringClosures[ringDigit] = prevAtom.id;
        }
        continue;
      }

      let sym = "";
      if (char === "C" && clean[i + 1] === "l") {
        sym = "Cl";
        i++;
      } else if (char === "B" && clean[i + 1] === "r") {
        sym = "Br";
        i++;
      } else if (/[A-Z]/.test(char)) {
        sym = char;
      } else if (/[a-z]/.test(char)) {
        sym = char.toUpperCase();
      }

      if (sym) {
        if (sym !== "C") hCount++;
        currentAngle += atomIdCounter % 2 === 0 ? 30 : -30;
        const rad = (currentAngle * Math.PI) / 180;
        currentX += Math.cos(rad) * bondLength;
        currentY += Math.sin(rad) * bondLength;

        const node: AtomNode = {
          id: atomIdCounter++,
          symbol: sym,
          x: currentX,
          y: currentY,
          color: ATOM_COLORS[sym] || "#CBD5E1",
        };

        atomList.push(node);

        if (prevAtom) {
          bondList.push({
            id: `b-${prevAtom.id}-${node.id}`,
            source: prevAtom,
            target: node,
            isDouble: doubleNext,
          });
        }

        prevAtom = node;
        doubleNext = false;
      }
    }

    if (atomList.length > 0) {
      let minX = Infinity;
      let maxX = -Infinity;
      let minY = Infinity;
      let maxY = -Infinity;

      atomList.forEach((n) => {
        minX = Math.min(minX, n.x);
        maxX = Math.max(maxX, n.x);
        minY = Math.min(minY, n.y);
        maxY = Math.max(maxY, n.y);
      });

      const width = maxX - minX || 1;
      const height = maxY - minY || 1;
      const padding = 24;
      const scale = Math.min((280 - padding * 2) / width, (160 - padding * 2) / height, 1.4);

      const targetCenterX = 150;
      const targetCenterY = 90;
      const currentCenterX = (minX + maxX) / 2;
      const currentCenterY = (minY + maxY) / 2;

      atomList.forEach((n) => {
        n.x = targetCenterX + (n.x - currentCenterX) * scale;
        n.y = targetCenterY + (n.y - currentCenterY) * scale;
      });
    }

    return { nodes: atomList, bonds: bondList, ringsCount: rCount, heteroCount: hCount };
  }, [smiles, valid]);

  const showWireframe = viewMode === "wireframe" || imageError;

  return (
    <div className={`relative rounded-xl border border-surface-border bg-surface-card/90 p-3.5 backdrop-blur-md ${className}`}>
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-surface-border/50">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-brand-500/10 text-brand-400">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs font-semibold text-zinc-200 truncate">
            {compoundName ? `${compoundName} 2D Structure` : "2D Molecular Structure"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center rounded-md bg-surface-elevated p-0.5 border border-surface-border">
            <button
              onClick={() => setViewMode("pubchem")}
              title="Official PubChem 2D Render"
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                viewMode === "pubchem" && !imageError
                  ? "bg-brand-500 text-white font-bold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <ImageIcon className="h-3 w-3" />
              PubChem
            </button>
            <button
              onClick={() => setViewMode("wireframe")}
              title="Interactive Vector Wireframe"
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                showWireframe
                  ? "bg-brand-500 text-white font-bold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Cpu className="h-3 w-3" />
              Wireframe
            </button>
          </div>

          {cid && cid > 0 && (
            <a
              href={`https://pubchem.ncbi.nlm.nih.gov/compound/${cid}`}
              target="_blank"
              rel="noreferrer"
              className="text-zinc-400 hover:text-brand-400 transition-colors"
              title="View in PubChem"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="relative flex h-[180px] w-full items-center justify-center overflow-hidden rounded-lg bg-[#070A0F] border border-surface-border/40">
        {valid && smiles.trim() ? (
          <>
            {/* PUBCHEM IMAGE RENDER */}
            {!showWireframe && pubchemImageUrl && !imageError && (
              <div className="relative h-full w-full flex items-center justify-center p-2">
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#070A0F]/80">
                    <Loader2 className="h-5 w-5 text-brand-400 animate-spin" />
                  </div>
                )}
                {/* Clean dark-mode inverted chemical drawing */}
                <img
                  src={pubchemImageUrl}
                  alt={compoundName || "2D Structure"}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                  className={`max-h-full max-w-full object-contain filter invert contrast-125 brightness-110 drop-shadow-[0_0_10px_rgba(16,185,129,0.15)] transition-opacity duration-300 ${
                    imageLoaded ? "opacity-100" : "opacity-0"
                  }`}
                />
              </div>
            )}

            {/* VECTOR WIREFRAME (FALLBACK OR TOGGLE) */}
            {showWireframe && nodes.length > 0 && (
              <svg className="h-full w-full select-none" viewBox="0 0 300 180">
                <defs>
                  <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <circle cx="150" cy="90" r="85" fill="url(#glowGrad)" />

                {bonds.map((bond) => {
                  const dx = bond.target.x - bond.source.x;
                  const dy = bond.target.y - bond.source.y;
                  const len = Math.sqrt(dx * dx + dy * dy) || 1;
                  const offsetX = (-dy / len) * 2;
                  const offsetY = (dx / len) * 2;

                  if (bond.isDouble) {
                    return (
                      <g key={bond.id}>
                        <line
                          x1={bond.source.x + offsetX}
                          y1={bond.source.y + offsetY}
                          x2={bond.target.x + offsetX}
                          y2={bond.target.y + offsetY}
                          stroke="#4B5563"
                          strokeWidth="2"
                        />
                        <line
                          x1={bond.source.x - offsetX}
                          y1={bond.source.y - offsetY}
                          x2={bond.target.x - offsetX}
                          y2={bond.target.y - offsetY}
                          stroke="#10B981"
                          strokeWidth="1.8"
                        />
                      </g>
                    );
                  }

                  return (
                    <line
                      key={bond.id}
                      x1={bond.source.x}
                      y1={bond.source.y}
                      x2={bond.target.x}
                      y2={bond.target.y}
                      stroke="#475569"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  );
                })}

                {nodes.map((node) => {
                  const isCarbon = node.symbol === "C";
                  return (
                    <g key={`atom-${node.id}`}>
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={isCarbon ? 3 : 8.5}
                        fill={isCarbon ? "#64748B" : "#0B0F17"}
                        stroke={node.color}
                        strokeWidth={isCarbon ? 1.5 : 2}
                      />
                      {!isCarbon && (
                        <text
                          x={node.x}
                          y={node.y + 3}
                          textAnchor="middle"
                          fill={node.color}
                          fontSize="9"
                          fontWeight="bold"
                          fontFamily="monospace"
                        >
                          {node.symbol}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-4">
            <AlertCircle className="h-6 w-6 text-zinc-600 mb-1.5" />
            <p className="text-xs text-zinc-400">
              {invalidChars.length > 0
                ? `Unrecognized character(s): ${invalidChars.join(", ")}`
                : "Enter a compound name or SMILES string to render 2D structure."}
            </p>
          </div>
        )}

        {/* Floating Chem Informatics pills */}
        {valid && smiles.trim() && (
          <div className="absolute bottom-2 left-2 flex flex-wrap gap-1 text-[9px] font-mono text-zinc-300">
            {molecularFormula && (
              <span className="rounded bg-surface-elevated/90 px-1.5 py-0.5 border border-surface-border font-semibold text-brand-300">
                {molecularFormula}
              </span>
            )}
            {molecularWeight !== undefined && molecularWeight > 0 && (
              <span className="rounded bg-surface-elevated/90 px-1.5 py-0.5 border border-surface-border">
                {molecularWeight.toFixed(1)} g/mol
              </span>
            )}
            <span className="rounded bg-surface-elevated/90 px-1.5 py-0.5 border border-surface-border text-zinc-400">
              {nodes.length} atoms · {ringsCount} rings
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
