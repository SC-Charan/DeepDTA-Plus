"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { label: "Predict", href: "/predict" },
  { label: "Compound Search", href: "/search" },
  { label: "Virtual Screening", href: "/batch" },
  { label: "Architecture", href: "/model" },
  { label: "Results", href: "/metrics" },
  { label: "History", href: "/history" },
];

export const TopNav: React.FC = () => {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const solid = scrolled || open || pathname !== "/";

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300",
        solid ? "border-surface-border bg-black/80 backdrop-blur-md" : "border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="text-base font-extrabold tracking-tight text-fg">
          DeepDTA <span className="text-brand-accent">+</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {LINKS.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active ? "text-fg" : "text-fg-muted hover:text-fg"
                )}
              >
                {l.label}
                <span
                  className={cn(
                    "mx-auto mt-1 block h-0.5 rounded-full bg-brand-accent transition-all",
                    active ? "w-full" : "w-0"
                  )}
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/auth"
            className="hidden rounded-md border border-surface-border px-3.5 py-1.5 text-sm font-medium text-fg-muted transition-colors hover:border-brand-accent hover:text-fg sm:inline-flex"
          >
            Sign in
          </Link>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-fg-muted hover:text-fg lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="flex flex-col border-t border-surface-border px-6 py-3 lg:hidden" aria-label="Mobile">
          {[...LINKS, { label: "Sign in", href: "/auth" }].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "py-2.5 text-sm font-medium",
                pathname === l.href ? "text-brand-accent" : "text-fg-muted"
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
};
