"use client";

import { AlertTriangle, CheckCircle, Shield, ShieldAlert, Zap } from "lucide-react";
import clsx from "clsx";

interface InCallShieldHUDProps {
  telemetry: any;
  callerProfile: any;
  callActive: boolean;
}

export default function InCallShieldHUD({
  telemetry,
  callerProfile,
  callActive,
}: InCallShieldHUDProps) {
  const risk = telemetry?.risk || {};
  const fusion = telemetry?.fusion || {};
  const verification = telemetry?.verification || {};
  const guidance = telemetry?.guidance || [];
  const riskScore = risk.risk_score ?? 0;
  const riskLevel = risk.risk_level || "LOW";

  const isCritical = riskLevel === "CRITICAL";
  const isHigh = riskLevel === "HIGH";
  const isModerate = riskLevel === "MODERATE";

  const syntheticPct = Math.round((fusion.synthetic_likelihood ?? callerProfile.voice_synthetic_likelihood ?? 0.5) * 100);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-navy-950/90 p-5 backdrop-blur-xl shadow-2xl transition-all">
      {/* HUD Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-3 w-3">
            <span
              className={clsx(
                "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
                isCritical || isHigh ? "bg-red-400" : isModerate ? "bg-amber-400" : "bg-emerald-400"
              )}
            />
            <span
              className={clsx(
                "relative inline-flex h-3 w-3 rounded-full",
                isCritical || isHigh ? "bg-red-500" : isModerate ? "bg-amber-500" : "bg-emerald-500"
              )}
            />
          </span>
          <span className="font-mono-vs text-xs font-bold uppercase tracking-wider text-slate-300">
            VoiceShield In-Call Co-Pilot
          </span>
        </div>
        <span
          className={clsx(
            "rounded-full px-2.5 py-0.5 font-mono-vs text-[10px] font-bold tracking-wider uppercase",
            isCritical
              ? "bg-red-500/20 text-red-300 border border-red-500/40"
              : isHigh
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
              : isModerate
              ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40"
              : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
          )}
        >
          {riskLevel} RISK ({riskScore} / 100)
        </span>
      </div>

      {/* Dynamic AI Copilot Guidance Banner */}
      {guidance.length > 0 && (
        <div className="space-y-1.5">
          {guidance.map((g: any, i: number) => (
            <div
              key={i}
              className={clsx(
                "flex items-start gap-2.5 rounded-xl border p-3 text-xs font-medium leading-relaxed transition-all",
                g.level === "critical"
                  ? "border-red-500/50 bg-red-500/15 text-red-200 animate-pulse"
                  : g.level === "warning"
                  ? "border-amber-500/40 bg-amber-500/15 text-amber-200"
                  : "border-cyan-500/30 bg-cyan-500/10 text-cyan-200"
              )}
            >
              <div className="text-sm mt-0.5">
                {g.level === "critical" ? "🚨" : g.level === "warning" ? "⚠️" : "🛡️"}
              </div>
              <div>{g.message}</div>
            </div>
          ))}
        </div>
      )}

      {/* Live Threat Gauges Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Deepfake Voice Forensics */}
        <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3.5">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
            <span>Synthetic Voice Forensics</span>
            <span
              className={clsx(
                "font-mono-vs font-bold",
                syntheticPct >= 60 ? "text-red-400" : syntheticPct >= 40 ? "text-amber-400" : "text-emerald-400"
              )}
            >
              {syntheticPct}%
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className={clsx(
                "h-full transition-all duration-500",
                syntheticPct >= 60 ? "bg-red-500" : syntheticPct >= 40 ? "bg-amber-500" : "bg-emerald-500"
              )}
              style={{ width: `${syntheticPct}%` }}
            />
          </div>
          <p className="mt-2 text-[10px] text-slate-400">
            {syntheticPct >= 70
              ? "Acoustic prosody & spectrogram signal indicate AI voice synthesis."
              : syntheticPct >= 40
              ? "Heuristic spectral indicators are ambiguous."
              : "Voice signal is consistent with natural human speech."}
          </p>
        </div>

        {/* Real-time Risk Score */}
        <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3.5">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
            <span>Overall Threat Assessment</span>
            <span
              className={clsx(
                "font-mono-vs font-bold",
                isCritical || isHigh ? "text-red-400" : isModerate ? "text-amber-400" : "text-emerald-400"
              )}
            >
              {riskScore}/100
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className={clsx(
                "h-full transition-all duration-500",
                isCritical
                  ? "bg-red-500"
                  : isHigh
                  ? "bg-amber-500"
                  : isModerate
                  ? "bg-yellow-500"
                  : "bg-emerald-500"
              )}
              style={{ width: `${Math.min(100, Math.max(5, riskScore))}%` }}
            />
          </div>
          <p className="mt-2 text-[10px] text-slate-400">
            {isCritical
              ? "High likelihood of social-engineering fraud. Terminate call."
              : isHigh
              ? "Multiple corroborating scam indicators present."
              : isModerate
              ? "Inconsistent identity claims require independent callback."
              : "Low fraud probability. Normal verification."}
          </p>
        </div>
      </div>

      {/* Identity Verification Live Badges */}
      <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3.5">
        <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
          Caller Identity Validation
        </span>
        <div className="mt-2.5 grid grid-cols-3 gap-2">
          {/* Org Badge */}
          <div className="rounded-lg border border-white/5 bg-black/20 p-2 text-center">
            <span className="block text-[10px] text-slate-400">Organization</span>
            <span
              className={clsx(
                "mt-1 inline-block rounded px-1.5 py-0.5 font-mono-vs text-[10px] font-semibold",
                verification.organization?.state === "verified"
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "bg-amber-500/20 text-amber-300"
              )}
            >
              {verification.organization?.state || "Unknown"}
            </span>
          </div>

          {/* Branch Badge */}
          <div className="rounded-lg border border-white/5 bg-black/20 p-2 text-center">
            <span className="block text-[10px] text-slate-400">Branch Record</span>
            <span
              className={clsx(
                "mt-1 inline-block rounded px-1.5 py-0.5 font-mono-vs text-[10px] font-semibold",
                verification.branch?.state === "verified"
                  ? "bg-emerald-500/20 text-emerald-300"
                  : verification.branch?.state === "inconsistent"
                  ? "bg-red-500/20 text-red-300"
                  : "bg-amber-500/20 text-amber-300"
              )}
            >
              {verification.branch?.state || "Unknown"}
            </span>
          </div>

          {/* Caller ID Badge */}
          <div className="rounded-lg border border-white/5 bg-black/20 p-2 text-center">
            <span className="block text-[10px] text-slate-400">Caller ID</span>
            <span
              className={clsx(
                "mt-1 inline-block rounded px-1.5 py-0.5 font-mono-vs text-[10px] font-semibold",
                verification.caller?.state === "requires_independent_verification"
                  ? "bg-yellow-500/20 text-yellow-300"
                  : "bg-red-500/20 text-red-300"
              )}
            >
              {verification.caller?.caller_id_known ? "Listed Number" : "Unverified"}
            </span>
          </div>
        </div>
      </div>

      {/* In-Call Evidence Trail Log */}
      <div className="space-y-2">
        <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
          Corroborating Evidence ({telemetry?.evidence?.length || 0})
        </span>
        <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
          {(telemetry?.evidence || []).map((ev: any, idx: number) => (
            <div
              key={idx}
              className="flex items-start gap-2 rounded-lg border border-white/5 bg-white/[0.02] p-2 text-[11px]"
            >
              <span
                className={clsx(
                  "mt-0.5 font-mono-vs text-[9px] font-bold uppercase",
                  ev.severity === "critical" || ev.severity === "high"
                    ? "text-red-400"
                    : ev.severity === "medium"
                    ? "text-amber-400"
                    : "text-slate-400"
                )}
              >
                [{ev.category}]
              </span>
              <div className="flex-1">
                <span className="font-semibold text-slate-200">{ev.title}</span>
                <p className="text-slate-400 text-[10px] leading-relaxed">{ev.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
