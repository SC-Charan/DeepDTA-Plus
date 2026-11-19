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
      "inline-flex items-center justify-center font-medium transition-all duration-150 select-none disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-btn-accent/50 focus-visible:ring-offset-1 focus-visible:ring-offset-page rounded-md whitespace-nowrap";

    const variants: Record<string, string> = {
      primary:
        "bg-btn-accent hover:opacity-90 text-panel font-semibold",
      secondary:
        "bg-secondary hover:bg-pixel text-heading border border-pixel",
      outline:
        "border border-pixel hover:bg-secondary/60 text-body hover:text-heading",
      ghost:
        "text-body hover:text-heading hover:bg-secondary/40",
      danger:
        "bg-accent/20 hover:bg-accent/30 text-accent border border-accent/50",
      glow:
        "bg-btn-accent hover:opacity-90 text-panel font-semibold",
    };

    const sizes: Record<string, string> = {
      sm:   "h-7 px-3 text-xs gap-1.5",
      md:   "h-9 px-4 text-sm gap-2",
      lg:   "h-10 px-5 text-sm gap-2",
      icon: "h-8 w-8 p-0",
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
            className="animate-spin mr-1.5 h-3.5 w-3.5 text-current opacity-70"
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
