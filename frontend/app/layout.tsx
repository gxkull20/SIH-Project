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
      <body className="bg-surface font-body-md text-on-surface antialiased">
        {/* ── Sticky Navigation ── */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <div className="h-16 max-w-[1440px] mx-auto px-margin flex items-center justify-between gap-space-lg">
            {/* Logo */}
            <div className="flex items-center gap-space-md shrink-0">
              <div className="w-9 h-9 rounded-lg bg-surface-container-low flex items-center justify-center relative">
                <span className="material-symbols-outlined text-secondary text-[22px]">shield</span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-secondary-fixed-dim ring-2 ring-surface-container-lowest animate-pulse"></span>
              </div>
              <a href="/" className="font-headline-sm text-headline-sm text-on-surface tracking-tight">
                VoiceShield<span className="text-secondary">-AI</span>
              </a>
              <span className="hidden xl:inline-flex items-center px-space-xs py-0.5 rounded bg-secondary-container/20 text-on-secondary-container font-mono-label text-mono-label uppercase">
                Forensic Core v2.4
              </span>
            </div>

            {/* Nav Links */}
            <nav className="hidden lg:flex items-center gap-space-xs">
              <a href="/simulate" className="px-space-md py-space-xs rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors font-body-md text-body-md">
                Call Simulator
              </a>
              <a href="/detect" className="px-space-md py-space-xs rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors font-body-md text-body-md">
                Detect
              </a>
              <a href="/verify" className="px-space-md py-space-xs rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors font-body-md text-body-md">
                Verify
              </a>
              <a href="/research" className="px-space-md py-space-xs rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors font-body-md text-body-md">
                Research Lab
              </a>
              <a href="/about" className="px-space-md py-space-xs rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors font-body-md text-body-md">
                About
              </a>
            </nav>

            {/* CTA */}
            <div className="flex items-center gap-space-md shrink-0">
              <a
                href="/detect"
                className="hidden sm:inline-flex items-center justify-center px-space-lg py-space-xs rounded-lg bg-secondary text-on-secondary hover:bg-secondary-fixed-dim hover:text-on-secondary-fixed transition-all font-headline-sm text-body-md shadow-[0_2px_8px_rgba(0,106,97,0.2)]"
              >
                <span className="material-symbols-outlined text-[18px] mr-space-xs">mic</span>
                Analyze a Voice
              </a>
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content — pt-16 to clear fixed header */}
        <main className="w-full pt-16 bg-surface min-h-[calc(100vh-16rem)]">
          {children}
        </main>

        {/* ── Footer ── */}
        <footer className="w-full bg-surface-container-lowest shadow-[0_-1px_8px_rgba(0,0,0,0.03)]">
          <div className="max-w-[1440px] mx-auto px-margin py-space-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-space-xl">
              {/* Brand */}
              <div className="lg:col-span-2 flex flex-col gap-space-md">
                <div className="flex items-center gap-space-sm">
                  <div className="w-7 h-7 rounded-lg bg-surface-container-low flex items-center justify-center">
                    <span className="material-symbols-outlined text-secondary text-[18px]">shield</span>
                  </div>
                  <span className="font-headline-sm text-headline-sm text-on-surface">
                    VoiceShield<span className="text-secondary">-AI</span>
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm">
                  Enterprise voice biometrics, deepfake scam mitigation, and millisecond synthetic neural audio classification platform. Engineered for financial networks and real-time telecom defense.
                </p>
                <div className="flex flex-wrap items-center gap-space-xs">
                  <span className="inline-flex items-center gap-1 px-space-sm py-0.5 rounded bg-surface-container-low text-on-surface-variant font-mono-badge text-mono-badge">
                    <span className="material-symbols-outlined text-[14px] text-secondary">verified_user</span>SOC-2 Type II
                  </span>
                  <span className="inline-flex items-center gap-1 px-space-sm py-0.5 rounded bg-surface-container-low text-on-surface-variant font-mono-badge text-mono-badge">
                    <span className="material-symbols-outlined text-[14px] text-secondary">lock</span>AES-256 GCM
                  </span>
                  <span className="inline-flex items-center gap-1 px-space-sm py-0.5 rounded bg-surface-container-low text-on-surface-variant font-mono-badge text-mono-badge">
                    <span className="material-symbols-outlined text-[14px] text-secondary">gavel</span>ISO 27001
                  </span>
                </div>
              </div>

              {/* Detection Engine */}
              <div className="flex flex-col gap-space-sm">
                <span className="font-mono-label text-mono-label uppercase text-on-surface-variant">Detection Engine</span>
                <a href="/detect" className="font-body-sm text-body-sm text-on-surface-variant hover:text-secondary transition-colors">Spectrogram Diagnostic</a>
                <a href="/detect" className="font-body-sm text-body-sm text-on-surface-variant hover:text-secondary transition-colors">Synthetic Vocal Signatures</a>
                <a href="/detect" className="font-body-sm text-body-sm text-on-surface-variant hover:text-secondary transition-colors">Cloning Detection</a>
                <a href="/simulate" className="font-body-sm text-body-sm text-on-surface-variant hover:text-secondary transition-colors">Real-Time Call Gateway</a>
              </div>

              {/* Research */}
              <div className="flex flex-col gap-space-sm">
                <span className="font-mono-label text-mono-label uppercase text-on-surface-variant">Research Lab</span>
                <a href="/research" className="font-body-sm text-body-sm text-on-surface-variant hover:text-secondary transition-colors">Datasets</a>
                <a href="/research/models" className="font-body-sm text-body-sm text-on-surface-variant hover:text-secondary transition-colors">Model Benchmarks</a>
                <a href="/research/experiments" className="font-body-sm text-body-sm text-on-surface-variant hover:text-secondary transition-colors">Experiments</a>
                <a href="/about" className="font-body-sm text-body-sm text-on-surface-variant hover:text-secondary transition-colors">Whitepaper</a>
              </div>

              {/* Compliance */}
              <div className="flex flex-col gap-space-sm">
                <span className="font-mono-label text-mono-label uppercase text-on-surface-variant">Compliance &amp; Trust</span>
                <a href="/about" className="font-body-sm text-body-sm text-on-surface-variant hover:text-secondary transition-colors">Biometric Privacy Policy</a>
                <a href="/about" className="font-body-sm text-body-sm text-on-surface-variant hover:text-secondary transition-colors">Regulatory Whitepapers</a>
                <a href="/about" className="font-body-sm text-body-sm text-on-surface-variant hover:text-secondary transition-colors">Model Explainability</a>
                <a href="/about" className="font-body-sm text-body-sm text-on-surface-variant hover:text-secondary transition-colors">Security Vulnerability Report</a>
              </div>
            </div>

            <div className="mt-space-xl pt-space-lg flex flex-col sm:flex-row items-center justify-between gap-space-md font-mono-label text-mono-label text-on-surface-variant border-t border-outline-variant">
              <p>© 2025 VoiceShield-AI. Explainable voice-security platform. All rights reserved.</p>
              <div className="flex items-center gap-space-md">
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                  Core Neural Grid 99.998% Uptime
                </span>
                <span className="text-outline-variant">|</span>
                <a href="/about" className="hover:text-secondary transition-colors">Terms</a>
                <a href="/about" className="hover:text-secondary transition-colors">Security</a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
