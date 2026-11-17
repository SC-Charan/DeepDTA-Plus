import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  indicatorColor?: string;
}

export function Progress({ value, className, indicatorColor = "bg-brand-500", ...props }: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div
      className={cn("relative h-2 w-full overflow-hidden rounded-full bg-surface-100", className)}
      {...props}
    >
      <div
        className={cn("h-full transition-all duration-500 ease-out rounded-full", indicatorColor)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
