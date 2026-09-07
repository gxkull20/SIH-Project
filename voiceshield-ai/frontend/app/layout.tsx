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
        <footer className="mx-auto max-w-7xl px-6 py-10 text-center text-xs text-slate-600">
          VoiceShield-AI is a student research prototype. Model outputs may be simulated where no
          trained checkpoint is connected — see the Research Lab for model status.
        </footer>
      </body>
    </html>
  );
}
