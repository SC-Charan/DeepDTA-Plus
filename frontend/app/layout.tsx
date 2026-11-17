import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export const metadata: Metadata = {
  title: "DeepDTA-Plus | Drug-Target Binding Affinity Prediction Platform",
  description:
    "Production-grade, honest AI drug discovery platform predicting binding affinity (pKd/Kd) with calibrated ensemble uncertainty and dual sequence-topological representations.",
  keywords: [
    "DeepDTA",
    "Drug-Target Affinity",
    "Bioinformatics",
    "Binding Affinity",
    "SMILES",
    "Kinase Inhibitors",
    "Protein Sequence",
    "AI Drug Discovery",
  ],
  authors: [{ name: "DeepDTA-Plus Engineering Team" }],
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-zinc-100 flex overflow-hidden">
        {/* Left App Navigation Shell */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-y-auto h-screen">
          <Header />
          <main className="flex-1 p-6 max-w-7xl w-full mx-auto pb-16">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
