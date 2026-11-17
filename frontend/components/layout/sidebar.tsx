"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Layers,
  History,
  BarChart3,
  FlaskConical,
  Search,
  Cpu,
  Database,
  ChevronLeft,
  ChevronRight,
  Server,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { checkEngineStatus } from "@/lib/api";
import { EngineStatus } from "@/lib/types";

const NAV_ITEMS = [
  {
    name: "Dashboard",
    href: "/",
    icon: Activity,
    badge: null,
  },
  {
    name: "Predict",
    href: "/predict",
    icon: FlaskConical,
    badge: "AI Core",
  },
  {
    name: "Molecule View",
    href: "/search",
    icon: Search,
    badge: "PubChem",
  },
  {
    name: "Virtual Screening",
    href: "/batch",
    icon: Layers,
    badge: "Batch",
  },
  {
    name: "Model View",
    href: "/model",
    icon: Cpu,
    badge: "PyTorch",
  },
  {
    name: "Data & Metrics",
    href: "/metrics",
    icon: Database,
    badge: "Davis",
  },
  {
    name: "History",
    href: "/history",
    icon: History,
    badge: null,
  },
  {
    name: "Account",
    href: "/auth",
    icon: UserCheck,
    badge: null,
  },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [engineStatus, setEngineStatus] = useState<EngineStatus>({
    online: false,
    model_version: "1.0.0",
    dataset: "Davis",
    device: "mock-v8",
    latency_ms: 0,
    mode: "mock-client",
  });

  useEffect(() => {
    checkEngineStatus().then(setEngineStatus);
    const interval = setInterval(() => {
      checkEngineStatus().then(setEngineStatus);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside
      className={cn(
        "relative flex flex-col justify-between border-r border-surface-border bg-surface-card/95 backdrop-blur-xl transition-all duration-300 z-30 select-none",
        collapsed ? "w-18" : "w-64"
      )}
    >
      {/* Top Header / Branding */}
      <div>
        <div className="flex h-16 items-center justify-between px-4 border-b border-surface-border/60">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-teal-500 p-0.5 shadow-glow group-hover:shadow-glow-teal transition-all">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-surface">
                <FlaskConical className="h-4.5 w-4.5 text-brand-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                  DeepDTA<span className="text-brand-400 font-extrabold">+</span>
                </span>
                <span className="text-[10px] font-mono text-zinc-400">Drug-Target Affinity</span>
              </div>
            )}
          </Link>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="rounded-lg p-1 text-zinc-400 hover:text-white hover:bg-surface-elevated transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-all group relative",
                  isActive
                    ? "bg-brand-500/15 text-brand-300 border border-brand-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-surface-elevated/80"
                )}
                title={collapsed ? item.name : undefined}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    isActive ? "text-brand-400" : "text-zinc-400 group-hover:text-zinc-200"
                  )}
                />
                {!collapsed && (
                  <div className="flex items-center justify-between w-full">
                    <span>{item.name}</span>
                    {item.badge && (
                      <span className="rounded bg-brand-500/10 px-1.5 py-0.5 text-[9px] font-mono text-brand-400 border border-brand-500/20">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-brand-400 rounded-r" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Status / Hardware telemetry */}
      <div className="p-3 border-t border-surface-border/60">
        {!collapsed ? (
          <div className="rounded-xl border border-surface-border bg-surface-elevated/60 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase text-zinc-400 flex items-center gap-1.5">
                <Server className="h-3 w-3 text-brand-400" />
                Inference Engine
              </span>
              <span className="relative flex h-2 w-2">
                <span
                  className={cn(
                    "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                    engineStatus.online ? "bg-emerald-400" : "bg-cyan-400"
                  )}
                />
                <span
                  className={cn(
                    "relative inline-flex rounded-full h-2 w-2",
                    engineStatus.online ? "bg-emerald-500" : "bg-cyan-500"
                  )}
                />
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-400">Mode:</span>
                <span
                  className={cn(
                    "font-semibold",
                    engineStatus.online ? "text-emerald-400" : "text-cyan-400"
                  )}
                >
                  {engineStatus.online ? "PyTorch Remote" : "Edge Fallback"}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-400">Target Model:</span>
                <span className="font-mono text-zinc-300">DeepDTA+ Ens</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-400">Latency:</span>
                <span className="font-mono text-zinc-400">{engineStatus.latency_ms} ms</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center" title="Engine Status">
            <span className="relative flex h-3 w-3">
              <span
                className={cn(
                  "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                  engineStatus.online ? "bg-emerald-400" : "bg-cyan-400"
                )}
              />
              <span
                className={cn(
                  "relative inline-flex rounded-full h-3 w-3",
                  engineStatus.online ? "bg-emerald-500" : "bg-cyan-500"
                )}
              />
            </span>
          </div>
        )}
      </div>
    </aside>
  );
};
