"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Phone, PhoneCall, PhoneForwarded, PhoneOff, Shield, Volume2, VolumeX } from "lucide-react";
import clsx from "clsx";

interface PhoneCallSimulatorProps {
  scenario: any;
  currentTurn: any;
  onUserReply: (replyText: string, nextTurnId?: string) => void;
  onEndCall: () => void;
  onAcceptCall: () => void;
  callStatus: "incoming" | "active" | "ended";
}

export default function PhoneCallSimulator({
  scenario,
  currentTurn,
  onUserReply,
  onEndCall,
  onAcceptCall,
  callStatus,
}: PhoneCallSimulatorProps) {
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [customReply, setCustomReply] = useState("");
  const [speechSpeaking, setSpeechSpeaking] = useState(false);
  const [showExplanations, setShowExplanations] = useState(true);

  const caller = scenario.caller_profile;

  // Live in-call timer
  useEffect(() => {
    let interval: any;
    if (callStatus === "active") {
      interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else {
      setSeconds(0);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  // Web Speech Synthesis for the caller's dialogue
  useEffect(() => {
    if (callStatus === "active" && currentTurn?.caller_text && !muted) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel(); // Stop any pending speech
        const utterance = new SpeechSynthesisUtterance(currentTurn.caller_text);
        utterance.rate = caller.voice_rate || 1.0;
        utterance.pitch = caller.voice_pitch || 1.0;

        utterance.onstart = () => setSpeechSpeaking(true);
        utterance.onend = () => setSpeechSpeaking(false);
        utterance.onerror = () => setSpeechSpeaking(false);

        window.speechSynthesis.speak(utterance);
      }
    } else {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        setSpeechSpeaking(false);
      }
    }
  }, [callStatus, currentTurn, muted, caller]);

  function formatTime(s: number) {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  function handleCustomSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!customReply.trim()) return;
    onUserReply(customReply.trim());
    setCustomReply("");
  }

  return (
    <div className="relative mx-auto flex h-[550px] w-full max-w-[340px] flex-col overflow-hidden rounded-[36px] border-[5px] border-slate-700 bg-slate-950 p-4 shadow-2xl shadow-cyan-500/10">
      {/* Smartphone Notch & Status Bar */}
      <div className="relative z-10 flex items-center justify-between px-2 text-[11px] font-medium text-slate-400">
        <span>9:41</span>
        <div className="h-3.5 w-16 rounded-full bg-slate-800" />
        <div className="flex items-center gap-1.5">
          <span>5G</span>
          <div className="h-2.5 w-4 rounded-sm border border-slate-400 p-0.5">
            <div className="h-full w-full bg-slate-400" />
          </div>
        </div>
      </div>

      {/* Screen Content */}
      {callStatus === "incoming" && (
        <div className="flex flex-1 flex-col items-center justify-between py-4 text-center">
          <div className="space-y-2 mt-2">
            <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
              <div className="absolute inset-0 animate-ping rounded-full bg-cyan-500/20" />
              <div
                className={clsx(
                  "relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr text-2xl font-bold text-white shadow-xl",
                  caller.avatar_color || "from-slate-700 to-slate-800"
                )}
              >
                {caller.name.charAt(0)}
              </div>
            </div>

            <div>
              <h3 className="font-mono-vs text-base font-bold text-white">{caller.name}</h3>
              <p className="text-xs font-medium text-slate-400">{caller.claimed_organization}</p>
              <p className="text-[11px] text-slate-500">{caller.caller_id}</p>
            </div>
            <div className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 px-3 py-0.5 font-mono-vs text-[10px] text-cyan-300">
              <Shield className="h-3 w-3" /> VoiceShield Protected
            </div>
          </div>

          <div className="w-full space-y-3 pb-2">
            <div className="text-[11px] font-mono-vs text-cyan-300 animate-pulse bg-cyan-500/10 py-1 px-3 rounded-full inline-block">
              Incoming Call • Click to Answer
            </div>
            {/* Accept / Decline Buttons */}
            <div className="flex w-full justify-around items-center px-4">
              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={onEndCall}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition hover:scale-105 active:scale-95"
                  title="Decline Call"
                >
                  <PhoneOff className="h-5 w-5" />
                </button>
                <span className="text-[10px] font-mono-vs text-slate-400">Decline</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={onAcceptCall}
                  className="flex h-14 w-14 animate-bounce items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 transition hover:scale-105 active:scale-95 ring-4 ring-emerald-500/30"
                  title="Answer Call"
                >
                  <Phone className="h-6 w-6" />
                </button>
                <span className="text-[10px] font-mono-vs font-bold text-emerald-400">Answer Call</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {callStatus === "active" && (
        <div className="flex flex-1 flex-col justify-between pt-3">
          {/* Active Call Header */}
          <div className="border-b border-white/10 pb-3 text-center">
            <div className="flex items-center justify-between px-2">
              <button
                onClick={() => setMuted(!muted)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
                title={muted ? "Unmute Caller Speech" : "Mute Caller Speech"}
              >
                {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 text-cyan-400" />}
              </button>
              <span className="font-mono-vs text-xs font-semibold text-emerald-400">
                {formatTime(seconds)}
              </span>
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                <span className="text-[10px] text-slate-400">LIVE</span>
              </div>
            </div>

            <h4 className="mt-1 font-mono-vs text-sm font-bold text-white">{caller.name}</h4>
            <p className="text-[11px] text-slate-400">{caller.claimed_organization} ({caller.claimed_branch})</p>

            {/* Simulated Audio Waveform Bar */}
            <div className="mt-2 flex h-5 items-center justify-center gap-1">
              {[4, 8, 14, 20, 12, 18, 9, 5].map((h, i) => (
                <div
                  key={i}
                  className={clsx(
                    "w-1 rounded-full transition-all duration-150",
                    speechSpeaking ? "bg-cyan-400 animate-pulse" : "bg-slate-700"
                  )}
                  style={{ height: speechSpeaking ? `${h}px` : "4px" }}
                />
              ))}
            </div>
          </div>

          {/* Dialogue Transcript Stream */}
          <div className="my-2 flex-1 overflow-y-auto space-y-2.5 pr-1">
            {/* Caller speech bubble */}
            <div className="rounded-2xl rounded-tl-none border border-cyan-500/20 bg-cyan-950/30 p-3 text-xs leading-relaxed text-slate-200">
              <span className="block font-mono-vs text-[10px] font-bold text-cyan-400 mb-0.5">
                {caller.name}:
              </span>
              {currentTurn?.caller_text}
            </div>

            {currentTurn?.outcome && (
              <div
                className={clsx(
                  "rounded-xl border p-2.5 text-center text-xs font-semibold",
                  currentTurn.outcome.startsWith("CRITICAL")
                    ? "border-red-500/40 bg-red-500/20 text-red-300"
                    : "border-emerald-500/40 bg-emerald-500/20 text-emerald-300"
                )}
              >
                {currentTurn.outcome}
              </div>
            )}
          </div>

            {/* Interactive User Replies */}
            <div className="space-y-2 border-t border-white/10 pt-2">
              {!currentTurn?.is_terminal ? (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Select Your Response:
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowExplanations(!showExplanations)}
                      className="text-[9px] font-mono-vs text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      💡 {showExplanations ? "Hide Explanations" : "Show Explanations"}
                    </button>
                  </div>

                  {(currentTurn?.options || []).map((opt: any, i: number) => {
                    const isCompromised = opt.compliance_type === "compromised" || opt.compliance_type === "panicked";
                    const isSuspicious = opt.compliance_type === "suspicious";
                    const isSafe = opt.compliance_type === "safe" || opt.compliance_type === "normal";

                    const badgeText = isCompromised
                      ? "🚨 High Vulnerability · Panicked"
                      : isSuspicious
                      ? "⚠️ Probing · Identity Challenge"
                      : "✅ Safe Defense · Zero-Trust";

                    const explanationPreview = isCompromised
                      ? "Falling into urgency trap primes you for immediate credential/OTP extraction."
                      : isSuspicious
                      ? "Stalls the scammer, but attacker will fabricate credentials or escalate pressure."
                      : "Terminates inbound threat and enforces official out-of-band verification.";

                    return (
                      <button
                        key={i}
                        onClick={() => onUserReply(opt.user_reply, opt.next_turn)}
                        className={clsx(
                          "w-full rounded-xl border p-2 text-left transition active:scale-[0.98]",
                          isCompromised
                            ? "border-red-500/30 bg-red-500/10 text-red-200 hover:bg-red-500/20"
                            : isSuspicious
                            ? "border-amber-500/30 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20"
                            : "border-emerald-500/30 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20"
                        )}
                      >
                        <div className="text-xs font-medium">{opt.label}</div>
                        {showExplanations && (
                          <div className="mt-1 pt-1 border-t border-white/5 flex flex-col gap-0.5">
                            <span className="text-[9px] font-mono-vs font-bold uppercase tracking-wider opacity-90">
                              {badgeText}
                            </span>
                            <span className="text-[10px] text-slate-300/90 leading-tight">
                              {explanationPreview}
                            </span>
                          </div>
                        )}
                      </button>
                    );
                  })}

                {/* Custom text input */}
                <form onSubmit={handleCustomSubmit} className="flex gap-1.5 pt-1">
                  <input
                    className="flex-1 rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 text-xs text-white placeholder:text-slate-500"
                    placeholder="Type custom response..."
                    value={customReply}
                    onChange={(e) => setCustomReply(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-cyan-accent px-3 text-xs font-semibold text-navy-950"
                  >
                    Reply
                  </button>
                </form>
              </div>
            ) : (
              <div className="text-center py-2">
                <button
                  onClick={onEndCall}
                  className="rounded-xl bg-cyan-accent px-4 py-2 font-mono-vs text-xs font-bold text-navy-950 hover:brightness-110"
                >
                  View Forensic Case File
                </button>
              </div>
            )}

            {/* In-Call Controls Bar */}
            <div className="flex items-center justify-center gap-6 pt-1">
              <button
                onClick={onEndCall}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-red-600 text-white shadow-md transition hover:scale-105 active:scale-95"
                title="Hang Up / Terminate Call"
              >
                <PhoneOff className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {callStatus === "ended" && (
        <div className="flex flex-1 flex-col items-center justify-center text-center p-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-800 text-slate-400">
            <PhoneOff className="h-8 w-8" />
          </div>
          <h4 className="mt-4 font-mono-vs text-base font-bold text-white">Call Terminated</h4>
          <p className="mt-1 text-xs text-slate-400">Session archived with complete evidence trail.</p>
          <button
            onClick={onAcceptCall}
            className="mt-6 rounded-xl bg-cyan-accent px-4 py-2 text-xs font-bold text-navy-950"
          >
            Restart Call
          </button>
        </div>
      )}
    </div>
  );
}
