import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VoiceShield-AI — Detect. Verify. Explain.",
  description:
    "An explainable voice-security platform combining deepfake audio forensics with multi-factor caller verification and conversation intelligence to neutralize social-engineering fraud in real time.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#05070d] font-sans text-gray-200 antialiased">
        {/* ── Sticky Navigation ── */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-[rgba(10,14,24,0.85)] backdrop-blur-xl border-b border-white/[0.06] shadow-[0_1px_12px_rgba(0,0,0,0.3)]">
          <div className="h-16 max-w-7xl mx-auto px-6 flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center relative">
                <span className="material-symbols-outlined text-cyan-400 text-[22px]">shield</span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-[#0a0e18] animate-pulse"></span>
              </div>
              <a href="/" className="text-[18px] font-semibold text-white tracking-tight">
                VoiceShield<span className="text-cyan-400">-AI</span>
              </a>
              <span className="hidden xl:inline-flex items-center px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[11px] font-mono uppercase tracking-wider">
                Forensic Core v2.4
              </span>
            </div>

            {/* Nav Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {[
                { href: "/simulate", label: "Call Simulator" },
                { href: "/detect",   label: "Detect" },
                { href: "/verify",   label: "Verify" },
                { href: "/research", label: "Research Lab" },
                { href: "/about",    label: "About" },
              ].map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  className="px-4 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors text-[14px] font-medium"
                >
                  {label}
                </a>
              ))}
            </nav>

            {/* CTA */}
            <div className="flex items-center gap-3 shrink-0">
              <a
                href="/detect"
                className="hidden sm:inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-500 text-[#05070d] hover:bg-cyan-400 transition-all text-[14px] font-semibold shadow-[0_2px_12px_rgba(34,211,238,0.25)]"
              >
                <span className="material-symbols-outlined text-[17px]">mic</span>
                Analyze a Voice
              </a>
              <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-slate-300 text-[18px]">person</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content — pt-16 clears fixed header */}
        <main className="w-full pt-16 min-h-screen">
          {children}
        </main>

        {/* ── Footer ── */}
        <footer className="w-full bg-[#0a0e18] border-t border-white/[0.06]">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
              {/* Brand */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-cyan-400 text-[17px]">shield</span>
                  </div>
                  <span className="text-[17px] font-semibold text-white">
                    VoiceShield<span className="text-cyan-400">-AI</span>
                  </span>
                </div>
                <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
                  Enterprise voice biometrics, deepfake scam mitigation, and millisecond synthetic neural audio classification platform. Engineered for financial networks and real-time telecom defense.
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { icon: "verified_user", label: "SOC-2 Type II" },
                    { icon: "lock",          label: "AES-256 GCM" },
                    { icon: "gavel",         label: "ISO 27001" },
                  ].map(({ icon, label }) => (
                    <span key={label} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400 text-[11px] font-mono">
                      <span className="material-symbols-outlined text-[13px] text-cyan-400">{icon}</span>
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Detection Engine */}
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-1">Detection Engine</span>
                {[
                  { href: "/detect",   label: "Spectrogram Diagnostic" },
                  { href: "/detect",   label: "Synthetic Vocal Signatures" },
                  { href: "/detect",   label: "Cloning Detection" },
                  { href: "/simulate", label: "Real-Time Call Gateway" },
                ].map(({ href, label }) => (
                  <a key={label} href={href} className="text-sm text-slate-400 hover:text-cyan-400 transition-colors">{label}</a>
                ))}
              </div>

              {/* Research */}
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-1">Research Lab</span>
                {[
                  { href: "/research",              label: "Datasets" },
                  { href: "/research/models",       label: "Model Benchmarks" },
                  { href: "/research/experiments",  label: "Experiments" },
                  { href: "/about",                 label: "Whitepaper" },
                ].map(({ href, label }) => (
                  <a key={label} href={href} className="text-sm text-slate-400 hover:text-cyan-400 transition-colors">{label}</a>
                ))}
              </div>

              {/* Compliance */}
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-1">Compliance &amp; Trust</span>
                {[
                  { href: "/about", label: "Biometric Privacy Policy" },
                  { href: "/about", label: "Regulatory Whitepapers" },
                  { href: "/about", label: "Model Explainability" },
                  { href: "/about", label: "Security Vulnerability Report" },
                ].map(({ href, label }) => (
                  <a key={label} href={href} className="text-sm text-slate-400 hover:text-cyan-400 transition-colors">{label}</a>
                ))}
              </div>
            </div>

            <div className="mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/[0.06] text-[11px] font-mono text-slate-500">
              <p>© 2025 VoiceShield-AI. Explainable voice-security platform. All rights reserved.</p>
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                  Core Neural Grid 99.998% Uptime
                </span>
                <span className="text-white/20">|</span>
                <a href="/about" className="hover:text-cyan-400 transition-colors">Terms</a>
                <a href="/about" className="hover:text-cyan-400 transition-colors">Security</a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
