"use client";

import { useEffect, useState } from "react";
import { listDemoScenarios, getDemoScenario } from "@/lib/api";
import { AuthenticityGauge, RiskMeter } from "@/components/RiskGauge";
import EvidencePanel from "@/components/EvidencePanel";
import VerificationBadgeCard from "@/components/VerificationBadgeCard";

export default function AboutPage() {
  const [scenarios, setScenarios] = useState<{ key: string; label: string }[]>([]);
  const [active, setActive] = useState<any>(null);

  useEffect(() => {
    listDemoScenarios().then((res) => setScenarios(res.scenarios));
  }, []);

  return (
    <div className="space-y-12">
      <section className="max-w-3xl">
        <h1 className="font-mono-vs text-3xl font-bold text-white">About VoiceShield-AI</h1>
        <p className="mt-4 text-slate-300">
          A suspicious caller can manipulate not only the voice but also the context. Traditional
          voice detection asks: "Does this sound synthetic?" VoiceShield-AI also asks whether the
          caller's organization claim is consistent, whether the branch/location checks out,
          whether the caller is independently verified, whether they're requesting an OTP, and
          whether the conversation contains social-engineering language — and it explains every
          part of that judgment.
        </p>
      </section>

      <section className="glass-panel max-w-3xl p-6">
        <h3 className="font-semibold text-white">Privacy</h3>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-300">
          <li>OTP and credential values spoken in a call are never extracted or stored.</li>
          <li>No unnecessary personal information is collected.</li>
          <li>Demo organizations are clearly labeled as fictional.</li>
          <li>Audio processing can run entirely locally when deployed on your own machine.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-mono-vs text-xl font-bold text-white">Demo Mode</h2>
        <p className="mt-1 text-sm text-slate-400">
          Predefined, clearly-labeled scenarios for fast judge walkthroughs — no live inference.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {scenarios.map((s) => (
            <button
              key={s.key}
              onClick={() => getDemoScenario(s.key).then(setActive)}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-200 hover:bg-white/5"
            >
              {s.label}
            </button>
          ))}
        </div>

        {active && (
          <div className="mt-6 space-y-6">
            <span className="badge-simulated">DEMO / SIMULATED DATA</span>
            <div className="grid gap-6 lg:grid-cols-2">
              <AuthenticityGauge fusion={active.fusion} />
              <RiskMeter risk={active.risk} />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <VerificationBadgeCard title="Organization" entry={active.verification.organization} />
              <VerificationBadgeCard title="Branch / Location" entry={active.verification.branch} />
              <VerificationBadgeCard title="Caller Identity" entry={active.verification.caller} />
            </div>
            <EvidencePanel evidence={active.evidence || []} />
          </div>
        )}
      </section>
    </div>
  );
}
