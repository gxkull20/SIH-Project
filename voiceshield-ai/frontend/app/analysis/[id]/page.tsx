"use client";

import { useEffect, useState } from "react";
import { getAnalysis, reportDownloadUrl } from "@/lib/api";
import type { AnalysisSession } from "@/types/api";
import { AuthenticityGauge, RiskMeter } from "@/components/RiskGauge";
import EvidencePanel from "@/components/EvidencePanel";
import SegmentTimeline from "@/components/SegmentTimeline";
import VerificationBadgeCard from "@/components/VerificationBadgeCard";
import ModelSignalCard from "@/components/ModelSignalCard";

export default function AnalysisPage({ params }: { params: { id: string } }) {
  const [session, setSession] = useState<AnalysisSession | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAnalysis(params.id)
      .then(setSession)
      .catch((err) => setError(err.message || "Analysis not found."));
  }, [params.id]);

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-6 text-red-300">{error}</div>
    );
  }
  if (!session) {
    return <div className="text-slate-400">Loading analysis…</div>;
  }
  if (session.status === "failed") {
    return (
      <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-6 text-red-300">
        {session.error_message || "Analysis failed."}
      </div>
    );
  }

  // Aggregate per-model signals across segments for the multi-model dashboard.
  const aggregateByModel: Record<string, any> = {};
  (session.segments || []).forEach((seg) => {
    seg.predictions.forEach((p) => {
      if (!aggregateByModel[p.model_name]) aggregateByModel[p.model_name] = p;
    });
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-mono-vs text-2xl font-bold text-white">Analysis Result</h1>
          <p className="text-xs text-slate-500">Session {session.session_id}</p>
        </div>
        <a
          href={reportDownloadUrl(session.session_id)}
          className="rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-white hover:bg-white/5"
        >
          Download Report
        </a>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AuthenticityGauge fusion={session.fusion} />
        <RiskMeter risk={session.risk} />
      </div>

      <div>
        <h3 className="font-mono-vs mb-3 text-sm uppercase tracking-wider text-slate-400">
          Model Signals
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          {Object.values(aggregateByModel).map((p: any) => (
            <ModelSignalCard key={p.model_name} prediction={p} />
          ))}
        </div>
      </div>

      {session.segments && session.segments.length > 0 && (
        <SegmentTimeline segments={session.segments} />
      )}

      <div>
        <h3 className="font-mono-vs mb-3 text-sm uppercase tracking-wider text-slate-400">
          Verification
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          <VerificationBadgeCard title="Organization" entry={session.verification?.organization} />
          <VerificationBadgeCard title="Branch / Location" entry={session.verification?.branch} />
          <VerificationBadgeCard title="Caller Identity" entry={session.verification?.caller} />
        </div>
      </div>

      {session.conversation?.otp_detection?.detected && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-200">
          <span className="font-semibold">OTP/credential request detected</span> — the actual code
          value, if spoken, is never extracted, stored, or displayed.
        </div>
      )}

      <EvidencePanel evidence={session.evidence || []} />
    </div>
  );
}
