import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "VoiceShield-AI — Detect. Verify. Explain.",
  description:
    "An explainable voice-security platform combining voice forensics, multi-signal fusion, conversation intelligence, and caller verification.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}


