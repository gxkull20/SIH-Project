"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  if (isHome) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 py-10">{children}</main>
      <footer className="mx-auto max-w-7xl px-6 py-8 border-t border-white/5 text-center text-xs text-slate-500">
        VoiceShield-AI — Explainable voice-security, multi-model forensics, and caller verification platform.
      </footer>
    </>
  );
}
