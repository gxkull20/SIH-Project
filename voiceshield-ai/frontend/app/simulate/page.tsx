"use client";

import { useEffect, useState } from "react";
import PhoneCallSimulator from "@/components/PhoneCallSimulator";
import InCallShieldHUD from "@/components/InCallShieldHUD";
import ResponseReport, { ResponseReportEntry } from "@/components/ResponseReport";
import { evaluateSimulateTurn, listSimulateScenarios } from "@/lib/api";
import { Shield, RotateCcw, Download, CheckCircle, AlertTriangle } from "lucide-react";
import clsx from "clsx";

export default function SimulatePage() {
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("bank_kyc_otp_fraud");
  const [callStatus, setCallStatus] = useState<"incoming" | "active" | "ended">("incoming");
  const [currentTurnId, setCurrentTurnId] = useState<string>("turn_1");
  const [turnHistory, setTurnHistory] = useState<any[]>([]);
  const [telemetry, setTelemetry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [responseReports, setResponseReports] = useState<ResponseReportEntry[]>([]);

  // Load scenarios on mount
  useEffect(() => {
    listSimulateScenarios()
      .then((res) => {
        setScenarios(res.scenarios || []);
        if (res.scenarios?.length) {
          setSelectedScenarioId(res.scenarios[0].id);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const activeScenario = scenarios.find((s) => s.id === selectedScenarioId) || scenarios[0];
  const currentTurn = activeScenario?.turns?.find((t: any) => t.id === currentTurnId) || activeScenario?.turns?.[0];

  // Evaluate screening telemetry on scenario change or turn update
  useEffect(() => {
    if (activeScenario && currentTurn) {
      evaluateSimulateTurn({
        caller_text: currentTurn.caller_text,
        claimed_organization: activeScenario.caller_profile.claimed_organization,
        claimed_branch: activeScenario.caller_profile.claimed_branch,
        claimed_city: activeScenario.caller_profile.claimed_city,
        caller_id: activeScenario.caller_profile.caller_id,
        simulated_synthetic_likelihood: activeScenario.caller_profile.voice_synthetic_likelihood,
      }).then(setTelemetry).catch((err) => console.error("Simulate evaluation error:", err));
    }
  }, [selectedScenarioId, currentTurnId, activeScenario, currentTurn]);

  function handleSelectScenario(id: string) {
    setSelectedScenarioId(id);
    setCallStatus("incoming");
    setCurrentTurnId("turn_1");
    setTurnHistory([]);
    setResponseReports([]);
  }

  function handleAcceptCall() {
    setCallStatus("active");
    setCurrentTurnId("turn_1");
    setTurnHistory([]);
    setResponseReports([]);
  }

  function handleEndCall() {
    setCallStatus("ended");
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }

  async function handleUserReply(
    replyText: string,
    nextTurnId?: string,
    complianceType: ResponseReportEntry["complianceType"] = "custom"
  ) {
    if (!activeScenario || !currentTurn) return;

    // Log this turn into history
    setTurnHistory((prev) => [
      ...prev,
      { caller_text: currentTurn.caller_text, user_reply: replyText },
    ]);

    // Live evaluate the exchange
    const res = await evaluateSimulateTurn({
      caller_text: currentTurn.caller_text,
      user_reply: replyText,
      claimed_organization: activeScenario.caller_profile.claimed_organization,
      claimed_branch: activeScenario.caller_profile.claimed_branch,
      claimed_city: activeScenario.caller_profile.claimed_city,
      caller_id: activeScenario.caller_profile.caller_id,
      simulated_synthetic_likelihood: activeScenario.caller_profile.voice_synthetic_likelihood,
    });
    setTelemetry(res);

    // Generate per-response report entry
    const now = new Date();
    const timestamp = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
    setResponseReports((prev) => [
      ...prev,
      {
        turnIndex: prev.length,
        scenarioId: selectedScenarioId,
        turnId: currentTurn.id,
        callerText: currentTurn.caller_text,
        userReply: replyText,
        complianceType,
        telemetry: res,
        timestamp,
      },
    ]);

    if (nextTurnId) {
      setCurrentTurnId(nextTurnId);
    }
  }

  if (loading || !activeScenario) {
    return <div className="text-slate-400">Loading interactive call shield…</div>;
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 font-mono-vs text-xs text-cyan-300">
          <Shield className="h-3.5 w-3.5" /> Interactive Two-Way Call Shield Simulator
        </div>
        <h1 className="mt-2 font-mono-vs text-3xl font-extrabold text-white">
          Interactive In-Call VoiceShield Co-Pilot
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Simulate real-time social-engineering and AI-voice clone attacks against a client smartphone. Watch VoiceShield's in-call co-pilot detect deepfakes and OTP extraction live.
        </p>
      </div>

      {/* Scenario Selector Tabs */}
      <div className="flex flex-wrap gap-2.5">
        {scenarios.map((sc) => {
          const isSelected = sc.id === selectedScenarioId;
          return (
            <button
              key={sc.id}
              onClick={() => handleSelectScenario(sc.id)}
              className={clsx(
                "rounded-xl border px-4 py-2.5 text-left text-xs font-semibold transition-all",
                isSelected
                  ? "border-cyan-400/80 bg-cyan-500/15 text-white shadow-lg shadow-cyan-500/10"
                  : "border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/20 hover:text-white"
              )}
            >
              <div className="font-mono-vs">{sc.title}</div>
              <div className="text-[10px] font-normal text-slate-400">{sc.category}</div>
            </button>
          );
        })}
      </div>

      {/* Main Dual-View: Left (Client Smartphone) vs Right (VoiceShield In-Call HUD) */}
      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* Left Column: Client Smartphone UI */}
        <div className="lg:col-span-5 flex justify-center">
          <PhoneCallSimulator
            scenario={activeScenario}
            currentTurn={currentTurn}
            onUserReply={(text, nextTurnId) => {
              // Determine compliance type from current turn options
              const opt = currentTurn?.options?.find((o: any) => o.user_reply === text || o.label === text);
              const complianceType: ResponseReportEntry["complianceType"] =
                opt?.compliance_type === "compromised" ? "compromised" :
                opt?.compliance_type === "suspicious" ? "suspicious" :
                opt ? "safe" : "custom";
              handleUserReply(text, nextTurnId, complianceType);
            }}
            onEndCall={handleEndCall}
            onAcceptCall={handleAcceptCall}
            callStatus={callStatus}
          />
        </div>

        {/* Right Column: Live VoiceShield Co-Pilot HUD or Post-Call Case File */}
        <div className="lg:col-span-7 space-y-4">
          {callStatus !== "ended" ? (
            <>
              <InCallShieldHUD
                telemetry={telemetry}
                callerProfile={activeScenario.caller_profile}
                callActive={callStatus === "active"}
              />
              {/* Question & Response Forensic Reports Panel */}
              <div className="rounded-2xl border border-white/10 bg-navy-950/90 p-5 backdrop-blur-xl shadow-xl">
                <ResponseReport
                  reports={responseReports}
                  activeScenarioId={selectedScenarioId}
                  currentTurn={currentTurn}
                  callerProfile={activeScenario.caller_profile}
                  currentTelemetry={telemetry}
                  onSelectOption={(text, nextTurnId) => {
                    const opt = currentTurn?.options?.find(
                      (o: any) => o.user_reply === text || o.label === text
                    );
                    const complianceType: ResponseReportEntry["complianceType"] =
                      opt?.compliance_type === "compromised" || opt?.compliance_type === "panicked"
                        ? "compromised"
                        : opt?.compliance_type === "suspicious"
                        ? "suspicious"
                        : opt
                        ? "safe"
                        : "custom";
                    handleUserReply(text, nextTurnId || opt?.next_turn, complianceType);
                  }}
                />
              </div>
            </>
          ) : (
            /* Post-Call Forensic Case File */
            <div className="space-y-6 rounded-2xl border border-white/10 bg-navy-950/90 p-6 backdrop-blur-xl shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="font-mono-vs text-lg font-bold text-white">
                    Incident Forensic Case File
                  </h3>
                  <p className="text-xs text-slate-400">
                    Session archived with {turnHistory.length + 1} dialogue exchanges.
                  </p>
                </div>
                <button
                  onClick={handleAcceptCall}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/5"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Replay Scenario
                </button>
              </div>

              {/* Final Verdict Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
                  <span className="text-xs text-slate-400">Overall Threat Classification</span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span
                      className={clsx(
                        "font-mono-vs text-2xl font-bold",
                        telemetry?.risk?.risk_level === "CRITICAL" || telemetry?.risk?.risk_level === "HIGH"
                          ? "text-red-400"
                          : telemetry?.risk?.risk_level === "MODERATE"
                          ? "text-amber-400"
                          : "text-emerald-400"
                      )}
                    >
                      {telemetry?.risk?.risk_level || "LOW"}
                    </span>
                    <span className="text-xs font-mono-vs text-slate-400">
                      ({telemetry?.risk?.risk_score ?? 0}/100)
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    {telemetry?.risk?.recommendation}
                  </p>
                </div>

                <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
                  <span className="text-xs text-slate-400">Voice Cloning Forensics</span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="font-mono-vs text-2xl font-bold text-cyan-400">
                      {Math.round((activeScenario.caller_profile.voice_synthetic_likelihood ?? 0.5) * 100)}%
                    </span>
                    <span className="text-xs text-slate-400">Synthetic Speech</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    {activeScenario.caller_profile.voice_synthetic_likelihood >= 0.7
                      ? "Corroborated by Spectrogram and WavLM acoustic signal models."
                      : "Acoustic signature consistent with genuine human vocal tract."}
                  </p>
                </div>
              </div>

              {/* Full Call Transcript History */}
              <div className="space-y-2">
                <span className="font-mono-vs text-xs font-bold uppercase tracking-wider text-slate-400">
                  Annotated Conversation Transcript
                </span>
                <div className="space-y-2 max-h-56 overflow-y-auto rounded-xl border border-white/5 bg-black/20 p-3">
                  {turnHistory.map((t, idx) => (
                    <div key={idx} className="space-y-1 text-xs">
                      <div className="text-cyan-400 font-semibold">
                        Caller: <span className="font-normal text-slate-300">{t.caller_text}</span>
                      </div>
                      <div className="text-emerald-400 font-semibold pl-4">
                        Client: <span className="font-normal text-slate-200">{t.user_reply}</span>
                      </div>
                    </div>
                  ))}
                  <div className="text-cyan-400 font-semibold text-xs">
                    Caller: <span className="font-normal text-slate-300">{currentTurn?.caller_text}</span>
                  </div>
                </div>
              </div>

              {/* Evidence Items Log */}
              <div className="space-y-2">
                <span className="font-mono-vs text-xs font-bold uppercase tracking-wider text-slate-400">
                  Forensic Evidence Trail
                </span>
                <div className="space-y-2">
                  {(telemetry?.evidence || []).map((ev: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs"
                    >
                      <span className="mt-0.5 font-mono-vs text-[10px] font-bold text-amber-400">
                        [{ev.category}]
                      </span>
                      <div>
                        <div className="font-semibold text-slate-200">{ev.title}</div>
                        <div className="text-slate-400 text-[11px] mt-0.5">{ev.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Per-Response Analysis Reports */}
              {responseReports.length > 0 && (
                <div className="border-t border-white/5 pt-4">
                  <ResponseReport
                    reports={responseReports}
                    activeScenarioId={selectedScenarioId}
                    callerProfile={activeScenario.caller_profile}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
