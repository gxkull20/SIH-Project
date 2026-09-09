import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "VoiceShield-AI — Detect. Verify. Explain.",
  description:
    "An explainable voice-security platform combining voice forensics, multi-signal fusion, conversation intelligence, and caller verification.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="mx-auto max-w-7xl px-6 py-10">{children}</main>
        <footer className="mx-auto max-w-7xl px-6 py-8 border-t border-white/5 text-center text-xs text-slate-500">
          VoiceShield-AI — Explainable voice-security, multi-model forensics, and caller verification platform.
        </footer>
      </body>
    </html>
  );
}
