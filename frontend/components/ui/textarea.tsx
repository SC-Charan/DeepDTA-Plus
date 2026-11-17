import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[90px] w-full rounded-lg border border-surface-border bg-surface-elevated/70 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 font-mono focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-500 focus-visible:border-brand-500/50 disabled:cursor-not-allowed disabled:opacity-50 transition-colors resize-y",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";
