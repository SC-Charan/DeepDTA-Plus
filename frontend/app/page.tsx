"use client";

import { useEffect } from "react";

export default function HomePage() {
  useEffect(() => {
    // Seamlessly transition to the 3D Interactive Studio
    window.location.replace("/demo.html");
  }, []);

  return (
    <div className="flex min-h-[70vh] items-center justify-center text-fg-muted">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-brand-accent border-t-transparent" />
        <p className="font-mono text-sm text-fg">Loading DeepDTA+ Interactive Studio...</p>
      </div>
    </div>
  );
}
