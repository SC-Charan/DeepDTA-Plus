import type { Metadata, Viewport } from "next";
import { Sora, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { TopNav } from "@/components/layout/top-nav";
import { PageFrame } from "@/components/layout/page-frame";
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
    <html
      lang="en"
      className={`dark ${sora.variable} ${inter.variable} ${jetbrains.variable}`}
    >
      <body className="min-h-screen bg-page text-body antialiased font-body">
        <ProteinBackground />
        <TopNav />
        <main>
          <PageFrame>{children}</PageFrame>
        </main>
      </body>
    </html>
  );
}
