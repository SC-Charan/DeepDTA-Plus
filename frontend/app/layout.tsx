import type { Metadata, Viewport } from "next";
import { Press_Start_2P, VT323 } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

const pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
  display: "swap",
});

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DeepDTA | Drug-Target Binding Affinity Prediction",
  description:
    "Predict drug-protein binding affinity (pKd / Kd) using a dual-branch CNN trained on the Davis kinase inhibitor dataset. Built with PyTorch and RDKit.",
  keywords: ["DeepDTA", "drug-target affinity", "binding affinity", "SMILES", "bioinformatics", "PyTorch", "RDKit"],
  authors: [{ name: "Team G1542" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${pressStart.variable} ${vt323.variable}`}>
      <body className="flex h-screen overflow-hidden bg-page font-sans text-body antialiased">
        <Sidebar />
        <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-6xl px-6 py-6 pb-16">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
