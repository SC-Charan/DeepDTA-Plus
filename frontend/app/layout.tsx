import type { Metadata, Viewport } from "next";
import "./globals.css";
import { TopNav } from "@/components/layout/top-nav";
import { PageFrame } from "@/components/layout/page-frame";

export const metadata: Metadata = {
  title: "DeepDTA + | Drug-Target Binding Affinity",
  description:
    "Predict how strongly a drug binds to its protein target, from a compound name to a clear binding verdict.",
  keywords: ["DeepDTA", "drug-target affinity", "binding affinity", "SMILES", "bioinformatics"],
  authors: [{ name: "Team G1542" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-black text-fg antialiased">
        <TopNav />
        <main>
          <PageFrame>{children}</PageFrame>
        </main>
      </body>
    </html>
  );
}
