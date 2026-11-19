import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "glow";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center font-semibold transition-all duration-200 select-none disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-bright/50 focus-visible:ring-offset-2 focus-visible:ring-offset-page rounded-lg whitespace-nowrap";

    const variants: Record<string, string> = {
      primary:
        "bg-gradient-accent text-white shadow-[0_4px_20px_-5px_rgba(139,92,246,0.5)] hover:shadow-[0_8px_30px_-5px_rgba(139,92,246,0.7)] hover:-translate-y-px active:translate-y-0",
      secondary:
        "bg-surface-elevated/60 backdrop-blur-xl border border-border text-heading hover:bg-surface-hover/80 hover:border-border-bright",
      outline:
        "border border-border text-body hover:border-accent-bright hover:text-heading hover:bg-surface-elevated/40",
      ghost:
        "text-body hover:text-heading hover:bg-surface-elevated/60",
      danger:
        "bg-accent-pink/15 hover:bg-accent-pink/25 text-accent-pink border border-accent-pink/40",
      glow:
        "bg-gradient-accent text-white shadow-[0_4px_20px_-5px_rgba(139,92,246,0.5)] hover:shadow-[0_8px_40px_-5px_rgba(236,72,153,0.8)] hover:-translate-y-px active:translate-y-0",
    };

    const sizes: Record<string, string> = {
      sm:   "h-8 px-3.5 text-sm gap-1.5",
      md:   "h-10 px-5 text-sm gap-2",
      lg:   "h-12 px-7 text-base gap-2",
      icon: "h-10 w-10 p-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin mr-1.5 h-4 w-4 text-current opacity-70"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
