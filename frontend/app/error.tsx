"use client";

/**
 * Next.js App Router global error boundary.
 * Catches any unhandled client-side error and shows a friendly fallback
 * instead of the cryptic "Application error" white screen.
 */
import React from "react";
import { RefreshCw, AlertCircle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#070A0F] p-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 ring-1 ring-red-500/30">
        <AlertCircle className="h-6 w-6 text-red-400" />
      </div>
      <div>
        <h2 className="text-sm font-bold text-white">Something went wrong</h2>
        <p className="mt-1 max-w-xs text-xs text-zinc-400">{error.message || "An unexpected error occurred."}</p>
      </div>
      <button
        onClick={reset}
        className="flex items-center gap-2 rounded-lg bg-brand-500/10 px-4 py-2 text-xs font-medium text-brand-400 ring-1 ring-brand-500/30 hover:bg-brand-500/20 transition-colors"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        Try again
      </button>
    </div>
  );
}
