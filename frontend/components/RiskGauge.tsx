"use client";

import { riskBgClass, riskTextClass, pct } from "@/lib/risk-style";
import type { RiskResult, FusionResult } from "@/types/api";

export function AuthenticityGauge({ fusion }: { fusion?: FusionResult }) {
  const synthetic = fusion?.synthetic_likelihood ?? null;
  const human = fusion?.human_likelihood ?? null;
  const angle = synthetic !== null ? Math.min(180, Math.max(0, synthetic * 180)) : 0;

  return (
    <div className="glass-panel p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-mono-vs text-sm uppercase tracking-wider text-slate-400">
          Voice Authenticity
        </h3>
        {fusion?.any_simulated && <span className="badge-simulated">Simulation Mode</span>}
      </div>

      <div className="relative mx-auto h-32 w-64">
        <svg viewBox="0 0 200 100" className="h-full w-full">
          <path d="M10,100 A90,90 0 0,1 190,100" fill="none" stroke="#1e293b" strokeWidth="14" />
          <path
            d="M10,100 A90,90 0 0,1 190,100"
            fill="none"
            stroke="url(#gaugeGrad)"
            strokeWidth="14"
            strokeDasharray={`${(angle / 180) * 283} 283`}
          />
          <defs>
            <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-x-0 bottom-0 text-center">
          <div className="font-mono-vs text-3xl font-bold text-white">{pct(synthetic)}</div>
          <div className="text-xs text-slate-400">Synthetic Speech Likelihood</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-center">
        <div className="rounded-lg border border-white/5 bg-white/5 py-2">
          <div className="font-mono-vs text-lg font-semibold text-safe-accent">{pct(human)}</div>
          <div className="text-xs text-slate-400">Human Likelihood</div>
        </div>
        <div className="rounded-lg border border-white/5 bg-white/5 py-2">
          <div className="font-mono-vs text-lg font-semibold text-white">
            {fusion?.model_agreement !== null && fusion?.model_agreement !== undefined
              ? pct(fusion.model_agreement)
              : "—"}
          </div>
          <div className="text-xs text-slate-400">Model Agreement</div>
        </div>
      </div>

      {fusion && fusion.unavailable_models.length > 0 && (
        <p className="mt-3 text-xs text-slate-500">
          Unavailable: {fusion.unavailable_models.join(", ")}
        </p>
      )}
    </div>
  );
}

export function RiskMeter({ risk }: { risk?: RiskResult }) {
  return (
    <div className={`glass-panel border p-6 ${riskBgClass(risk?.risk_level)}`}>
      <h3 className="font-mono-vs text-sm uppercase tracking-wider text-slate-400">Final Risk</h3>
      <div className="mt-2 flex items-end gap-3">
        <span className={`font-mono-vs text-5xl font-extrabold ${riskTextClass(risk?.risk_level)}`}>
          {risk?.risk_score ?? "—"}
        </span>
        <span className="pb-2 text-slate-400">/ 100</span>
      </div>
      <div className={`mt-1 text-xl font-bold ${riskTextClass(risk?.risk_level)}`}>
        {risk?.risk_level ?? "UNKNOWN"}
      </div>
      <p className="mt-3 text-xs text-slate-500">
        Policy threshold, not a scientifically calibrated probability of fraud.
      </p>
      {risk?.recommendation && (
        <div className="mt-4 rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-slate-200">
          <span className="font-semibold text-white">Recommended action: </span>
          {risk.recommendation}
        </div>
      )}
    </div>
  );
}
