"use client";

import { useEffect, useState } from "react";
import PhoneCallSimulator from "@/components/PhoneCallSimulator";
import InCallShieldHUD from "@/components/InCallShieldHUD";
import ResponseReport, { ResponseReportEntry } from "@/components/ResponseReport";
import { evaluateSimulateTurn, listSimulateScenarios } from "@/lib/api";
import { Shield, RotateCcw, Download, CheckCircle, AlertTriangle } from "lucide-react";
import clsx from "clsx";

const DEFAULT_SIMULATE_SCENARIOS = [
  {
    id: "bank_kyc_otp_fraud",
    title: "Bank KYC & Urgent Card Block Scam",
    category: "Banking Fraud / Social Engineering",
    caller_profile: {
      name: "Rajesh V. (Central Fraud Cell)",
      claimed_organization: "Demo Bank",
      claimed_branch: "Delhi",
      claimed_city: "Delhi",
      caller_id: "+91-98210-44912",
      avatar_color: "from-red-500 to-amber-600",
      voice_synthetic_likelihood: 0.86,
      voice_type: "synthetic",
      voice_pitch: 0.9,
      voice_rate: 1.05,
    },
    description: "Caller impersonates bank fraud division claiming an unauthorized transaction of Rs. 48,990 and urgently requests a 6-digit cancellation OTP to steal funds.",
    turns: [
      {
        id: "turn_1",
        caller_text: "Urgent security alert from Demo Bank Central Security. We detected an unauthorized transaction of Rs. 48,990 on your card ending in 4109 from Singapore. Did you authorize this charge?",
        options: [
          {
            label: "No, I did not authorize this! Cancel it immediately.",
            user_reply: "No, I did not authorize this! Please cancel it immediately.",
            next_turn: "turn_2a",
            compliance_type: "panicked",
          },
          {
            label: "Which branch are you calling from? What is your employee ID?",
            user_reply: "Which branch are you calling from? What is your employee ID?",
            next_turn: "turn_2b",
            compliance_type: "suspicious",
          },
          {
            label: "I will call the customer care number on the back of my card directly.",
            user_reply: "I will call the customer care number on the back of my card directly.",
            next_turn: "turn_hangup_safe",
            compliance_type: "safe",
          },
        ],
      },
      {
        id: "turn_2a",
        caller_text: "Understood sir. The transaction is in pending clearance for 3 minutes only. I have generated a cancellation code to reverse the funds. Please read out the 6-digit OTP you just received right now.",
        options: [
          {
            label: "Okay, the OTP is 849201. Please reverse it fast!",
            user_reply: "Okay, the OTP is 849201. Please reverse it fast!",
            next_turn: "turn_compromised",
            compliance_type: "compromised",
          },
          {
            label: "My bank says never share OTPs with anyone on call.",
            user_reply: "My bank app says never share OTPs with anyone on call. I am not sharing it.",
            next_turn: "turn_caller_pressure",
            compliance_type: "suspicious",
          },
          {
            label: "I am terminating this call and reporting this to 1930 Cyber Cell.",
            user_reply: "I am terminating this call and reporting this to 1930 Cyber Cell.",
            next_turn: "turn_hangup_safe",
            compliance_type: "safe",
          },
        ],
      },
      {
        id: "turn_2b",
        caller_text: "Sir, this is Central Fraud Operations in Delhi, Badge ID EMP-9921! There is no time for questions, the funds are getting permanently debited in 2 minutes! Do you want to lose 48,000 rupees? Share the cancellation OTP immediately!",
        options: [
          {
            label: "Fine, the OTP is 849201! Stop the charge!",
            user_reply: "Fine, the OTP is 849201! Stop the charge!",
            next_turn: "turn_compromised",
            compliance_type: "compromised",
          },
          {
            label: "Your branch info does not match. I am hanging up.",
            user_reply: "Your branch info does not match the bank directory. I am hanging up.",
            next_turn: "turn_hangup_safe",
            compliance_type: "safe",
          },
        ],
      },
      {
        id: "turn_caller_pressure",
        caller_text: "Sir, this is an automated cancellation code, not an OTP! If you refuse to verify it within 60 seconds, Demo Bank is not liable for your 48,000 rupee loss! Give the code now!",
        options: [
          {
            label: "I will never share an OTP. Goodbye.",
            user_reply: "I will never share an OTP. Goodbye.",
            next_turn: "turn_hangup_safe",
            compliance_type: "safe",
          },
          {
            label: "Alright fine, it is 849201.",
            user_reply: "Alright fine, it is 849201.",
            next_turn: "turn_compromised",
            compliance_type: "compromised",
          },
        ],
      },
      {
        id: "turn_compromised",
        caller_text: "Code accepted. Your card is updated. (Call disconnects abruptly — money debited).",
        options: [],
        is_terminal: true,
        outcome: "CRITICAL: Account compromised. Scammer extracted OTP to complete unauthorized transaction.",
      },
      {
        id: "turn_hangup_safe",
        caller_text: "Wait sir, do not hang up! (Call terminated by user).",
        options: [],
        is_terminal: true,
        outcome: "ATTACK BLOCKED: You successfully defended your credentials and avoided financial loss.",
      },
    ],
  },
  {
    id: "customs_police_extortion",
    title: "Customs Narcotics & Police Arrest Threat",
    category: "Law Enforcement Impersonation / Extortion",
    caller_profile: {
      name: "Inspector Vikramaditya (Crime Branch)",
      claimed_organization: "Delhi Police Crime Branch",
      claimed_branch: "IGI Airport Division",
      claimed_city: "New Delhi",
      caller_id: "+91-11-2301-8841",
      avatar_color: "from-blue-600 to-indigo-900",
      voice_synthetic_likelihood: 0.82,
      voice_type: "synthetic",
      voice_pitch: 0.85,
      voice_rate: 0.95,
    },
    description: "Caller impersonates airport customs and cyber police, claiming an intercepted parcel with illegal passports and narcotics under your Aadhaar, demanding urgent settlement.",
    turns: [
      {
        id: "turn_1",
        caller_text: "This is Inspector Vikramaditya from Crime Branch IGI Airport. Customs has confiscated a DHL parcel sent to Malaysia containing 5 forged passports and 250 grams of narcotics booked under your Aadhaar number. A non-bailable arrest warrant has been issued.",
        options: [
          {
            label: "Sir, I have never sent any parcel! My Aadhaar must have been misused!",
            user_reply: "Sir, I have never sent any parcel! My Aadhaar must have been misused!",
            next_turn: "turn_2a",
            compliance_type: "panicked",
          },
          {
            label: "I will report directly to my local police station to verify this warrant.",
            user_reply: "I will report directly to my local police station to verify this warrant.",
            next_turn: "turn_hangup_safe",
            compliance_type: "safe",
          },
        ],
      },
      {
        id: "turn_2a",
        caller_text: "If you are innocent, we can place you under virtual police custody right now on Skype. To avoid immediate detention at your residence, you must transfer a 50,000 rupee refundable RBI verification bond.",
        options: [
          {
            label: "Police never request money transfers over the phone. Hanging up now.",
            user_reply: "Police never request money transfers over the phone. Hanging up now.",
            next_turn: "turn_hangup_safe",
            compliance_type: "safe",
          },
          {
            label: "Okay, where do I send the verification deposit?",
            user_reply: "Okay, where do I send the verification deposit?",
            next_turn: "turn_compromised",
            compliance_type: "compromised",
          },
        ],
      },
      {
        id: "turn_compromised",
        caller_text: "Send the funds to this UPI handle immediately. (Extortion trap complete).",
        options: [],
        is_terminal: true,
        outcome: "CRITICAL: Extortion scam successful. Cyber-criminals extracted fraudulent bond payment.",
      },
      {
        id: "turn_hangup_safe",
        caller_text: "You cannot disconnect, you will be arrested! (Call terminated safely).",
        options: [],
        is_terminal: true,
        outcome: "ATTACK BLOCKED: Law enforcement extortion recognized and safely terminated.",
      },
    ],
  },
  {
    id: "legitimate_bank_verification",
    title: "Legitimate Bank Call (Control Case)",
    category: "Legitimate Business / Customer Care",
    caller_profile: {
      name: "Ananya (Customer Relations)",
      claimed_organization: "Demo Bank",
      claimed_branch: "Chennai",
      claimed_city: "Chennai",
      caller_id: "+91-DEMO-1000",
      avatar_color: "from-emerald-500 to-teal-700",
      voice_synthetic_likelihood: 0.08,
      voice_type: "human",
      voice_pitch: 1.05,
      voice_rate: 1.0,
    },
    description: "Legitimate call from Demo Bank confirming a requested address update without asking for credentials, OTPs, or passwords.",
    turns: [
      {
        id: "turn_1",
        caller_text: "Good afternoon. This is Ananya calling from Demo Bank Chennai Branch. We received your request yesterday to update your correspondence address on file. Please note Demo Bank customer care will never ask you for confidential account credentials. Can you confirm if you submitted this request?",
        options: [
          {
            label: "Yes, I submitted that update request yesterday.",
            user_reply: "Yes, I submitted that update request yesterday.",
            next_turn: "turn_legit_end",
            compliance_type: "normal",
          },
          {
            label: "No, I did not request that.",
            user_reply: "No, I did not request that.",
            next_turn: "turn_legit_reject",
            compliance_type: "normal",
          },
        ],
      },
      {
        id: "turn_legit_end",
        caller_text: "Thank you for confirming. Your correspondence address update is confirmed. Have a wonderful day.",
        options: [],
        is_terminal: true,
        outcome: "AUTHENTIC INTERACTION: Legitimate call completed safely. No credentials or money compromised.",
      },
      {
        id: "turn_legit_reject",
        caller_text: "We have cancelled the address change request immediately to safeguard your account. Thank you for notifying us.",
        options: [],
        is_terminal: true,
        outcome: "UNAUTHORIZED REQUEST BLOCKED: Legitimate bank agent cancelled unauthorized modification.",
      },
    ],
  },
];

function createFallbackTelemetry(activeScenario: any, currentTurn: any, userReply?: string) {
  const synthLikelihood = activeScenario?.caller_profile?.voice_synthetic_likelihood ?? 0.85;
  const isScam = activeScenario?.id !== "legitimate_bank_verification";
  const callerText = currentTurn?.caller_text?.toLowerCase() || "";
  const reply = userReply?.toLowerCase() || "";

  let riskLevel = "LOW";
  let riskScore = 15;
  let policyAction = "PROCEED_WITH_NORMAL_VERIFICATION";

  if (isScam) {
    if (callerText.includes("otp") || callerText.includes("warrant") || callerText.includes("bond") || callerText.includes("urgently")) {
      riskLevel = "CRITICAL";
      riskScore = 94;
      policyAction = "TERMINATE_CALL_IMMEDIATELY";
    } else {
      riskLevel = "HIGH";
      riskScore = 78;
      policyAction = "WARN_USER_SUSPICIOUS";
    }
  }

  const isCompromised = reply.includes("849201") || reply.includes("deposit") || reply.includes("fine, the otp");
  if (isCompromised) {
    riskScore = 99;
    riskLevel = "CRITICAL";
    policyAction = "ACCOUNT_COMPROMISED_ALERT";
  }

  return {
    risk: {
      risk_score: riskScore,
      risk_level: riskLevel,
      policy_action: policyAction,
      primary_threat: isScam ? "Urgent Social Engineering & Credential Harvesting" : "None Detected",
    },
    fusion: {
      synthetic_likelihood: synthLikelihood,
      human_likelihood: 1 - synthLikelihood,
      confidence: 0.92,
    },
    verification: {
      org_state: isScam ? "unknown" : "verified",
      branch_state: isScam ? "inconsistent" : "verified",
      caller_id_known: !isScam,
      reason: isScam
        ? "Branch location is inconsistent with registered headquarters directory."
        : "Caller profile matches registered institutional customer care line.",
    },
    guidance: isScam
      ? [
          "Do not share any one-time passcodes or authorization codes.",
          "Banks and police officers never request financial transfers or bonds over voice calls.",
          "Hang up and dial the official emergency / customer care line directly.",
        ]
      : ["Standard legitimate verification exchange. No credentials requested."],
  };
}

export default function SimulatePage() {
  const [scenarios, setScenarios] = useState<any[]>(DEFAULT_SIMULATE_SCENARIOS);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("bank_kyc_otp_fraud");
  const [callStatus, setCallStatus] = useState<"incoming" | "active" | "ended">("incoming");
  const [currentTurnId, setCurrentTurnId] = useState<string>("turn_1");
  const [turnHistory, setTurnHistory] = useState<any[]>([]);
  const [telemetry, setTelemetry] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [responseReports, setResponseReports] = useState<ResponseReportEntry[]>([]);

  // Load scenarios on mount (prefer backend if live, else keep DEFAULT_SIMULATE_SCENARIOS)
  useEffect(() => {
    listSimulateScenarios()
      .then((res) => {
        if (res.scenarios?.length) {
          setScenarios(res.scenarios);
          setSelectedScenarioId(res.scenarios[0].id);
        }
      })
      .catch(() => {
        // Fallback to local default scenarios
      });
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
      })
        .then(setTelemetry)
        .catch(() => {
          setTelemetry(createFallbackTelemetry(activeScenario, currentTurn));
        });
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
    let res: any;
    try {
      res = await evaluateSimulateTurn({
        caller_text: currentTurn.caller_text,
        user_reply: replyText,
        claimed_organization: activeScenario.caller_profile.claimed_organization,
        claimed_branch: activeScenario.caller_profile.claimed_branch,
        claimed_city: activeScenario.caller_profile.claimed_city,
        caller_id: activeScenario.caller_profile.caller_id,
        simulated_synthetic_likelihood: activeScenario.caller_profile.voice_synthetic_likelihood,
      });
    } catch {
      res = createFallbackTelemetry(activeScenario, currentTurn, replyText);
    }
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
