"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const INITIAL_BAR_HEIGHTS = [
  42, 68, 89, 55, 30, 75, 94, 62, 38, 82, 70, 48, 91, 85, 53, 65, 40, 78, 92, 60, 35, 72, 58, 44,
];

export default function HomePage() {
  const [bars, setBars] = useState<number[]>(INITIAL_BAR_HEIGHTS);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    if (!isAnimating) return;
    const interval = setInterval(() => {
      setBars(Array.from({ length: 24 }, () => Math.floor(Math.random() * 80) + 18));
    }, 220);
    return () => clearInterval(interval);
  }, [isAnimating]);

  const togglePulse = () => {
    setIsAnimating((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-surface font-body-md text-on-surface antialiased">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 max-w-[1440px] mx-auto px-margin flex items-center justify-between gap-space-lg">
          <div className="flex items-center gap-space-md shrink-0">
            <Link href="/" className="w-9 h-9 rounded-lg bg-surface-container-low flex items-center justify-center relative">
              <span className="material-symbols-outlined text-secondary text-[22px]">shield</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-secondary-fixed-dim ring-2 ring-surface-container-lowest animate-pulse"></span>
            </Link>
            <Link href="/" className="font-headline-sm text-headline-sm text-on-surface tracking-tight">
              VoiceShield<span className="text-secondary">-AI</span>
            </Link>
            <span className="hidden xl:inline-flex items-center px-space-xs py-0.5 rounded bg-secondary-container/20 text-on-secondary-container font-mono-label text-mono-label uppercase">
              Forensic Core v2.4
            </span>
          </div>

          <nav className="hidden lg:flex items-center gap-space-xs">
            <Link
              href="/simulate"
              className="px-space-md py-space-xs rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors font-body-md text-body-md"
            >
              Call Simulator
            </Link>
            <Link
              href="/detect"
              className="px-space-md py-space-xs rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors font-body-md text-body-md"
            >
              Detect
            </Link>
            <Link
              href="/verify"
              className="px-space-md py-space-xs rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors font-body-md text-body-md"
            >
              Verify
            </Link>
            <Link
              href="/research"
              className="px-space-md py-space-xs rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors font-body-md text-body-md"
            >
              Research Lab
            </Link>
            <Link
              href="/about"
              className="px-space-md py-space-xs rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors font-body-md text-body-md"
            >
              About
            </Link>
          </nav>

          <div className="flex items-center gap-space-md shrink-0">
            <Link
              href="/detect"
              className="hidden sm:inline-flex items-center justify-center px-space-lg py-space-xs rounded-lg bg-secondary text-on-secondary hover:bg-secondary-fixed-dim hover:text-on-secondary-fixed transition-all font-headline-sm text-body-md shadow-[0_2px_8px_rgba(0,106,97,0.2)]"
            >
              <span className="material-symbols-outlined text-[18px] mr-space-xs">mic</span>
              Analyze a Voice
            </Link>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full pt-16 bg-surface min-h-[calc(100vh-16rem)]">
        <div className="flex flex-col w-full">
          {/* Subtle Ambient Glows */}
          <section className="relative w-full overflow-hidden pt-space-xl pb-space-xl px-margin">
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[360px] bg-gradient-to-b from-secondary-container/30 via-primary-fixed/20 to-transparent blur-3xl pointer-events-none -z-10 rounded-full"></div>
            <div className="absolute top-48 -right-24 w-[420px] h-[420px] bg-tertiary-fixed/25 blur-3xl pointer-events-none -z-10 rounded-full"></div>
            <div className="absolute top-64 -left-20 w-[380px] h-[380px] bg-secondary-fixed/20 blur-3xl pointer-events-none -z-10 rounded-full"></div>

            <div className="max-w-[1440px] mx-auto flex flex-col items-center text-center">
              {/* Hero Badge */}
              <div className="inline-flex items-center gap-space-xs px-space-md py-1.5 rounded-full bg-surface-container-lowest shadow-sm mb-space-lg">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-secondary-container/40 text-secondary text-sm">
                  <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    verified_user
                  </span>
                </span>
                <span className="font-mono-badge text-mono-badge uppercase tracking-wider text-secondary">
                  Real-Time Voice Biometrics &amp; Deepfake Scam Defense
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping ml-1"></span>
              </div>

              {/* Hero Title */}
              <h1 className="font-display-hero text-display-hero text-on-surface tracking-tight max-w-5xl mb-space-sm">
                VoiceShield<span className="text-secondary">-AI</span>
              </h1>

              {/* Punchy Subheading */}
              <p className="font-headline-lg text-headline-lg text-primary mb-space-md tracking-tight font-semibold">
                Detect. Verify. Explain.
              </p>

              {/* Value Proposition */}
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-3xl mb-space-xl leading-relaxed">
                An explainable voice-security platform that combines deepfake audio forensics with multi-factor caller verification and conversation intelligence to neutralize social-engineering fraud in real time.
              </p>

              {/* CTA Group */}
              <div className="flex flex-wrap items-center justify-center gap-space-md mb-space-xl w-full max-w-2xl">
                <Link
                  href="/simulate"
                  className="inline-flex items-center justify-center gap-space-xs px-space-xl py-3.5 rounded-xl bg-primary text-on-primary font-headline-sm text-headline-sm shadow-md hover:bg-primary-container transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span className="material-symbols-outlined text-[20px] text-secondary-fixed">bolt</span>
                  Launch Call Simulator
                </Link>
                <Link
                  href="/detect"
                  className="inline-flex items-center justify-center gap-space-xs px-space-lg py-3.5 rounded-xl bg-surface-container-lowest text-on-surface font-headline-sm text-headline-sm shadow-sm hover:bg-surface-container-low transition-all"
                >
                  <span className="material-symbols-outlined text-secondary text-[20px]">shield</span>
                  Analyze Audio
                </Link>
                <Link
                  href="/verify"
                  className="inline-flex items-center justify-center gap-space-xs px-space-lg py-3.5 rounded-xl bg-surface-container-lowest text-on-surface font-headline-sm text-headline-sm shadow-sm hover:bg-surface-container-low transition-all"
                >
                  <span className="material-symbols-outlined text-primary text-[20px]">perm_phone_msg</span>
                  Caller Verification
                </Link>
              </div>

              {/* Live Interactive Biometric Spectrogram Diagnostic Viewport */}
              <div className="w-full max-w-5xl bg-surface-container-lowest rounded-2xl p-space-lg shadow-xl relative overflow-hidden text-left mb-space-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md pb-space-md mb-space-md bg-surface-container-low/50 -m-space-lg p-space-lg rounded-t-2xl">
                  <div className="flex items-center gap-space-md">
                    <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-sm">
                      <span className="material-symbols-outlined text-[22px]">graphic_eq</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-headline-sm text-headline-sm text-on-surface">
                          Spectrogram Telemetry Engine
                        </span>
                        <span className="px-2 py-0.5 rounded bg-secondary-container/40 text-on-secondary-container font-mono-label text-mono-label uppercase">
                          Live Buffer #8491
                        </span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Continuous Acoustic Prosody &amp; Waveform Latency Inspection
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-space-sm">
                    <div className="px-3 py-1.5 rounded-lg bg-surface-container flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse"></span>
                      <span className="font-mono-label text-mono-label text-on-surface uppercase">
                        Model: WavLM-Fusion-v3
                      </span>
                    </div>
                    <button
                      onClick={togglePulse}
                      className="px-space-md py-1.5 rounded-lg bg-secondary text-on-secondary hover:bg-secondary-fixed-dim hover:text-on-secondary-fixed transition-all font-mono-badge text-mono-badge flex items-center gap-1.5 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {isAnimating ? "pause" : "play_arrow"}
                      </span>
                      <span>{isAnimating ? "Pause Trace" : "Pulse Acoustic Trace"}</span>
                    </button>
                  </div>
                </div>

                {/* Spectrogram Wave Visualizer Canvas Simulation */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-md pt-space-xs">
                  {/* Waveform Panel */}
                  <div className="lg:col-span-2 bg-surface-container-low rounded-xl p-space-md flex flex-col justify-between">
                    <div className="flex items-center justify-between text-on-surface-variant font-mono-label text-mono-label mb-2">
                      <span className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px] text-primary">analytics</span>
                        SPECTRAL DENSITY: 16.4 kHz / 32-Bit Float
                      </span>
                      <span className="text-secondary font-semibold">SYNTHETIC PHASE JITTER: 0.04% [CLEAN]</span>
                    </div>

                    {/* Waveform visualizer bars */}
                    <div className="h-28 flex items-end gap-1 px-1 py-2 overflow-hidden bg-surface-container-lowest/80 rounded-lg">
                      {bars.map((height, idx) => (
                        <div
                          key={idx}
                          className="flex-1 bg-gradient-to-t from-primary to-secondary rounded-t transition-all duration-300"
                          style={{ height: `${height}%` }}
                        />
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-on-surface-variant font-mono-label text-mono-label mt-2">
                      <span>0.00s</span>
                      <span>TIME WINDOW [0.850s INTERVAL]</span>
                      <span>+0.85s</span>
                    </div>
                  </div>

                  {/* Real-Time Inference Card */}
                  <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono-label text-mono-label uppercase text-on-surface-variant">
                          Synthetic Risk Confidence
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-secondary-container/50 text-on-secondary-container font-mono-badge text-mono-badge font-semibold">
                          99.4% Human
                        </span>
                      </div>
                      <div className="w-full bg-surface-container rounded-full h-2 my-2 overflow-hidden">
                        <div className="bg-secondary h-full rounded-full w-[99.4%] transition-all duration-700"></div>
                      </div>
                    </div>

                    <div className="space-y-1.5 my-2">
                      <div className="flex justify-between items-center text-body-sm font-body-sm">
                        <span className="text-on-surface-variant">Acoustic Glottal Pulse</span>
                        <span className="font-mono-badge text-mono-badge text-secondary font-medium">Verified Organic</span>
                      </div>
                      <div className="flex justify-between items-center text-body-sm font-body-sm">
                        <span className="text-on-surface-variant">Temporal Vocoder Artifacts</span>
                        <span className="font-mono-badge text-mono-badge text-on-surface font-medium">None Detected</span>
                      </div>
                      <div className="flex justify-between items-center text-body-sm font-body-sm">
                        <span className="text-on-surface-variant">Latency Window</span>
                        <span className="font-mono-badge text-mono-badge text-primary font-medium">184 ms</span>
                      </div>
                    </div>

                    <div className="p-2 rounded bg-surface-container-lowest flex items-center justify-between">
                      <span className="font-mono-label text-mono-label uppercase text-on-surface-variant">Verdict Decision</span>
                      <span className="font-mono-badge text-mono-badge text-secondary font-semibold uppercase flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span> Pass / Zero Threat
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Metric KPI Highlights Bar */}
          <section className="w-full px-margin pb-space-xl">
            <div className="max-w-[1440px] mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
                {/* KPI 1 */}
                <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group">
                  <div className="w-2 rounded-full absolute left-0 top-0 bottom-0 bg-primary opacity-75"></div>
                  <div className="flex items-center justify-between mb-space-sm pl-space-xs">
                    <span className="font-mono-label text-mono-label uppercase text-on-surface-variant">ENSEMBLE MODELS</span>
                    <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[18px]">hub</span>
                    </div>
                  </div>
                  <div className="pl-space-xs">
                    <span className="font-headline-md text-headline-md text-on-surface block font-semibold mb-1">
                      3 Neural Detectors
                    </span>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Fused spectrogram, spectral, &amp; wavLM nets
                    </p>
                  </div>
                </div>

                {/* KPI 2 */}
                <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group">
                  <div className="w-2 rounded-full absolute left-0 top-0 bottom-0 bg-secondary opacity-75"></div>
                  <div className="flex items-center justify-between mb-space-sm pl-space-xs">
                    <span className="font-mono-label text-mono-label uppercase text-on-surface-variant">DETECTION LATENCY</span>
                    <div className="w-8 h-8 rounded-lg bg-secondary-container/30 flex items-center justify-center text-secondary">
                      <span className="material-symbols-outlined text-[18px]">speed</span>
                    </div>
                  </div>
                  <div className="pl-space-xs">
                    <span className="font-headline-md text-headline-md text-on-surface block font-semibold mb-1">
                      &lt; 250ms Real-Time
                    </span>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Ultra-low latency streaming telecommunication
                    </p>
                  </div>
                </div>

                {/* KPI 3 */}
                <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group">
                  <div className="w-2 rounded-full absolute left-0 top-0 bottom-0 bg-tertiary opacity-75"></div>
                  <div className="flex items-center justify-between mb-space-sm pl-space-xs">
                    <span className="font-mono-label text-mono-label uppercase text-on-surface-variant">EVALUATION SUITE</span>
                    <div className="w-8 h-8 rounded-lg bg-tertiary-fixed/30 flex items-center justify-center text-tertiary">
                      <span className="material-symbols-outlined text-[18px]">assessment</span>
                    </div>
                  </div>
                  <div className="pl-space-xs">
                    <span className="font-headline-md text-headline-md text-on-surface block font-semibold mb-1">
                      ASVspoof Benchmark
                    </span>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      State-of-the-art synthetic biometric benchmark
                    </p>
                  </div>
                </div>

                {/* KPI 4 */}
                <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group">
                  <div className="w-2 rounded-full absolute left-0 top-0 bottom-0 bg-primary-container opacity-75"></div>
                  <div className="flex items-center justify-between mb-space-sm pl-space-xs">
                    <span className="font-mono-label text-mono-label uppercase text-on-surface-variant">VERIFICATION STANDARD</span>
                    <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-primary-container">
                      <span className="material-symbols-outlined text-[18px]">policy</span>
                    </div>
                  </div>
                  <div className="pl-space-xs">
                    <span className="font-headline-md text-headline-md text-on-surface block font-semibold mb-1">
                      RBI &amp; TRAI Aligned
                    </span>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Banking fraud mitigation &amp; telecom mandates
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Core Forensics Pillars Section */}
          <section className="w-full px-margin py-space-xl bg-surface-container-low/50">
            <div className="max-w-[1440px] mx-auto">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-space-xl">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-surface-container-lowest text-secondary font-mono-label text-mono-label uppercase mb-space-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                    Triple-Tier Architecture
                  </div>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">
                    Uncompromising Defense Core
                  </h2>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-md mt-2 md:mt-0">
                  Engineered to dismantle multi-stage synthetic voice exploits before unauthorized call termination or transaction authorization.
                </p>
              </div>

              {/* 3 Polished Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
                {/* Pillar 1: AI Voice Forensics */}
                <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-space-md">
                      <span className="px-space-sm py-1 rounded bg-primary-fixed/40 text-on-primary-fixed-variant font-mono-label text-mono-label font-semibold uppercase">
                        FORENSICS CORE
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[24px]">fingerprint</span>
                      </div>
                    </div>
                    <h3 className="font-headline-md text-headline-md text-on-surface font-semibold mb-space-xs">
                      AI Voice Forensics
                    </h3>
                    <p className="font-body-md text-body-md text-on-surface-variant mb-space-lg leading-relaxed">
                      Spectrogram, WavLM, and acoustic-prosody signals fused into one explainable synthetic-speech likelihood — never a single black-box number.
                    </p>
                  </div>
                  <div className="pt-space-md bg-surface-container-low/40 -mx-space-lg -mb-space-lg px-space-lg pb-space-lg rounded-b-2xl">
                    <div className="flex items-center justify-between text-mono-badge font-mono-badge text-on-surface-variant mb-1">
                      <span>Model Convergence</span>
                      <span className="text-primary font-semibold">99.8% Fused</span>
                    </div>
                    <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                      <div className="bg-primary h-full rounded-full w-[99.8%]"></div>
                    </div>
                    <div className="mt-space-sm flex items-center gap-space-xs text-body-sm font-body-sm text-secondary">
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      Raw Acoustic Phase Breakdown
                    </div>
                  </div>
                </div>

                {/* Pillar 2: Caller Verification */}
                <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-space-md">
                      <span className="px-space-sm py-1 rounded bg-secondary-container/40 text-on-secondary-container font-mono-label text-mono-label font-semibold uppercase">
                        ZERO-TRUST IDENTITY
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-secondary-container/20 flex items-center justify-center text-secondary">
                        <span className="material-symbols-outlined text-[24px]">verified</span>
                      </div>
                    </div>
                    <h3 className="font-headline-md text-headline-md text-on-surface font-semibold mb-space-xs">
                      Caller Verification
                    </h3>
                    <p className="font-body-md text-body-md text-on-surface-variant mb-space-lg leading-relaxed">
                      Organization, branch/location, and caller identity are checked independently of the voice signal. Caller ID is one signal, never proof.
                    </p>
                  </div>
                  <div className="pt-space-md bg-surface-container-low/40 -mx-space-lg -mb-space-lg px-space-lg pb-space-lg rounded-b-2xl">
                    <div className="flex items-center justify-between text-mono-badge font-mono-badge text-on-surface-variant mb-1">
                      <span>SS7 / STIR-SHAKEN Integrity</span>
                      <span className="text-secondary font-semibold">Attestation A</span>
                    </div>
                    <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                      <div className="bg-secondary h-full rounded-full w-[100%]"></div>
                    </div>
                    <div className="mt-space-sm flex items-center gap-space-xs text-body-sm font-body-sm text-secondary">
                      <span className="material-symbols-outlined text-[16px]">cell_tower</span>
                      Telecom Origin Cross-Referenced
                    </div>
                  </div>
                </div>

                {/* Pillar 3: Explainable Risk */}
                <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-space-md">
                      <span className="px-space-sm py-1 rounded bg-surface-container-high text-on-surface font-mono-label text-mono-label font-semibold uppercase">
                        EXPLAINABLE AI
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-on-surface">
                        <span className="material-symbols-outlined text-[24px]">visibility</span>
                      </div>
                    </div>
                    <h3 className="font-headline-md text-headline-md text-on-surface font-semibold mb-space-xs">
                      Explainable Risk
                    </h3>
                    <p className="font-body-md text-body-md text-on-surface-variant mb-space-lg leading-relaxed">
                      Every risk score comes with an audit panel that links straight back to the segment, model, or verification source that produced it.
                    </p>
                  </div>
                  <div className="pt-space-md bg-surface-container-low/40 -mx-space-lg -mb-space-lg px-space-lg pb-space-lg rounded-b-2xl">
                    <div className="flex items-center justify-between text-mono-badge font-mono-badge text-on-surface-variant mb-1">
                      <span>Audit Chain Transparency</span>
                      <span className="text-primary-container font-semibold">100% Traceable</span>
                    </div>
                    <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                      <div className="bg-primary-container h-full rounded-full w-[100%]"></div>
                    </div>
                    <div className="mt-space-sm flex items-center gap-space-xs text-body-sm font-body-sm text-primary">
                      <span className="material-symbols-outlined text-[16px]">history_edu</span>
                      Granular Temporal Log Export
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Live Simulated Call Defense Scenario Walkthrough */}
          <section className="w-full px-margin py-space-xl">
            <div className="max-w-[1440px] mx-auto">
              <div className="bg-surface-container-lowest rounded-2xl shadow-xl p-space-xl overflow-hidden relative">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center">
                  <div className="lg:col-span-6 space-y-space-md">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-secondary-container/30 text-on-secondary-container font-mono-label text-mono-label uppercase">
                      Real-World Telecom Defense
                    </div>
                    <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">
                      Neutralize Vishing &amp; Executive Cloning Attacks in Sub-Seconds
                    </h2>
                    <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                      When an attacker deploys real-time voice cloning over SIP trunks or cellular networks to authorize wire transfers, VoiceShield-AI flags artificial vocal tracts before authorization prompts complete.
                    </p>
                    <div className="space-y-space-sm pt-space-xs">
                      <div className="flex items-start gap-space-sm">
                        <div className="w-6 h-6 rounded-full bg-secondary-container/40 text-secondary flex items-center justify-center shrink-0 mt-0.5">
                          <span className="material-symbols-outlined text-[16px]">check</span>
                        </div>
                        <div>
                          <h4 className="font-headline-sm text-headline-sm text-on-surface">
                            Zero-Latency In-Band Intercept
                          </h4>
                          <p className="font-body-sm text-body-sm text-on-surface-variant">
                            Direct integration into Twilio, FreeSWITCH, Genesys, and enterprise PBX platforms.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-space-sm">
                        <div className="w-6 h-6 rounded-full bg-secondary-container/40 text-secondary flex items-center justify-center shrink-0 mt-0.5">
                          <span className="material-symbols-outlined text-[16px]">check</span>
                        </div>
                        <div>
                          <h4 className="font-headline-sm text-headline-sm text-on-surface">
                            Forensic Chain of Custody
                          </h4>
                          <p className="font-body-sm text-body-sm text-on-surface-variant">
                            Immutable audio cryptographic hashes compliant with judicial evidence standards.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="pt-space-sm flex flex-wrap gap-space-sm">
                      <Link
                        href="/simulate"
                        className="inline-flex items-center gap-space-xs px-space-lg py-3 rounded-lg bg-primary text-on-primary font-headline-sm text-body-md shadow-sm hover:bg-primary-container transition-all"
                      >
                        <span className="material-symbols-outlined text-[18px]">play_circle</span>
                        Experience Live Incident Simulator
                      </Link>
                    </div>
                  </div>

                  {/* Forensic Diagnostic Telemetry Screen Graphic */}
                  <div className="lg:col-span-6">
                    <div className="bg-surface-container-low rounded-xl p-space-md shadow-inner space-y-space-sm">
                      <div className="flex items-center justify-between pb-2 bg-surface-container-lowest p-space-sm rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-error animate-ping"></span>
                          <span className="font-mono-metric text-mono-metric text-error font-bold">
                            INTERCEPT: High-Risk Cloned Persona
                          </span>
                        </div>
                        <span className="font-mono-badge text-mono-badge bg-error-container text-on-error-container px-2 py-0.5 rounded">
                          THREAT MITIGATED
                        </span>
                      </div>

                      {/* Diagnostic visual stream mock */}
                      <div className="bg-surface-container-lowest p-space-md rounded-lg space-y-3">
                        <div className="flex justify-between items-center text-body-sm">
                          <span className="text-on-surface-variant font-mono-label">SOURCE CALLER</span>
                          <span className="font-mono-badge font-semibold text-on-surface">
                            +1 (415) 555-0199 [Spoofed Executive Desk]
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-body-sm">
                          <span className="text-on-surface-variant font-mono-label">VOCODER SIGNATURE</span>
                          <span className="font-mono-badge font-semibold text-error">
                            Diffusion-TTS-v4 / Formant Void Detected
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-body-sm">
                          <span className="text-on-surface-variant font-mono-label">CONFIDENCE THRESHOLD</span>
                          <span className="font-mono-badge font-semibold text-error">
                            98.7% Synthetic Likelihood
                          </span>
                        </div>

                        {/* Explainability bar breakdown */}
                        <div className="pt-2">
                          <div className="flex justify-between text-mono-label text-mono-label text-on-surface-variant mb-1">
                            <span>Acoustic Discontinuity Indicator</span>
                            <span className="text-error font-mono-badge">98.7%</span>
                          </div>
                          <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                            <div className="bg-error h-full rounded-full w-[98.7%]"></div>
                          </div>
                        </div>

                        <div className="p-space-sm rounded bg-surface-container-low flex items-start gap-2 text-body-sm">
                          <span className="material-symbols-outlined text-error text-[18px] shrink-0 mt-0.5">report</span>
                          <p className="text-on-surface-variant">
                            VoiceShield-AI auto-injected interactive dynamic challenge question and routed call telemetry to Tier-3 Fraud Ops.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Unified Global Platform Banner */}
          <section className="w-full px-margin pb-space-xl">
            <div className="max-w-[1440px] mx-auto">
              <div className="bg-gradient-to-r from-surface-container-low via-surface-container-lowest to-surface-container-low rounded-2xl p-space-lg text-center shadow-sm flex flex-col md:flex-row items-center justify-between gap-space-md">
                <div className="flex items-center gap-space-md text-left">
                  <div className="w-12 h-12 rounded-xl bg-secondary-container/40 text-secondary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[28px]">verified_user</span>
                  </div>
                  <div>
                    <p className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                      VoiceShield-AI Enterprise Core
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Explainable voice-security, multi-model forensics, and caller verification platform.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-space-sm shrink-0">
                  <Link
                    href="/detect"
                    className="px-space-lg py-2.5 rounded-lg bg-secondary text-on-secondary hover:bg-secondary-fixed-dim hover:text-on-secondary-fixed font-headline-sm text-body-md transition-all shadow-sm"
                  >
                    Analyze a Voice
                  </Link>
                  <Link
                    href="/about"
                    className="px-space-md py-2.5 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container transition-all font-headline-sm text-body-md shadow-sm"
                  >
                    Read Whitepaper
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-surface-container-lowest mt-space-xl shadow-[0_-1px_8px_rgba(0,0,0,0.03)]">
        <div className="max-w-[1440px] mx-auto px-margin py-space-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-space-xl">
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
                  <span className="material-symbols-outlined text-[14px] text-secondary">verified_user</span>
                  SOC-2 Type II
                </span>
                <span className="inline-flex items-center gap-1 px-space-sm py-0.5 rounded bg-surface-container-low text-on-surface-variant font-mono-badge text-mono-badge">
                  <span className="material-symbols-outlined text-[14px] text-secondary">lock</span>
                  AES-256 GCM
                </span>
                <span className="inline-flex items-center gap-1 px-space-sm py-0.5 rounded bg-surface-container-low text-on-surface-variant font-mono-badge text-mono-badge">
                  <span className="material-symbols-outlined text-[14px] text-secondary">gavel</span>
                  ISO 27001
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-space-sm">
              <span className="font-mono-label text-mono-label uppercase text-on-surface-variant">Detection Engine</span>
              <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-secondary transition-colors" href="/detect">
                Spectrogram Diagnostic
              </Link>
              <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-secondary transition-colors" href="/research/models">
                Synthetic Vocal Signatures
              </Link>
              <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-secondary transition-colors" href="/detect">
                Cloning Detection API
              </Link>
              <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-secondary transition-colors" href="/simulate">
                Real-Time Call Gateway
              </Link>
            </div>

            <div className="flex flex-col gap-space-sm">
              <span className="font-mono-label text-mono-label uppercase text-on-surface-variant">Infrastructure</span>
              <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-secondary transition-colors" href="/research">
                Network Telemetry
              </Link>
              <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-secondary transition-colors" href="/research/experiments">
                Latency Benchmarks
              </Link>
              <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-secondary transition-colors" href="http://127.0.0.1:8000/docs" target="_blank" rel="noreferrer">
                SDK Documentation
              </a>
              <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-secondary transition-colors" href="http://127.0.0.1:8000/health" target="_blank" rel="noreferrer">
                System Status
              </a>
            </div>

            <div className="flex flex-col gap-space-sm">
              <span className="font-mono-label text-mono-label uppercase text-on-surface-variant">Compliance &amp; Trust</span>
              <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-secondary transition-colors" href="/about">
                Biometric Privacy Policy
              </Link>
              <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-secondary transition-colors" href="/research">
                Regulatory Whitepapers
              </Link>
              <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-secondary transition-colors" href="/about">
                Model Explainability
              </Link>
              <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-secondary transition-colors" href="/about">
                Security Vulnerability Report
              </Link>
            </div>
          </div>

          <div className="mt-space-xl pt-space-lg flex flex-col sm:flex-row items-center justify-between gap-space-md font-mono-label text-mono-label text-on-surface-variant">
            <p>© 2025 VoiceShield-AI Inc. Zero-Trust Voice Defense Systems. All rights reserved.</p>
            <div className="flex items-center gap-space-md">
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                Core Neural Grid 99.998% Uptime
              </span>
              <span className="text-outline-variant">|</span>
              <Link className="hover:text-secondary transition-colors" href="/about">
                Terms
              </Link>
              <Link className="hover:text-secondary transition-colors" href="/about">
                Security
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
