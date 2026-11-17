"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Search,
  ExternalLink,
  Github,
  Zap,
  CheckCircle2,
  X,
  User,
  LogOut,
  Sliders,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Header: React.FC = () => {
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Generate breadcrumb title
  const getPageTitle = () => {
    switch (pathname) {
      case "/predict":
        return "Predictor Studio";
      case "/batch":
        return "Batch Screening";
      case "/history":
        return "Workspace & History";
      case "/metrics":
        return "Model Benchmarks & Metrics";
      case "/auth":
        return "Authentication & Access";
      default:
        return "Dashboard Overview";
    }
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-surface-border/60 bg-surface/80 px-6 backdrop-blur-xl">
      {/* Left: Breadcrumbs & Page title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
          <Link href="/" className="hover:text-zinc-200 transition-colors">
            DeepDTA-Plus
          </Link>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-100 font-semibold">{getPageTitle()}</span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Vercel Status Badge */}
        <div className="hidden md:flex items-center gap-1.5 rounded-full border border-surface-border bg-surface-elevated/70 px-2.5 py-1 text-[11px] text-zinc-300">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Vercel Edge Ready</span>
        </div>

        {/* GitHub link */}
        <a
          href="https://github.com/SC-Charan/DeepDTA-Plus"
          target="_blank"
          rel="noreferrer"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-surface-border bg-surface-elevated text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors"
          title="GitHub Repository"
        >
          <Github className="h-4 w-4" />
        </a>

        {/* Notifications toggle */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-surface-border bg-surface-elevated text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand-400" />
          </button>

          {/* Notifications Drawer */}
          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 rounded-xl border border-surface-border bg-surface-card p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-surface-border/60">
                <span className="text-xs font-semibold text-zinc-200">System Activity</span>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="mt-3 space-y-2.5">
                <div className="flex gap-2.5 rounded-lg bg-surface-elevated/80 p-2.5 border border-surface-border/40">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-zinc-200">Davis Dataset Loaded</p>
                    <p className="text-[10px] text-zinc-400">
                      30,056 pairs indexed with verified benchmark metrics (CI 0.8852).
                    </p>
                  </div>
                </div>

                <div className="flex gap-2.5 rounded-lg bg-surface-elevated/80 p-2.5 border border-surface-border/40">
                  <Zap className="h-4 w-4 text-brand-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-zinc-200">Edge ML Mock Engine Active</p>
                    <p className="text-[10px] text-zinc-400">
                      Sub-60ms p95 latency fallback active for offline preview.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 rounded-lg border border-surface-border bg-surface-elevated pl-2 pr-3 py-1.5 hover:border-zinc-500 transition-colors"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-teal-400 text-[11px] font-bold text-zinc-950">
              BC
            </div>
            <span className="text-xs font-medium text-zinc-200 hidden sm:inline">Bio Researcher</span>
          </button>

          {showProfile && (
            <div className="absolute right-0 top-12 w-56 rounded-xl border border-surface-border bg-surface-card p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-surface-border/50">
                <p className="text-xs font-semibold text-zinc-100">Biotech Workspace</p>
                <p className="text-[10px] text-zinc-400">researcher@deepdta.org</p>
              </div>

              <div className="py-1">
                <Link
                  href="/history"
                  onClick={() => setShowProfile(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-surface-elevated rounded-lg transition-colors"
                >
                  <Sliders className="h-3.5 w-3.5" />
                  Workspace Settings
                </Link>
                <Link
                  href="/auth"
                  onClick={() => setShowProfile(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
