"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Hero } from "@/components/home/hero";
import { BINDING_STYLE } from "@/lib/binding";
import { cn } from "@/lib/utils";

/* Clean non-shifting wrapper for sections */
function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

function Panel({ note, children }: { note?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-surface-border bg-surface-card p-6">
      {note && <div className="mb-4 text-xs text-fg-subtle">{note}</div>}
      {children}
    </div>
  );
}

function Row(props: {
  title: string; body: string; href: string; cta: string; flip?: boolean; children: React.ReactNode;
}) {
  return (
    <Reveal>
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className={props.flip ? "lg:order-2" : ""}>
          <h2 className="font-heading text-3xl font-bold tracking-tight text-fg sm:text-4xl">{props.title}</h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-fg-muted">{props.body}</p>
          <Link
            href={props.href}
            className="group mt-6 inline-flex items-center gap-2 rounded-md border border-surface-border px-4 py-2.5 text-sm font-semibold text-fg transition-colors hover:border-brand-accent"
          >
            {props.cta}
            <ArrowRight className="h-4 w-4 text-brand-accent transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        <div className={props.flip ? "lg:order-1" : ""}>{props.children}</div>
      </div>
    </Reveal>
  );
}

/* ── small illustrations ── */
function ScaleVisual() {
  const segs = [
    { w: 40, c: BINDING_STYLE["No Significant Binding"].color },
    { w: 20, c: BINDING_STYLE["Moderate Binding"].color },
    { w: 20, c: BINDING_STYLE["High Binding"].color },
    { w: 20, c: BINDING_STYLE["Very High Binding"].color },
  ];
  const s = BINDING_STYLE["High Binding"];
  return (
    <Panel note="Example result">
      <div className="mb-8 flex items-baseline justify-between">
        <span className="rounded-full px-3 py-1 text-sm font-semibold" style={{ background: s.soft, color: s.color }}>
          {s.label}
        </span>
        <span className="font-mono text-2xl font-semibold text-fg">pKd 7.8</span>
      </div>
      <div className="relative">
        <div className="flex h-3 overflow-hidden rounded-full">
          {segs.map((g, i) => <div key={i} style={{ width: `${g.w}%`, background: g.c }} />)}
        </div>
        <div className="absolute -top-2 h-7 w-0.5 bg-white" style={{ left: `${((7.8 - 4) / 5) * 100}%` }} />
        {[6, 7, 8].map((n) => (
          <span key={n} className="absolute top-5 -translate-x-1/2 font-mono text-xs text-fg-subtle" style={{ left: `${((n - 4) / 5) * 100}%` }}>
            {n}
          </span>
        ))}
      </div>
      <div className="mt-10 flex flex-wrap gap-x-5 gap-y-2 text-xs text-fg-muted">
        {(Object.keys(BINDING_STYLE) as (keyof typeof BINDING_STYLE)[]).reverse().map((k) => (
          <span key={k} className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: BINDING_STYLE[k].color }} />
            {BINDING_STYLE[k].short}
          </span>
        ))}
      </div>
    </Panel>
  );
}

function MoleculeVisual() {
  const line = "#ACC0D3";
  const lab = (x: number, y: number, t: string, c: string) => (
    <g key={t + x}>
      <circle cx={x} cy={y} r="10" fill="#080d0f" />
      <text x={x} y={y + 4} textAnchor="middle" fontSize="12" fontWeight="700" fill={c}>{t}</text>
    </g>
  );
  return (
    <Panel note="Example: name in, structure and SMILES out">
      <svg viewBox="0 0 240 150" className="mx-auto h-44 w-full max-w-sm" role="img" aria-label="2D structure of aspirin">
        <g stroke={line} strokeWidth="2" strokeLinecap="round" fill="none">
          <polygon points="80,57 104,71 104,99 80,113 56,99 56,71" />
          <path d="M84,64 L99,73 M99,97 L84,106 M60,96 L60,74" strokeWidth="1.5" />
          <path d="M104,71 L130,57 M130,57 L130,34 M134,57 L134,34 M130,57 L152,71" />
          <path d="M104,99 L128,111 M138,113 L156,99 M156,99 L156,122 M160,99 L160,122 M156,99 L182,85" />
        </g>
        {lab(130, 30, "O", "#D396A6")}{lab(156, 74, "OH", "#D396A6")}
        {lab(133, 113, "O", "#D396A6")}{lab(158, 126, "O", "#D396A6")}
      </svg>
      <div className="mt-4 rounded-md border border-surface-border bg-black px-3 py-2 font-mono text-xs text-fg-muted">
        CC(=O)OC1=CC=CC=C1C(=O)O
      </div>
    </Panel>
  );
}

function ScreeningVisual() {
  const rows: [string, number, keyof typeof BINDING_STYLE][] = [
    ["Compound A", 8.4, "Very High Binding"],
    ["Compound B", 7.6, "High Binding"],
    ["Compound C", 6.5, "Moderate Binding"],
    ["Compound D", 5.2, "No Significant Binding"],
  ];
  return (
    <Panel note="Example ranking">
      <div className="space-y-4">
        {rows.map(([n, v, k]) => (
          <div key={n} className="flex items-center gap-4">
            <span className="w-24 shrink-0 text-sm text-fg">{n}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-overlay">
              <div className="h-full rounded-full" style={{ width: `${(v / 9) * 100}%`, background: BINDING_STYLE[k].color }} />
            </div>
            <span className="w-16 shrink-0 text-right font-mono text-sm text-fg-muted">{v.toFixed(1)}</span>
            <span className="hidden w-20 shrink-0 rounded-full px-2 py-0.5 text-center text-xs font-medium sm:block" style={{ background: BINDING_STYLE[k].soft, color: BINDING_STYLE[k].color }}>
              {BINDING_STYLE[k].short}
            </span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function ArchitectureVisual() {
  return (
    <Panel>
      <svg viewBox="0 0 360 150" className="h-40 w-full" role="img" aria-label="Drug and protein inputs combine into a binding affinity">
        <g fill="none" stroke="#30525C" strokeWidth="2">
          <path d="M104,38 C170,38 170,75 236,75" /><path d="M104,112 C170,112 170,75 236,75" />
        </g>
        <g fontSize="13" fontWeight="600" textAnchor="middle">
          <rect x="14" y="20" width="90" height="36" rx="8" fill="#0e1619" stroke="#5484A4" />
          <text x="59" y="43" fill="#ACC0D3">Drug</text>
          <rect x="14" y="94" width="90" height="36" rx="8" fill="#0e1619" stroke="#F6C992" />
          <text x="59" y="117" fill="#ACC0D3">Protein</text>
          <rect x="236" y="54" width="110" height="42" rx="8" fill="#0e1619" stroke="#09A1A1" />
          <text x="291" y="79" fill="#EEF3F7">Binding affinity</text>
        </g>
      </svg>
    </Panel>
  );
}

function DataVisual() {
  const sets = [
    { name: "Davis", pairs: 30056, meta: "68 drugs · 442 proteins", c: "#09A1A1" },
    { name: "KIBA", pairs: 118254, meta: "2,111 drugs · 229 proteins", c: "#5484A4" },
  ];
  return (
    <Panel note="Drug–protein pairs per dataset">
      <div className="space-y-6">
        {sets.map((d) => (
          <div key={d.name}>
            <div className="mb-2 flex items-baseline justify-between">
              <span className="text-sm font-semibold text-fg">{d.name}</span>
              <span className="font-mono text-sm text-fg-muted">{d.pairs.toLocaleString()}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-surface-overlay">
              <div className="h-full rounded-full" style={{ width: `${(d.pairs / 118254) * 100}%`, background: d.c }} />
            </div>
            <div className="mt-1.5 text-xs text-fg-subtle">{d.meta}</div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function HistoryVisual() {
  const items: [string, string, keyof typeof BINDING_STYLE][] = [
    ["Compound A", "pKd 7.8", "High Binding"],
    ["Compound B", "pKd 6.4", "Moderate Binding"],
    ["Compound C", "pKd 5.1", "No Significant Binding"],
  ];
  return (
    <Panel note="Example runs">
      <ul className="relative space-y-5 border-l border-surface-border pl-6">
        {items.map(([n, v, k]) => (
          <li key={n} className="relative flex items-center justify-between">
            <span className="absolute -left-[30px] h-2.5 w-2.5 rounded-full" style={{ background: BINDING_STYLE[k].color }} />
            <span className="text-sm text-fg">{n}</span>
            <span className="font-mono text-sm text-fg-muted">{v}</span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export default function HomePage() {
  return (
    <div>
      <Hero />

      <div className="mx-auto max-w-6xl space-y-32 px-6 pb-32 pt-24">
        <Reveal>
          <h2 className="max-w-2xl font-heading text-3xl font-bold leading-tight tracking-tight text-fg sm:text-5xl">
            From a compound name to a binding verdict.
          </h2>
        </Reveal>

        <Row
          title="Predict a binding"
          body="Pick a compound and a protein target. You get the binding strength, the Kd in nM and a clear status you can read at a glance."
          href="/predict" cta="Open Predict"
        >
          <ScaleVisual />
        </Row>

        <Row
          title="Find any compound"
          body="Search by name and see its 2D structure, formula, weight and SMILES, then send it straight to a prediction."
          href="/search" cta="Search compounds" flip
        >
          <MoleculeVisual />
        </Row>

        <Row
          title="Screen a whole library"
          body="Upload a CSV of compounds, screen them against one target and see them ranked by binding strength, each with its status."
          href="/batch" cta="Start screening"
        >
          <ScreeningVisual />
        </Row>

        <Row
          title="See how it works"
          body="A drug and a protein go in, a binding affinity comes out. The architecture page explains each part in detail."
          href="/model" cta="View architecture" flip
        >
          <ArchitectureVisual />
        </Row>

        <Row
          title="Data and results"
          body="The datasets behind the predictions, and how they compare with published baselines, including the harder cold-split tests."
          href="/metrics" cta="See results"
        >
          <DataVisual />
        </Row>

        <Row
          title="Pick up where you left off"
          body="Every prediction you run is saved in your browser, so you can revisit scores and compare compounds later."
          href="/history" cta="Open history" flip
        >
          <HistoryVisual />
        </Row>
      </div>

      <footer className="border-t border-surface-border px-6 py-10 text-center text-sm text-fg-subtle">
        <div className="font-semibold text-fg-muted">DeepDTA +</div>
        <div className="mt-1">Team G1542 · Havisha, SaiCharan, Abhinov, Rishitha, Hariharan</div>
        <a
          href="https://doi.org/10.1093/bioinformatics/bty593"
          className="mt-2 inline-block hover:text-fg-muted"
          target="_blank" rel="noopener noreferrer"
        >
          Based on Öztürk et al., 2018
        </a>
      </footer>
    </div>
  );
}
