import Link from "next/link";
import { Shield, Activity, PhoneCall, Zap, Lock, Sparkles, CheckCircle2 } from "lucide-react";

const FEATURES = [
  {
    icon: Shield,
    title: "AI Voice Forensics",
    body: "Spectrogram, WavLM, and acoustic-prosody signals fused into one explainable synthetic-speech likelihood — never a single black-box number.",
    tag: "Forensics Core",
  },
  {
    icon: PhoneCall,
    title: "Caller Verification",
    body: "Organization, branch/location, and caller identity are checked independently of the voice signal. Caller ID is one signal, never proof.",
    tag: "Zero-Trust Identity",
  },
  {
    icon: Activity,
    title: "Explainable Risk",
    body: "Every risk score comes with an audit panel that links straight back to the segment, model, or verification source that produced it.",
    tag: "Explainable AI",
  },
];

const METRICS = [
  { label: "Ensemble Models", value: "3 Neural Detectors" },
  { label: "Detection Latency", value: "< 250ms Real-Time" },
  { label: "Evaluation Suite", value: "ASVspoof Benchmark" },
  { label: "Verification Standard", value: "RBI & TRAI Aligned" },
];

export default function HomePage() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative pt-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold text-cyan-300 backdrop-blur-md mb-6">
          <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
          Real-Time Voice Biometrics &amp; Deepfake Scam Defense
        </div>

        <h1 className="font-mono-vs text-5xl font-extrabold tracking-tight text-white md:text-6xl lg:text-7xl">
          VoiceShield<span className="text-cyan-accent">-AI</span>
        </h1>
        <p className="mt-4 text-xl font-medium text-slate-300 md:text-2xl">
          Detect. Verify. Explain.
        </p>
        <p className="mx-auto mt-5 max-w-2xl text-base text-slate-400 md:text-lg">
          An explainable voice-security platform that combines deepfake audio forensics with
          multi-factor caller verification and conversation intelligence to neutralize
          social-engineering fraud in real time.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/simulate"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 px-7 py-3.5 font-semibold text-navy-950 shadow-lg shadow-cyan-500/25 transition hover:brightness-110"
          >
            <Zap className="h-5 w-5 fill-navy-950" />
            Launch Call Simulator
          </Link>
          <Link
            href="/detect"
            className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-6 py-3.5 font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
          >
            <Shield className="h-5 w-5 text-cyan-accent" />
            Analyze Audio
          </Link>
          <Link
            href="/verify"
            className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-6 py-3.5 font-semibold text-slate-300 transition hover:bg-white/5"
          >
            <PhoneCall className="h-5 w-5 text-slate-400" />
            Caller Verification
          </Link>
        </div>

        {/* Key Platform Metrics */}
        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
          {METRICS.map((m) => (
            <div
              key={m.label}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm"
            >
              <div className="text-xs uppercase tracking-wider text-slate-400">{m.label}</div>
              <div className="mt-1 font-mono-vs text-sm font-bold text-white">{m.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Core Architecture Features */}
      <section className="grid gap-6 md:grid-cols-3">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.title} className="glass-panel glass-panel-hover flex flex-col p-6">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-mono-vs uppercase tracking-wider text-slate-400">
                  {f.tag}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{f.body}</p>
            </div>
          );
        })}
      </section>
    </div>
  );
}
