import type { Metadata, Viewport } from "next";
import { Sora, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { ProteinBackground } from "@/components/layout/protein-background";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "deepdta+ | Drug-Target Binding Affinity Prediction",
  description:
    "Predict drug-protein binding affinity (pKd / Kd) using a dual-branch CNN trained on the Davis kinase inhibitor dataset. Built with PyTorch and Next.js.",
  keywords: ["DeepDTA", "drug-target affinity", "binding affinity", "SMILES", "bioinformatics", "PyTorch", "Next.js"],
  authors: [{ name: "Team G1542" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`dark ${sora.variable} ${inter.variable} ${jetbrains.variable}`}
    >
      <body className="flex h-screen overflow-hidden bg-page text-body antialiased font-body">
        <ProteinBackground />
        <Sidebar />
        <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-6xl px-6 py-8 pb-16">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
