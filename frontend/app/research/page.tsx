import Link from "next/link";

const TABS = [
  { href: "/research/models", label: "Models", desc: "Model cards, architecture, training transparency." },
  { href: "/research/experiments", label: "Experiments", desc: "Run and inspect ASVspoof-style experiments." },
  { href: "/research/datasets", label: "Datasets", desc: "What data this prototype does (and doesn't) use." },
];

export default function ResearchLabPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-mono-vs text-3xl font-bold text-white">VoiceShield Research Lab</h1>
        <p className="mt-1 text-slate-400">
          Model transparency, reproducible experiments, and configuration for researchers and students.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {TABS.map((tab) => (
          <Link key={tab.href} href={tab.href} className="glass-panel glass-panel-hover block p-6">
            <h3 className="text-lg font-semibold text-white">{tab.label}</h3>
            <p className="mt-2 text-sm text-slate-400">{tab.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
