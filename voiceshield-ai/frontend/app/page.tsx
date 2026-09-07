import Link from "next/link";

const FEATURES = [
  {
    title: "AI Voice Detection",
    body: "Spectrogram, WavLM, and acoustic-prosody signals fused into one explainable synthetic-speech likelihood — never a single black-box number.",
  },
  {
    title: "Caller Verification",
    body: "Organization, branch/location, and caller identity are checked independently of the voice signal. Caller ID is one signal, never proof.",
  },
  {
    title: "Explainable Risk",
    body: "Every risk score comes with a 'Why is this risky?' panel that links straight back to the segment, model, or verification source that produced it.",
  },
];

const SECTIONS = [
  {
    title: "How It Works",
    body: "Audio is preprocessed, segmented, and scored by multiple independent models. Those voice signals are fused with conversation analysis and caller verification into one policy-driven risk score.",
  },
  {
    title: "Research First",
    body: "Every model ships with a model card, and the Research Lab lets you run ASVspoof-style experiments and inspect real metrics — never fabricated ones.",
  },
  {
    title: "Student Deployable",
    body: "Next.js + FastAPI + PostgreSQL, fully containerized with Docker Compose. Clone it, run it, and replace any model without touching the rest of the app.",
  },
  {
    title: "Privacy",
    body: "No OTP values, passwords, or unnecessary personal data are ever stored. Demo organizations are clearly labeled as fictional.",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-20">
      <section className="pt-10 text-center">
        <h1 className="font-mono-vs text-5xl font-extrabold tracking-tight text-white md:text-6xl">
          VoiceShield<span className="text-cyan-accent">-AI</span>
        </h1>
        <p className="mt-3 text-xl font-medium text-slate-300">Detect. Verify. Explain.</p>
        <p className="mx-auto mt-5 max-w-2xl text-slate-400">
          An explainable voice-security platform that combines AI voice forensics with real-world
          caller verification and conversation intelligence to assess social-engineering risk —
          not just "is this voice fake?"
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/simulate"
            className="rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3 font-semibold text-navy-950 shadow-lg shadow-cyan-500/20 transition hover:brightness-110"
          >
            📱 Interactive Call Simulator
          </Link>
          <Link
            href="/detect"
            className="rounded-lg border border-white/20 bg-white/5 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
          >
            Analyze a Voice
          </Link>
          <Link
            href="/detect?mode=live"
            className="rounded-lg border border-white/15 px-6 py-3 font-semibold text-slate-300 transition hover:bg-white/5"
          >
            Live Mic Detection
          </Link>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {FEATURES.map((f) => (
          <div key={f.title} className="glass-panel glass-panel-hover p-6">
            <h3 className="text-lg font-semibold text-white">{f.title}</h3>
            <p className="mt-2 text-sm text-slate-400">{f.body}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        {SECTIONS.map((s) => (
          <div key={s.title} className="glass-panel p-6">
            <h3 className="font-mono-vs text-sm uppercase tracking-wider text-cyan-accent">
              {s.title}
            </h3>
            <p className="mt-2 text-sm text-slate-300">{s.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
