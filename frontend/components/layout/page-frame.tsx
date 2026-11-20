"use client";

import React from "react";
import { usePathname } from "next/navigation";

/** Home is full-bleed; every other page sits in a centred column under the nav. */
export const PageFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  if (pathname === "/") return <>{children}</>;
  return <div className="mx-auto max-w-6xl px-6 pb-20 pt-24">{children}</div>;
};
