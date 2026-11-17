import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "brand" | "outline" | "danger" | "warning" | "cyan";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-surface-elevated text-zinc-300 border-surface-border",
    brand: "bg-brand-500/10 text-brand-400 border-brand-500/30",
    outline: "text-zinc-400 border-surface-border",
    danger: "bg-red-500/10 text-red-400 border-red-500/30",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors select-none",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
