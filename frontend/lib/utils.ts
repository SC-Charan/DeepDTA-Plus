import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { BindingCategory } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatKd(kd_nM: number): string {
  if (kd_nM < 1) {
    return `${(kd_nM * 1000).toFixed(1)} pM`;
  }
  if (kd_nM >= 1000000) {
    return `${(kd_nM / 1000000).toFixed(2)} mM`;
  }
  if (kd_nM >= 1000) {
    return `${(kd_nM / 1000).toFixed(2)} µM`;
  }
  return `${kd_nM.toFixed(1)} nM`;
}

export function categorizeBinding(pkd: number): BindingCategory {
  if (pkd >= 8.0) return "Very High Binding";
  if (pkd >= 7.0) return "High Binding";
  if (pkd >= 6.0) return "Moderate Binding";
  return "No Significant Binding";
}

export function getBindingBadgeStyles(category: BindingCategory): {
  badgeClass: string;
  dotColor: string;
  glowClass: string;
} {
  switch (category) {
    case "Very High Binding":
      return {
        badgeClass: "bg-[#09A1A1]/15 text-[#3fc4c4] border-[#09A1A1]/50",
        dotColor: "bg-[#09A1A1]",
        glowClass: "shadow-[0_0_14px_rgba(9,161,161,0.4)]",
      };
    case "High Binding":
      return {
        badgeClass: "bg-[#5484A4]/20 text-[#8fb3cf] border-[#5484A4]/55",
        dotColor: "bg-[#5484A4]",
        glowClass: "shadow-[0_0_12px_rgba(84,132,164,0.3)]",
      };
    case "Moderate Binding":
      return {
        badgeClass: "bg-[#F6C992]/15 text-[#F6C992] border-[#F6C992]/45",
        dotColor: "bg-[#F6C992]",
        glowClass: "shadow-[0_0_12px_rgba(246,201,146,0.25)]",
      };
    case "No Significant Binding":
    default:
      return {
        badgeClass: "bg-[#D396A6]/15 text-[#D396A6] border-[#D396A6]/45",
        dotColor: "bg-[#D396A6]",
        glowClass: "shadow-none",
      };
  }
}

export const VALID_SMILES_CHARS = new Set(
  "#%) (+-/.103254769=@ABCEDGFIHKMLONPSRUTWVY[Z]\\acedgfimlonsrtuy"
);

export const VALID_PROTEIN_CHARS = new Set(
  "ACBEDGFIHKMLONPQSRUTWVYXZ"
);

export function validateSmiles(smiles: string): { valid: boolean; invalidChars: string[] } {
  const clean = smiles.trim();
  if (!clean) return { valid: false, invalidChars: ["Empty string"] };
  const invalid: string[] = [];
  for (const ch of clean) {
    if (!VALID_SMILES_CHARS.has(ch)) {
      invalid.push(ch);
    }
  }
  return { valid: invalid.length === 0, invalidChars: Array.from(new Set(invalid)) };
}

export function validateProteinSequence(sequence: string): {
  valid: boolean;
  length: number;
  invalidChars: string[];
} {
  const clean = sequence.replace(/[\s\r\n\t]/g, "").toUpperCase();
  if (!clean) return { valid: false, length: 0, invalidChars: ["Empty sequence"] };
  const invalid: string[] = [];
  for (const ch of clean) {
    if (!VALID_PROTEIN_CHARS.has(ch)) {
      invalid.push(ch);
    }
  }
  return {
    valid: invalid.length === 0,
    length: clean.length,
    invalidChars: Array.from(new Set(invalid)),
  };
}

export function exportToCsv(filename: string, rows: Record<string, any>[]) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const val = row[h] ?? "";
          const str = String(val).replace(/"/g, '""');
          return `"${str}"`;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToJson(filename: string, data: any) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
