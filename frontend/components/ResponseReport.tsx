"use client";

import { useState } from "react";
import clsx from "clsx";
import {
  AlertTriangle,
  CheckCircle,
  ShieldAlert,
  ShieldCheck,
  Info,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  BookOpen,
  ArrowRight,
  Sparkles,
  Lock,
} from "lucide-react";
import {
  getTurnExplanation,
  OptionExplanation,
  SCENARIO_EXPLANATIONS,
} from "@/lib/simulate-explanations";

export interface ResponseReportEntry {
  turnIndex: number;
  scenarioId?: string;
  turnId?: string;
  callerText: string;
  userReply: string;
  complianceType: "safe" | "suspicious" | "compromised" | "custom" | "normal";
  telemetry: any;
  timestamp: string;
}

interface ResponseReportProps {
  reports: ResponseReportEntry[];
  activeScenarioId?: string;
  currentTurn?: any;
  callerProfile?: any;
  currentTelemetry?: any;
  onSelectOption?: (reply: string, nextTurnId?: string) => void;
}

function ComplianceBadge({
  type,
}: {
  type: ResponseReportEntry["complianceType"];
}) {
  const map: Record<string, { label: string; cls: string; Icon: any }> = {
    safe: {
      label: "SAFE DEFENSE",
      cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
      Icon: ShieldCheck,
    },
    normal: {
      label: "NORMAL SERVICE",
      cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
      Icon: ShieldCheck,
    },
    suspicious: {
      label: "SUSPICIOUS / PROBING",
      cls: "bg-amber-500/15 text-amber-300 border-amber-500/30",
      Icon: AlertTriangle,
    },
    compromised: {
      label: "COMPROMISED / HIGH VULNERABILITY",
      cls: "bg-red-500/15 text-red-300 border-red-500/30",
      Icon: ShieldAlert,
    },
    custom: {
      label: "CUSTOM INPUT",
      cls: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
      Icon: CheckCircle,
    },
  };
  const { label, cls, Icon } = map[type] || map.custom;
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono-vs text-[10px] font-bold uppercase tracking-wider",
        cls
      )}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

function RiskBar({ score, level }: { score: number; level: string }) {
  const color =
    level === "CRITICAL" || level === "HIGH"
      ? "bg-red-500"
      : level === "MODERATE"
      ? "bg-amber-500"
      : "bg-emerald-500";
  const textColor =
    level === "CRITICAL" || level === "HIGH"
      ? "text-red-400"
      : level === "MODERATE"
      ? "text-amber-400"
      : "text-emerald-400";
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-slate-400">Calculated Threat Score</span>
        <span className={clsx("font-mono-vs font-bold", textColor)}>
          {score}/100 — {level}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          className={clsx("h-full transition-all duration-500", color)}
          style={{ width: `${Math.min(100, Math.max(2, score))}%` }}
        />
      </div>
    </div>
  );
}

export default function ResponseReport({
  reports,
  activeScenarioId = "bank_kyc_otp_fraud",
  currentTurn,
  callerProfile,
  currentTelemetry,
  onSelectOption,
}: ResponseReportProps) {
  const [selectedTab, setSelectedTab] = useState<number | "current">("current");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedOptionIdx, setExpandedOptionIdx] = useState<number | null>(null);

  function copyReportText(reportId: string, text: string) {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(reportId);
      setTimeout(() => setCopiedId(null), 2000);
    }
  }

  // Active turn explanation for the pending question
  const activeTurnExp = currentTurn
    ? getTurnExplanation(activeScenarioId, currentTurn.id, currentTurn.caller_text)
    : null;

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center border-b border-white/10 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-cyan-500/20 text-cyan-400 text-xs">
              📋
            </span>
            <h3 className="font-mono-vs text-sm font-bold text-white uppercase tracking-wider">
              Question & Response Forensic Reports
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-slate-400">
            Turn-by-turn psychological analysis, threat shifts, and full plain-English explanations.
          </p>
        </div>

        {/* Turn Navigation Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {currentTurn && !currentTurn.is_terminal && (
            <button
              onClick={() => setSelectedTab("current")}
              className={clsx(
                "rounded-lg px-2.5 py-1 font-mono-vs font-bold transition-all",
                selectedTab === "current"
                  ? "border border-cyan-400/80 bg-cyan-500/20 text-cyan-300 shadow-sm"
                  : "border border-white/10 bg-white/5 text-slate-400 hover:text-white"
              )}
            >
              ⚡ Live Question Audit
            </button>
          )}

          {reports.map((_, i) => (
            <button
              key={i}
              onClick={() => setSelectedTab(i)}
              className={clsx(
                "rounded-lg px-2.5 py-1 font-mono-vs font-bold transition-all",
                selectedTab === i
                  ? "border border-cyan-400/80 bg-cyan-500/20 text-cyan-300 shadow-sm"
                  : "border border-white/10 bg-white/5 text-slate-400 hover:text-white"
              )}
            >
              Q{i + 1} Report
            </button>
          ))}
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* TAB 1: LIVE ACTIVE QUESTION FORENSIC ADVISORY (PRE-RESPONSE)       */}
      {/* ───────────────────────────────────────────────────────────────── */}
      {selectedTab === "current" && currentTurn && activeTurnExp && (
        <div className="space-y-4 rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-cyan-950/30 to-black/50 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-cyan-500/20 px-2 py-0.5 text-[10px] font-bold text-cyan-300 font-mono-vs uppercase">
                Active Question Inspection
              </span>
              <h4 className="text-sm font-bold text-white">
                {activeTurnExp.questionTitle}
              </h4>
            </div>
            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-amber-300">
              ⚡ Awaiting Your Response
            </span>
          </div>

          {/* Incoming Question / Caller Speech */}
          <div className="rounded-xl border border-cyan-500/20 bg-black/40 p-4">
            <span className="block font-mono-vs text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-1">
              Caller&apos;s Stated Claim
            </span>
            <p className="text-xs leading-relaxed text-slate-200">
              &ldquo;{currentTurn.caller_text}&rdquo;
            </p>
          </div>

          {/* Question Psychological Hook & Forensic Analysis */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5 space-y-1.5">
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-cyan-300 uppercase tracking-wider font-mono-vs">
                <Info className="h-3.5 w-3.5" /> Attack Modus Operandi
              </span>
              <div className="text-xs font-semibold text-white">
                {activeTurnExp.attackVector}
              </div>
              <p className="text-[11px] leading-relaxed text-slate-300">
                {activeTurnExp.psychologicalHook}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5 space-y-1.5">
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-red-400 uppercase tracking-wider font-mono-vs">
                <AlertTriangle className="h-3.5 w-3.5" /> Red Flags Detected
              </span>
              <ul className="space-y-1 text-[11px] text-slate-300">
                {activeTurnExp.redFlags.map((flag, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-red-400 mt-0.5">•</span>
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Pre-Response Option Strategic Guide (Full Explanation of Each Option) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-mono-vs text-xs font-bold text-white uppercase tracking-wider">
                Response Option Strategic Breakdown &amp; Explanations ({activeTurnExp.options.length})
              </span>
              <span className="text-[11px] text-slate-400">
                Click any option to inspect its full forensic impact
              </span>
            </div>

            <div className="space-y-2">
              {activeTurnExp.options.map((opt, i) => {
                const isExpanded = expandedOptionIdx === i;
                return (
                  <div
                    key={i}
                    className={clsx(
                      "rounded-xl border transition-all",
                      opt.complianceType === "compromised"
                        ? "border-red-500/30 bg-red-950/15"
                        : opt.complianceType === "suspicious"
                        ? "border-amber-500/30 bg-amber-950/15"
                        : "border-emerald-500/30 bg-emerald-950/15"
                    )}
                  >
                    <div
                      onClick={() => setExpandedOptionIdx(isExpanded ? null : i)}
                      className="flex cursor-pointer items-center justify-between p-3 hover:bg-white/5"
                    >
                      <div className="space-y-1 pr-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={clsx(
                              "rounded px-2 py-0.5 font-mono-vs text-[10px] font-bold uppercase border",
                              opt.complianceType === "compromised"
                                ? "border-red-500/40 bg-red-500/20 text-red-300"
                                : opt.complianceType === "suspicious"
                                ? "border-amber-500/40 bg-amber-500/20 text-amber-300"
                                : "border-emerald-500/40 bg-emerald-500/20 text-emerald-300"
                            )}
                          >
                            {opt.shortBadge}
                          </span>
                          <span className="text-xs font-semibold text-white">
                            &ldquo;{opt.label}&rdquo;
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {onSelectOption && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectOption(opt.label);
                            }}
                            className="hidden sm:inline-flex items-center gap-1 rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-2.5 py-1 text-[11px] font-bold text-cyan-300 hover:bg-cyan-500/20"
                          >
                            Choose This <ArrowRight className="h-3 w-3" />
                          </button>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {/* Detailed Option Explanation */}
                    {isExpanded && (
                      <div className="border-t border-white/10 bg-black/40 p-3.5 space-y-2.5 text-xs">
                        <div>
                          <span className="block font-mono-vs text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Full Forensic Explanation
                          </span>
                          <p className="mt-1 leading-relaxed text-slate-200">
                            {opt.fullExplanation}
                          </p>
                        </div>

                        <div className="grid gap-2.5 sm:grid-cols-2 pt-1 border-t border-white/5">
                          <div>
                            <span className="block text-[10px] font-semibold text-slate-400">
                              Psychological Dynamic:
                            </span>
                            <p className="text-[11px] text-slate-300">
                              {opt.psychologicalMechanism}
                            </p>
                          </div>
                          <div>
                            <span className="block text-[10px] font-semibold text-slate-400">
                              Scammer&apos;s Next Counter-Move:
                            </span>
                            <p className="text-[11px] text-slate-300">
                              {opt.attackerNextMove}
                            </p>
                          </div>
                        </div>

                        <div className="rounded-lg bg-white/5 p-2 text-[11px] text-slate-300">
                          <span className="font-semibold text-white">Regulatory Rule: </span>
                          {opt.regulatoryDirective}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* TAB 2: EXECUTED QUESTION & RESPONSE FORENSIC REPORTS                */}
      {/* ───────────────────────────────────────────────────────────────── */}
      {reports.length > 0 &&
        reports.map((report, idx) => {
          if (selectedTab !== "current" && selectedTab !== idx) return null;
          if (selectedTab === "current") return null;

          const turnNumber = idx + 1;
          const risk = report.telemetry?.risk || {};
          const evidence = report.telemetry?.evidence || [];
          const guidance = report.telemetry?.guidance || [];
          const verification = report.telemetry?.verification || {};
          const fusion = report.telemetry?.fusion || {};
          const syntheticPct = Math.round((fusion.synthetic_likelihood ?? 0.5) * 100);

          // Get rich forensic explanation for this executed turn
          const turnExp = getTurnExplanation(
            report.scenarioId || activeScenarioId,
            report.turnId || `turn_${turnNumber}`,
            report.callerText,
            report.userReply
          );

          const fullExplanationText =
            turnExp.matchedOption?.fullExplanation ||
            turnExp.customExplanation?.fullExplanation ||
            "The user response was analyzed against VoiceShield AI linguistic and OTP extraction rules.";

          const psychologicalText =
            turnExp.matchedOption?.psychologicalMechanism ||
            turnExp.customExplanation?.psychologicalMechanism ||
            "Conversational intent matched zero-trust policy thresholds.";

          const nextMoveText =
            turnExp.matchedOption?.attackerNextMove ||
            turnExp.customExplanation?.attackerNextMove ||
            "Caller will continue attempting to extract credentials.";

          const regulatoryDirective =
            turnExp.matchedOption?.regulatoryDirective ||
            turnExp.customExplanation?.regulatoryDirective ||
            "RBI guidelines mandate zero credential disclosure on unsolicited calls.";

          const reportTextContent = `VOICESHIELD AI FORENSIC REPORT - QUESTION ${turnNumber}
Timestamp: ${report.timestamp}
Question: "${report.callerText}"
Attack Vector: ${turnExp.attackVector}
Psychological Pretext: ${turnExp.psychologicalHook}
User Response: "${report.userReply}"
Classification: ${report.complianceType.toUpperCase()}
Calculated Threat Score: ${risk.risk_score ?? 0}/100 (${risk.risk_level ?? "LOW"})
Synthetic Voice Likelihood: ${syntheticPct}%
Forensic Explanation: ${fullExplanationText}
Regulatory Recommendation: ${regulatoryDirective}`;

          return (
            <div
              key={report.turnIndex}
              className={clsx(
                "rounded-2xl border p-5 space-y-4 shadow-xl backdrop-blur-md transition-all",
                report.complianceType === "compromised"
                  ? "border-red-500/40 bg-gradient-to-b from-red-950/20 via-black to-red-950/10"
                  : report.complianceType === "suspicious"
                  ? "border-amber-500/40 bg-gradient-to-b from-amber-950/20 via-black to-amber-950/10"
                  : "border-emerald-500/40 bg-gradient-to-b from-emerald-950/20 via-black to-emerald-950/10"
              )}
            >
              {/* Report Header */}
              <div className="flex items-center justify-between flex-wrap gap-2 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 font-mono-vs text-xs font-bold">
                    Q{turnNumber}
                  </span>
                  <div>
                    <h4 className="font-mono-vs text-sm font-bold text-white">
                      Forensic Audit Report · Question {turnNumber}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono-vs">
                      {turnExp.questionTitle}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <ComplianceBadge type={report.complianceType} />
                  <span className="font-mono-vs text-[10px] text-slate-400">
                    {report.timestamp}
                  </span>
                  <button
                    onClick={() => copyReportText(`q-${turnNumber}`, reportTextContent)}
                    className="flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-mono-vs text-slate-300 hover:bg-white/10"
                    title="Copy this turn report"
                  >
                    {copiedId === `q-${turnNumber}` ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" /> Copy Report
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 1. Question (Caller Speech) Analysis */}
              <div className="rounded-xl border border-cyan-500/20 bg-black/40 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono-vs text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                    Question Asked By Caller
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono-vs">
                    Attack Vector: {turnExp.attackVector}
                  </span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed italic">
                  &ldquo;{report.callerText}&rdquo;
                </p>
                <p className="text-[11px] text-slate-400 leading-relaxed pt-1 border-t border-white/5">
                  <strong className="text-cyan-300">Psychological Pretext:</strong>{" "}
                  {turnExp.psychologicalHook}
                </p>
              </div>

              {/* 2. User Response & Full Explanation */}
              <div
                className={clsx(
                  "rounded-xl border p-4 space-y-3",
                  report.complianceType === "compromised"
                    ? "border-red-500/30 bg-red-950/20"
                    : report.complianceType === "suspicious"
                    ? "border-amber-500/30 bg-amber-950/20"
                    : "border-emerald-500/30 bg-emerald-950/20"
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={clsx(
                      "font-mono-vs text-[10px] font-bold uppercase tracking-wider",
                      report.complianceType === "compromised"
                        ? "text-red-400"
                        : report.complianceType === "suspicious"
                        ? "text-amber-400"
                        : "text-emerald-400"
                    )}
                  >
                    Your Response Given
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono-vs">
                    Evaluation Result
                  </span>
                </div>

                <p className="text-xs font-medium text-white leading-relaxed">
                  &ldquo;{report.userReply}&rdquo;
                </p>

                {/* The Full Forensic Explanation */}
                <div className="rounded-lg bg-black/40 border border-white/10 p-3 space-y-2">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-cyan-300 uppercase tracking-wider font-mono-vs">
                    <Sparkles className="h-3.5 w-3.5" /> Full Forensic Explanation
                  </span>
                  <p className="text-xs leading-relaxed text-slate-200">
                    {fullExplanationText}
                  </p>

                  <div className="grid gap-2 sm:grid-cols-2 pt-2 border-t border-white/5 text-[11px]">
                    <div>
                      <strong className="text-slate-400">Psychological Dynamic: </strong>
                      <span className="text-slate-300">{psychologicalText}</span>
                    </div>
                    <div>
                      <strong className="text-slate-400">Attacker&apos;s Next Counter-Move: </strong>
                      <span className="text-slate-300">{nextMoveText}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Real-time Threat Score & Telemetry Grid */}
              <div className="space-y-2">
                <RiskBar score={risk.risk_score ?? 0} level={risk.risk_level ?? "LOW"} />

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-lg bg-black/30 border border-white/5 p-2">
                    <span className="block text-[9px] text-slate-400 font-mono-vs">
                      Voice Forensics
                    </span>
                    <span
                      className={clsx(
                        "font-mono-vs text-sm font-bold",
                        syntheticPct >= 60
                          ? "text-red-400"
                          : syntheticPct >= 40
                          ? "text-amber-400"
                          : "text-emerald-400"
                      )}
                    >
                      {syntheticPct}% Synthetic
                    </span>
                  </div>

                  <div className="rounded-lg bg-black/30 border border-white/5 p-2">
                    <span className="block text-[9px] text-slate-400 font-mono-vs">
                      Organization Claim
                    </span>
                    <span
                      className={clsx(
                        "font-mono-vs text-xs font-bold capitalize",
                        verification.organization?.state === "verified"
                          ? "text-emerald-400"
                          : "text-amber-400"
                      )}
                    >
                      {verification.organization?.state || "Unknown"}
                    </span>
                  </div>

                  <div className="rounded-lg bg-black/30 border border-white/5 p-2">
                    <span className="block text-[9px] text-slate-400 font-mono-vs">
                      Branch Jurisdiction
                    </span>
                    <span
                      className={clsx(
                        "font-mono-vs text-xs font-bold capitalize",
                        verification.branch?.state === "verified"
                          ? "text-emerald-400"
                          : verification.branch?.state === "inconsistent"
                          ? "text-red-400"
                          : "text-amber-400"
                      )}
                    >
                      {verification.branch?.state || "Unknown"}
                    </span>
                  </div>
                </div>
              </div>

              {/* 4. Corroborating Evidence Fired on This Turn */}
              {evidence.length > 0 && (
                <div className="space-y-1.5">
                  <span className="font-mono-vs text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Corroborating Evidence Items ({evidence.length})
                  </span>
                  <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                    {evidence.map((ev: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 rounded-lg border border-white/5 bg-black/30 p-2 text-xs"
                      >
                        <span
                          className={clsx(
                            "mt-0.5 font-mono-vs text-[9px] font-bold uppercase shrink-0",
                            ev.severity === "critical" || ev.severity === "high"
                              ? "text-red-400"
                              : ev.severity === "medium"
                              ? "text-amber-400"
                              : "text-slate-400"
                          )}
                        >
                          [{ev.category}]
                        </span>
                        <div>
                          <div className="font-semibold text-slate-200 text-[11px]">
                            {ev.title}
                          </div>
                          <div className="text-slate-400 text-[10px] leading-relaxed">
                            {ev.description}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. Regulatory Directive & Recommendation */}
              <div className="rounded-xl border border-white/10 bg-black/50 p-3 text-xs">
                <span className="font-bold text-white uppercase tracking-wider font-mono-vs">
                  Regulatory Directive (RBI / 1930 Cyber Cell):{" "}
                </span>
                <span className="text-slate-300">{regulatoryDirective}</span>
              </div>
            </div>
          );
        })}

      {/* Summary Accordion List of All Prior Questions */}
      {reports.length > 1 && (
        <div className="rounded-xl border border-white/10 bg-black/30 p-4 space-y-2">
          <span className="font-mono-vs text-xs font-bold text-white uppercase tracking-wider">
            All Question Reports ({reports.length})
          </span>
          <div className="divide-y divide-white/5">
            {reports.map((rep, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedTab(idx)}
                className="flex cursor-pointer items-center justify-between py-2 hover:text-cyan-300 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono-vs text-[10px] font-bold text-slate-500">
                    Q{idx + 1}
                  </span>
                  <span className="text-xs text-slate-300 line-clamp-1 max-w-xs sm:max-w-md">
                    {rep.callerText}
                  </span>
                </div>
                <ComplianceBadge type={rep.complianceType} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}