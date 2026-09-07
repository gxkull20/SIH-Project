"use client";

import { useRef, useState, useEffect } from "react";
import { pct } from "@/lib/risk-style";
import { riskTextClass } from "@/lib/risk-style";
import type { RiskResult, FusionResult } from "@/types/api";
import clsx from "clsx";
import { BookOpen, ChevronDown, ChevronUp, Cpu, Info, Shield, ShieldAlert, Sparkles } from "lucide-react";

// ─── Workable Demo scenarios with full model forensic stages ──────────────────
const DEMO_SCENARIOS = {
  suspicious: {
    key: "suspicious",
    title: "Suspicious Impersonation Call",
    subtitle: "Urgent Unauthorized Transaction Alert",
    expected_risk: "HIGH",
    risk_score: 78,
    synthetic_score: 86,
    verdict: "Deepfake Voice Detected",
    verdict_color: "text-red-400",
    risk_color: "text-red-400",
    stages: [
      {
        id: "preprocessing",
        label: "Audio Preprocessing",
        icon: "🎙️",
        color: "text-cyan-400",
        borderColor: "border-cyan-500/40",
        bgColor: "bg-cyan-500/10",
        explanation:
          "The raw audio stream is resampled to 16 kHz mono PCM, normalised and denoised. Duration, channel count and codec are validated before entering the pipeline.",
        detail: "Sample rate: 16 kHz · Channels: 1 (mono) · Bit depth: 16-bit PCM",
      },
      {
        id: "segmentation",
        label: "Voice Segmentation",
        icon: "✂️",
        color: "text-blue-400",
        borderColor: "border-blue-500/40",
        bgColor: "bg-blue-500/10",
        explanation:
          "The audio is sliced into overlapping 3-second windows. Each segment is independently scored so real-time changes (e.g. voice-cloning switching on mid-call) are instantly flagged.",
        detail: "Window: 3 s · Overlap: 0.5 s · Segments in demo: 4",
      },
      {
        id: "spectrogram",
        label: "Spectrogram CNN Detector",
        icon: "📊",
        color: "text-purple-400",
        borderColor: "border-purple-500/40",
        bgColor: "bg-purple-500/10",
        explanation:
          "A Mel-spectrogram of the segment (80 bands, hop 512) is fed into a lightweight ResNet-18 CNN. It detects artefacts introduced by neural vocoders (GAN ringing, spectral smearing).",
        detail: "Architecture: ResNet-18 · Input: 80×128 Mel · Output: synthetic probability",
        syntheticLikelihood: 0.85,
      },
      {
        id: "wavlm",
        label: "WavLM Transformer Detector",
        icon: "🤖",
        color: "text-indigo-400",
        borderColor: "border-indigo-500/40",
        bgColor: "bg-indigo-500/10",
        explanation:
          "Microsoft WavLM-Base+ self-supervised representations are extracted and passed through a 2-layer MLP classifier. WavLM captures subtle phoneme-level inconsistencies missed by spectrograms.",
        detail: "Backbone: WavLM-Base+ · Features: 768-d · Output: deepfake score",
        syntheticLikelihood: 0.91,
      },
      {
        id: "prosody",
        label: "Prosody Anomaly Analyser",
        icon: "📈",
        color: "text-teal-400",
        borderColor: "border-teal-500/40",
        bgColor: "bg-teal-500/10",
        explanation:
          "F0 (pitch) trajectory, RMS energy envelope, and speech rate are extracted using librosa pyin. Unnaturally flat pitch or robotic energy patterns are strong deepfake indicators.",
        detail: "Features: F0 + RMS + speech-rate · Method: pyin + rule heuristics",
        syntheticLikelihood: 0.82,
      },
      {
        id: "fusion",
        label: "Weighted Fusion Engine",
        icon: "⚖️",
        color: "text-amber-400",
        borderColor: "border-amber-500/40",
        bgColor: "bg-amber-500/10",
        explanation:
          "Scores from all three detectors are combined using a weighted average (WavLM: 45%, Spectrogram: 35%, Prosody: 20%). Model agreement and confidence are also computed.",
        detail: "Fused score: 0.86 · Model agreement: 0.88 · All 3 detectors aligned",
        syntheticLikelihood: 0.86,
      },
      {
        id: "risk",
        label: "Policy Risk Engine",
        icon: "🛡️",
        color: "text-red-400",
        borderColor: "border-red-500/40",
        bgColor: "bg-red-500/10",
        explanation:
          "The fused deepfake score is combined with OTP-extraction pattern detection, conversation risk, and caller verification state to produce a holistic fraud risk score (0–100).",
        detail: "Risk score: 78/100 · Level: HIGH · Recommendation: Terminate call immediately",
        riskScore: 78,
        riskLevel: "HIGH",
      },
      {
        id: "explanation",
        label: "Evidence & Explanation",
        icon: "📋",
        color: "text-emerald-400",
        borderColor: "border-emerald-500/40",
        bgColor: "bg-emerald-500/10",
        explanation:
          "The Explanation Engine generates human-readable evidence items ranked by severity. Each item links to the specific detector or policy rule that fired, giving a full audit trail.",
        detail: "Evidence items: 5 · Top: Synthetic voice signal (HIGH) · Verified: Org ✓ Branch ✗",
      },
    ],
    evidence: [
      { category: "VOICE", severity: "high", title: "Synthetic Speech Detected", description: "All 3 voice analysis models agree — 86% synthetic likelihood. WavLM transformer model reports 91% confidence of neural vocoder artefacts." },
      { category: "VOICE", severity: "medium", title: "Flat Pitch Trajectory", description: "F0 variance is 4× below natural speech baseline. Neural TTS systems commonly produce unnaturally flat prosody." },
      { category: "IDENTITY", severity: "high", title: "Branch Record Inconsistency", description: "Caller claims Delhi branch but registry shows Demo Bank has branches only in Chennai and Coimbatore." },
      { category: "CONVERSATION", severity: "high", title: "OTP Solicitation Pattern", description: "Conversation analysis detected high-pressure credential-extraction language pattern in caller transcript requesting a 6-digit OTP." },
      { category: "POLICY", severity: "low", title: "Unverified Caller ID", description: "Phone number +91-98210-44912 is not listed in the verified caller registry for Demo Bank." },
    ],
    recommendation: "🚨 Recommended Action: Terminate this call immediately. Do NOT share any OTP, PIN, or account details. Call your bank directly using the number on the back of your card.",
  },
  legitimate: {
    key: "legitimate",
    title: "Legitimate Bank Call",
    subtitle: "Customer Care Address Update (Control Case)",
    expected_risk: "LOW",
    risk_score: 10,
    synthetic_score: 9,
    verdict: "Authentic Human Voice",
    verdict_color: "text-emerald-400",
    risk_color: "text-emerald-400",
    stages: [
      {
        id: "preprocessing",
        label: "Audio Preprocessing",
        icon: "🎙️",
        color: "text-cyan-400",
        borderColor: "border-cyan-500/40",
        bgColor: "bg-cyan-500/10",
        explanation:
          "The raw audio stream is resampled to 16 kHz mono PCM, normalised and denoised. Duration, channel count and codec are validated before entering the pipeline.",
        detail: "Sample rate: 16 kHz · Channels: 1 (mono) · Bit depth: 16-bit PCM",
      },
      {
        id: "segmentation",
        label: "Voice Segmentation",
        icon: "✂️",
        color: "text-blue-400",
        borderColor: "border-blue-500/40",
        bgColor: "bg-blue-500/10",
        explanation:
          "The audio is sliced into overlapping 3-second windows for independent evaluation without temporal bias.",
        detail: "Window: 3 s · Overlap: 0.5 s · Segments in demo: 2",
      },
      {
        id: "spectrogram",
        label: "Spectrogram CNN Detector",
        icon: "📊",
        color: "text-purple-400",
        borderColor: "border-purple-500/40",
        bgColor: "bg-purple-500/10",
        explanation:
          "Spectrogram features show natural vocal tract resonances and harmonic formant continuity across telephony frequencies.",
        detail: "Architecture: ResNet-18 · Continuous frequency harmonics · No GAN ringing",
        syntheticLikelihood: 0.10,
      },
      {
        id: "wavlm",
        label: "WavLM Transformer Detector",
        icon: "🤖",
        color: "text-indigo-400",
        borderColor: "border-indigo-500/40",
        bgColor: "bg-indigo-500/10",
        explanation:
          "WavLM-Base+ transformer embeddings confirm natural phoneme-level dynamics and genuine human vocal articulation.",
        detail: "Backbone: WavLM-Base+ · Human confidence: 92% · Zero vocoder traces",
        syntheticLikelihood: 0.08,
      },
      {
        id: "prosody",
        label: "Prosody Anomaly Analyser",
        icon: "📈",
        color: "text-teal-400",
        borderColor: "border-teal-500/40",
        bgColor: "bg-teal-500/10",
        explanation:
          "F0 pitch trajectory exhibits natural human emotional inflection and dynamic variance well above synthetic thresholds.",
        detail: "Features: F0 variance within normal human range · Natural pauses",
        syntheticLikelihood: 0.09,
      },
      {
        id: "fusion",
        label: "Weighted Fusion Engine",
        icon: "⚖️",
        color: "text-amber-400",
        borderColor: "border-amber-500/40",
        bgColor: "bg-amber-500/10",
        explanation:
          "All three models unanimously agree with 94% agreement on genuine human speech.",
        detail: "Fused score: 0.09 · Model agreement: 0.94 · Authenticity confirmed",
        syntheticLikelihood: 0.09,
      },
      {
        id: "risk",
        label: "Policy Risk Engine",
        icon: "🛡️",
        color: "text-emerald-400",
        borderColor: "border-emerald-500/40",
        bgColor: "bg-emerald-500/10",
        explanation:
          "Human voice + verified branch location + standard customer confirmation protocol = LOW RISK.",
        detail: "Risk score: 10/100 · Level: LOW · Safe legitimate transaction",
        riskScore: 10,
        riskLevel: "LOW",
      },
      {
        id: "explanation",
        label: "Evidence & Explanation",
        icon: "📋",
        color: "text-emerald-400",
        borderColor: "border-emerald-500/40",
        bgColor: "bg-emerald-500/10",
        explanation:
          "Audit trail verifies that caller adhered to banking safety policies without requesting confidential secrets.",
        detail: "4 evidence items: Genuine human voice, verified org, verified branch",
      },
    ],
    evidence: [
      { category: "VOICE", severity: "info", title: "Voice Signal Consistent With Human Speech", description: "Fused voice models estimate only 9% synthetic likelihood. Natural pitch transitions and harmonic resonance verified." },
      { category: "IDENTITY", severity: "info", title: "Organization Verified", description: "Claimed organization 'Demo Bank' is verified in directory registry." },
      { category: "IDENTITY", severity: "info", title: "Branch Location Verified", description: "Chennai branch matches official Demo Bank operational records." },
      { category: "POLICY", severity: "info", title: "Zero Credential Solicitation", description: "Caller adhered to banking security rules without asking for OTPs, PINs, or sensitive information." },
    ],
    recommendation: "✅ Safe Call: No suspicious behavior detected. The caller followed legitimate customer service protocol without requesting any secrets.",
  },
};

// ─── Animated wave bars ───────────────────────────────────────────────────────
function WaveBars({ active, danger }: { active: boolean; danger?: boolean }) {
  const heights = [4, 12, 20, 28, 18, 24, 14, 8, 20, 16, 26, 10];
  return (
    <div className="flex items-center gap-0.5 h-8">
      {heights.map((h, i) => (
        <div
          key={i}
          className={clsx(
            "w-1 rounded-full transition-all",
            active
              ? danger
                ? "bg-red-400 animate-pulse"
                : "bg-cyan-400 animate-pulse"
              : "bg-slate-700"
          )}
          style={{
            height: active ? `${h}px` : "4px",
            animationDelay: `${i * 60}ms`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Single pipeline stage card ───────────────────────────────────────────────
function StageCard({ stage, active, done, progress }: {
  stage: typeof DEMO_SCENARIOS.suspicious.stages[0];
  active: boolean;
  done: boolean;
  progress: number;
}) {
  return (
    <div className={clsx(
      "rounded-2xl border p-4 transition-all duration-500 text-xs",
      done
        ? clsx("border-emerald-500/30 bg-emerald-500/5", stage.bgColor.replace("10", "5"))
        : active
        ? clsx(stage.borderColor, stage.bgColor, "shadow-lg")
        : "border-white/5 bg-white/[0.01] opacity-40"
    )}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-base">{stage.icon}</span>
        <span className={clsx("font-mono-vs font-bold text-[11px] uppercase tracking-wider", active || done ? stage.color : "text-slate-500")}>
          {stage.label}
        </span>
        {done && <span className="ml-auto text-emerald-400 text-[10px] font-mono-vs font-bold">✓ DONE</span>}
        {active && <span className="ml-auto text-[10px] font-mono-vs font-bold animate-pulse text-amber-400">RUNNING…</span>}
      </div>

      {active && (
        <div className="h-1 w-full rounded-full bg-slate-800 mb-2 overflow-hidden">
          <div
            className={clsx("h-full rounded-full transition-all duration-200", stage.color.replace("text-", "bg-"))}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {(active || done) && (
        <>
          <p className="text-slate-300 leading-relaxed mb-2">{stage.explanation}</p>
          <div className="rounded-lg bg-black/30 border border-white/5 px-2.5 py-1.5 font-mono-vs text-[10px] text-slate-400">
            {stage.detail}
          </div>
          {stage.syntheticLikelihood !== undefined && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-slate-500 text-[10px]">Synthetic likelihood:</span>
              <span className={clsx(
                "font-mono-vs font-bold text-sm",
                stage.syntheticLikelihood >= 0.7 ? "text-red-400" : "text-amber-400"
              )}>
                {Math.round(stage.syntheticLikelihood * 100)}%
              </span>
              <div className="flex-1 h-1 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={stage.syntheticLikelihood >= 0.7 ? "h-full bg-red-500 rounded-full" : "h-full bg-amber-500 rounded-full"}
                  style={{ width: `${Math.round(stage.syntheticLikelihood * 100)}%` }}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function LiveDetectionPanel() {
  const [mode, setMode] = useState<"idle" | "live" | "demo">("idle");
  const [demoScenarioKey, setDemoScenarioKey] = useState<"suspicious" | "legitimate">("suspicious");
  const [demoStageIdx, setDemoStageIdx] = useState(-1);
  const [demoProgress, setDemoProgress] = useState(0);
  const [demoDone, setDemoDone] = useState(false);

  // Real live detection state
  const [listening, setListening] = useState(false);
  const [showRiskFormula, setShowRiskFormula] = useState(true);
  const [fusion, setFusion] = useState<FusionResult | null>(null);
  const [risk, setRisk] = useState<RiskResult | null>(null);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [isSilence, setIsSilence] = useState(false);
  const [silenceMessage, setSilenceMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [segmentCount, setSegmentCount] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<any>(null);

  const currentScenario = DEMO_SCENARIOS[demoScenarioKey];

  // ── Demo mode runner ──
  useEffect(() => {
    if (mode !== "demo") return;
    setDemoStageIdx(0);
    setDemoDone(false);
    setDemoProgress(0);

    let stage = 0;
    let prog = 0;
    const stages = DEMO_SCENARIOS[demoScenarioKey].stages;

    const tick = () => {
      prog += 10;
      setDemoProgress(prog);
      if (prog >= 100) {
        prog = 0;
        stage += 1;
        if (stage >= stages.length) {
          setDemoStageIdx(stages.length);
          setDemoDone(true);
          clearInterval(timerRef.current);
          return;
        }
        setDemoStageIdx(stage);
        setDemoProgress(0);
      } else {
        setDemoProgress(prog);
      }
    };

    timerRef.current = setInterval(tick, 100);
    return () => clearInterval(timerRef.current);
  }, [mode, demoScenarioKey]);

  // ── Real live detection ──
  async function startLive() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
      const backendWsHost = window.location.port === "3000" || window.location.port === "3001"
        ? `${window.location.hostname}:8000`
        : window.location.host;
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || `${wsProtocol}://${backendWsHost}/api/live/stream`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      ws.onmessage = (e) => {
        const msg = JSON.parse(e.data);
        if (msg.type === "segment_result") {
          setIsSilence(Boolean(msg.is_silence));
          setSilenceMessage(msg.message || null);
          setFusion(msg.fusion);
          setRisk(msg.risk);
          if (msg.predictions && msg.predictions.length > 0) {
            setPredictions(msg.predictions);
          }
          setSegmentCount((c) => c + 1);
        } else if (msg.type === "error") {
          setError(msg.message);
        }
      };
      ws.onerror = () => setError("Live connection failed.");
      ws.onopen = () => {
        const audioCtx = new AudioContext({ sampleRate: 16000 });
        audioCtxRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const processor = audioCtx.createScriptProcessor(4096, 1, 1);
        source.connect(processor); processor.connect(audioCtx.destination);
        processor.onaudioprocess = (e) => {
          const input = e.inputBuffer.getChannelData(0);
          const pcm16 = new Int16Array(input.length);
          for (let i = 0; i < input.length; i++) pcm16[i] = Math.max(-32768, Math.min(32767, input[i] * 32768));
          const bytes = new Uint8Array(pcm16.buffer);
          let binary = "";
          bytes.forEach((b) => (binary += String.fromCharCode(b)));
          if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: "audio_chunk", data: btoa(binary) }));
        };
      };
      setListening(true);
      setMode("live");
    } catch (err: any) {
      setError(err.name === "NotAllowedError" ? "Microphone permission is required." : "No microphone available.");
    }
  }

  function stopLive() {
    wsRef.current?.send(JSON.stringify({ type: "stop" })); wsRef.current?.close();
    streamRef.current?.getTracks().forEach((t) => t.stop()); audioCtxRef.current?.close();
    setListening(false); setMode("idle");
  }

  function resetDemo() { clearInterval(timerRef.current); setMode("idle"); setDemoStageIdx(-1); setDemoDone(false); }

  const isDanger = demoScenarioKey === "suspicious" && demoStageIdx >= 2;

  return (
    <div className="space-y-6">
      {/* ── Mode selector buttons ── */}
      {mode === "idle" && (
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              setDemoScenarioKey("suspicious");
              setMode("demo");
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3 font-mono-vs text-sm font-bold text-white shadow-lg shadow-amber-500/20 transition hover:brightness-110 active:scale-95"
          >
            <span className="text-base">⚡</span> 1-Click Demo (No Microphone)
          </button>
          <button
            onClick={startLive}
            className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/50 bg-cyan-500/10 px-5 py-3 font-mono-vs text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/20 active:scale-95"
          >
            <span className="text-base">🎙️</span> Start Live Microphone
          </button>
        </div>
      )}

      {/* ── Live mic mode ── */}
      {mode === "live" && (
        <div className="rounded-2xl border border-cyan-500/30 bg-navy-950/90 p-5 space-y-5 shadow-2xl backdrop-blur-md">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <span className="flex h-3.5 w-3.5 relative">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-red-500" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono-vs font-bold text-white text-sm uppercase tracking-wider">
                    Live Microphone Forensics
                  </span>
                  <span className="rounded-full border border-red-500/40 bg-red-500/10 px-2 py-0.5 text-[10px] font-mono-vs font-bold text-red-300">
                    LIVE STREAM
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">
                  Real-time browser audio buffered into 5s windows · In-memory inspection only
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono-vs text-xs text-slate-400">
                Segments analyzed: <strong className="text-white">{segmentCount}</strong>
              </span>
              <button
                onClick={stopLive}
                className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/20 transition"
              >
                ✕ Stop Listening
              </button>
            </div>
          </div>

          {/* Activity status bar */}
          <div className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-black/40 px-4 py-2.5">
            <div className="flex items-center gap-3">
              <WaveBars active={true} danger={(fusion?.synthetic_likelihood ?? 0) >= 0.6} />
              <span className="text-xs text-slate-300">
                {isSilence ? (
                  <span className="text-amber-300 font-mono-vs">⏸ {silenceMessage || "Ambient silence / pause detected"}</span>
                ) : (
                  <span className="text-cyan-300 font-mono-vs">🎙️ Active speech detected — streaming live inference</span>
                )}
              </span>
            </div>
            <span className="font-mono-vs text-[10px] text-slate-500">16 kHz mono PCM</span>
          </div>

          {/* Live Verdict & Risk Summary Gauges */}
          {fusion && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className={clsx(
                "rounded-2xl border p-4 text-center transition-all",
                (fusion.synthetic_likelihood ?? 0) >= 0.6
                  ? "border-red-500/30 bg-red-500/10 shadow-lg shadow-red-500/5"
                  : (fusion.synthetic_likelihood ?? 0) >= 0.3
                  ? "border-amber-500/30 bg-amber-500/10"
                  : "border-emerald-500/30 bg-emerald-500/10 shadow-lg shadow-emerald-500/5"
              )}>
                <span className="block text-[10px] font-mono-vs text-slate-400 mb-1 uppercase tracking-wider">Fused Synthetic Score</span>
                <span className={clsx(
                  "font-mono-vs text-3xl font-bold",
                  (fusion.synthetic_likelihood ?? 0) >= 0.6 ? "text-red-400" : (fusion.synthetic_likelihood ?? 0) >= 0.3 ? "text-amber-400" : "text-emerald-400"
                )}>
                  {pct(fusion.synthetic_likelihood ?? 0)}
                </span>
                <span className="block text-[11px] text-slate-300 mt-1 font-medium">
                  {(fusion.synthetic_likelihood ?? 0) >= 0.6
                    ? "Deepfake Voice Detected"
                    : (fusion.synthetic_likelihood ?? 0) >= 0.3
                    ? "Uncertain / Suspicious Inflection"
                    : "Authentic Human Voice"}
                </span>
              </div>

              {risk && (
                <div className={clsx(
                  "rounded-2xl border p-4 text-center transition-all",
                  (risk.risk_score ?? 0) >= 60 ? "border-red-500/30 bg-red-500/10" : (risk.risk_score ?? 0) >= 30 ? "border-amber-500/30 bg-amber-500/10" : "border-emerald-500/30 bg-emerald-500/10"
                )}>
                  <span className="block text-[10px] font-mono-vs text-slate-400 mb-1 uppercase tracking-wider">Policy Risk Score</span>
                  <span className={clsx("font-mono-vs text-3xl font-bold", riskTextClass(risk.risk_level))}>
                    {risk.risk_score}/100
                  </span>
                  <span className={clsx("block text-[10px] font-mono-vs font-bold mt-1 uppercase", riskTextClass(risk.risk_level))}>
                    {risk.risk_level} RISK
                  </span>
                </div>
              )}

              <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-center">
                <span className="block text-[10px] font-mono-vs text-slate-400 mb-1 uppercase tracking-wider">Model Agreement</span>
                <span className="font-mono-vs text-3xl font-bold text-cyan-400">
                  {pct(fusion.model_agreement ?? 0.9)}
                </span>
                <span className="block text-[11px] text-slate-300 mt-1 font-medium">
                  Tri-Model Consensus
                </span>
              </div>
            </div>
          )}

          {/* Individual Tri-Model Detector Signals */}
          {predictions.length > 0 && (
            <div className="space-y-2 pt-1">
              <span className="font-mono-vs text-xs font-bold uppercase tracking-wider text-slate-400">
                Tri-Model Decomposition (Live Window)
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {predictions.map((p: any, idx: number) => {
                  const score = p.synthetic_likelihood ?? 0;
                  const isHigh = score >= 0.6;
                  const label = p.model_name.includes("spectrogram")
                    ? "Spectrogram CNN"
                    : p.model_name.includes("wavlm")
                    ? "WavLM Transformer"
                    : "Prosody DSP (Librosa)";
                  const icon = p.model_name.includes("spectrogram") ? "📊" : p.model_name.includes("wavlm") ? "🤖" : "📈";

                  return (
                    <div key={idx} className="rounded-xl border border-white/10 bg-black/30 p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono-vs text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          <span>{icon}</span> {label}
                        </span>
                        <span className={clsx("font-mono-vs text-xs font-bold", isHigh ? "text-red-400" : "text-emerald-400")}>
                          {Math.round(score * 100)}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={clsx("h-full rounded-full transition-all duration-300", isHigh ? "bg-red-500" : "bg-emerald-500")}
                          style={{ width: `${Math.round(score * 100)}%` }}
                        />
                      </div>
                      <span className="block text-[10px] text-slate-400 truncate">
                        {p.message || (isHigh ? "Synthetic artifacts flagged" : "Natural acoustic resonance")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Risk Factors & Recommendations */}
          {risk && risk.risk_factors && risk.risk_factors.length > 0 && (
            <div className="rounded-xl border border-white/10 bg-black/30 p-4 space-y-2">
              <span className="font-mono-vs text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Live Evidence &amp; Action Recommendation
              </span>
              <ul className="space-y-1 text-xs text-slate-300">
                {risk.risk_factors.map((factor: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">•</span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
              {risk.recommendation && (
                <div className="mt-2 pt-2 border-t border-white/5 text-xs font-medium text-slate-300">
                  <span className="text-slate-500 mr-1.5">Recommended Action:</span>
                  {risk.recommendation}
                </div>
              )}
            </div>
          )}

          {error && <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}
        </div>
      )}

      {/* ── Demo mode ── */}
      {mode === "demo" && (
        <div className="space-y-4">
          {/* Demo header & Scenario Selector */}
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <WaveBars active={!demoDone} danger={isDanger} />
                <div>
                  <span className="block font-mono-vs text-xs font-bold text-amber-300 uppercase tracking-wider">
                    {demoDone ? `✅ Demo Complete — ${currentScenario.title}` : `⚡ Running Demo — Stage ${Math.min(demoStageIdx + 1, currentScenario.stages.length)} / ${currentScenario.stages.length}`}
                  </span>
                  <span className="text-[10px] text-slate-400">{currentScenario.subtitle} · No microphone required</span>
                </div>
              </div>
              <button onClick={resetDemo} className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/5">
                {demoDone ? "↩ Exit Demo" : "✕ Cancel"}
              </button>
            </div>

            {/* Scenario toggle buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
              <span className="font-mono-vs text-[11px] text-slate-400 mr-1">Switch Scenario:</span>
              <button
                onClick={() => setDemoScenarioKey("suspicious")}
                className={`rounded-lg px-3 py-1 font-mono-vs text-xs font-bold transition ${
                  demoScenarioKey === "suspicious"
                    ? "bg-red-500/20 text-red-300 border border-red-500/40 shadow"
                    : "border border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                🔴 Suspicious Impersonation (High Risk Attack)
              </button>
              <button
                onClick={() => setDemoScenarioKey("legitimate")}
                className={`rounded-lg px-3 py-1 font-mono-vs text-xs font-bold transition ${
                  demoScenarioKey === "legitimate"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow"
                    : "border border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                🟢 Legitimate Bank Call (Low Risk Control)
              </button>
            </div>
          </div>

          {/* Final verdict when done */}
          {demoDone && (
            <div className="grid grid-cols-3 gap-3">
              <div className={`rounded-2xl border p-4 text-center ${
                currentScenario.synthetic_score > 50
                  ? "border-red-500/30 bg-red-500/10"
                  : "border-emerald-500/30 bg-emerald-500/10"
              }`}>
                <span className="block text-[10px] font-mono-vs text-slate-400 mb-1">Fused Voice Score</span>
                <span className={`font-mono-vs text-3xl font-bold ${currentScenario.verdict_color}`}>
                  {currentScenario.synthetic_score}%
                </span>
                <span className="block text-[10px] text-slate-400 mt-0.5">{currentScenario.verdict}</span>
              </div>
              <div className={`rounded-2xl border p-4 text-center ${
                currentScenario.risk_score > 50
                  ? "border-red-500/30 bg-red-500/10"
                  : "border-emerald-500/30 bg-emerald-500/10"
              }`}>
                <span className="block text-[10px] font-mono-vs text-slate-400 mb-1">Policy Risk Score</span>
                <span className={`font-mono-vs text-3xl font-bold ${currentScenario.risk_color}`}>
                  {currentScenario.risk_score}/100
                </span>
                <span className={`block text-[10px] font-mono-vs font-bold mt-0.5 ${currentScenario.risk_color}`}>
                  {currentScenario.expected_risk} RISK
                </span>
              </div>
              <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-center">
                <span className="block text-[10px] font-mono-vs text-slate-400 mb-1">Forensic Signals</span>
                <span className="font-mono-vs text-3xl font-bold text-cyan-400">
                  {currentScenario.evidence.length}
                </span>
                <span className="block text-[10px] text-slate-400 mt-0.5">Corroborating Evidence</span>
              </div>
            </div>
          )}

          {/* Pipeline stages */}
          <div className="grid gap-3 md:grid-cols-2">
            {currentScenario.stages.map((stage, i) => (
              <StageCard
                key={stage.id}
                stage={stage}
                active={i === demoStageIdx && !demoDone}
                done={demoDone || i < demoStageIdx}
                progress={i === demoStageIdx ? demoProgress : 100}
              />
            ))}
          </div>

          {/* Evidence trail when done */}
          {demoDone && (
            <div className="rounded-2xl border border-white/10 bg-navy-950/80 p-5 space-y-3">
              <h3 className="font-mono-vs text-xs font-bold uppercase tracking-wider text-slate-400">
                Forensic Evidence Trail ({currentScenario.evidence.length} items)
              </h3>
              <div className="space-y-2">
                {currentScenario.evidence.map((ev, i) => (
                  <div key={i} className="flex items-start gap-2.5 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs">
                    <span className={clsx(
                      "mt-0.5 font-mono-vs text-[9px] font-bold uppercase shrink-0",
                      ev.severity === "high" ? "text-red-400" : ev.severity === "medium" ? "text-amber-400" : "text-emerald-400"
                    )}>[{ev.category}]</span>
                    <div>
                      <div className="font-semibold text-slate-200">{ev.title}</div>
                      <div className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">{ev.description}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className={`rounded-xl border p-3 text-xs font-medium ${
                currentScenario.risk_score > 50
                  ? "border-red-500/30 bg-red-500/10 text-red-200"
                  : "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
              }`}>
                {currentScenario.recommendation}
              </div>
            </div>
          )}
        </div>
      )}

      {error && mode === "idle" && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>
      )}

      {/* ── How Risk Score is Detected (Architecture & Scoring Formula) ── */}
      <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-cyan-950/20 via-navy-950/40 to-black/60 p-5 shadow-xl backdrop-blur-md">
        <div
          onClick={() => setShowRiskFormula(!showRiskFormula)}
          className="flex cursor-pointer items-center justify-between"
        >
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-300">
              <Cpu className="h-4 w-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono-vs text-sm font-bold text-white uppercase tracking-wider">
                  How the Risk Score (0–100) is Detected
                </h3>
                <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
                  Full Formula &amp; Architecture
                </span>
              </div>
              <p className="text-xs text-slate-400">
                The multi-modal mathematical formula combining voice AI forensics, live conversation analysis, and caller identity verification.
              </p>
            </div>
          </div>

          <button type="button" className="text-slate-400 hover:text-white p-1">
            {showRiskFormula ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>

        {showRiskFormula && (
          <div className="mt-5 space-y-4 border-t border-white/10 pt-4">
            {/* The Master Formula Banner */}
            <div className="rounded-xl border border-white/10 bg-black/50 p-4">
              <span className="font-mono-vs text-[10px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                The Policy Risk Engine Master Formula:
              </span>
              <div className="font-mono-vs text-xs md:text-sm text-slate-200 bg-black/40 border border-cyan-500/20 rounded-lg p-2.5 overflow-x-auto leading-relaxed">
                <span className="text-cyan-300 font-bold">Final Risk Score (0–100)</span> ={" "}
                (<span className="text-red-300 font-semibold">Voice Likelihood</span> × <strong className="text-white">40%</strong>) +{" "}
                (<span className="text-amber-300 font-semibold">Conversation &amp; OTP</span> × <strong className="text-white">25%</strong>) +{" "}
                (<span className="text-purple-300 font-semibold">Identity Penalties</span> × <strong className="text-white">20%</strong>) +{" "}
                (<span className="text-blue-300 font-semibold">Context</span> × <strong className="text-white">15%</strong>)
              </div>
            </div>

            {/* The 4 Core Scoring Pillars */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {/* Pillar 1 */}
              <div className="rounded-xl border border-red-500/20 bg-red-950/10 p-3.5 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono-vs text-[10px] font-bold text-red-400 uppercase">
                    Pillar 1 · 40% Weight
                  </span>
                  <span className="rounded bg-red-500/20 px-1.5 py-0.5 text-[9px] font-bold text-red-300">
                    Voice AI
                  </span>
                </div>
                <h4 className="font-bold text-white text-sm">Synthetic Likelihood</h4>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Captures 3-second audio slices and fuses 3 deep models:
                </p>
                <ul className="space-y-0.5 text-[10px] text-slate-400">
                  <li>• <strong className="text-slate-200">WavLM (50%)</strong>: Vocoder artifacts</li>
                  <li>• <strong className="text-slate-200">Spectrogram CNN (35%)</strong>: Frequency cuts</li>
                  <li>• <strong className="text-slate-200">Prosody (15%)</strong>: Robotic pitch flatness</li>
                </ul>
                <div className="text-[10px] text-red-300 font-mono-vs pt-1 border-t border-white/5">
                  Calculation: (Score % × 0.40)
                </div>
              </div>

              {/* Pillar 2 */}
              <div className="rounded-xl border border-amber-500/20 bg-amber-950/10 p-3.5 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono-vs text-[10px] font-bold text-amber-400 uppercase">
                    Pillar 2 · 25% Weight
                  </span>
                  <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-300">
                    Conversation
                  </span>
                </div>
                <h4 className="font-bold text-white text-sm">OTP &amp; Urgency NLP</h4>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Real-time transcript analysis scanning for social engineering hooks:
                </p>
                <ul className="space-y-0.5 text-[10px] text-slate-400">
                  <li>• <strong className="text-slate-200">OTP Request</strong>: 90 points</li>
                  <li>• <strong className="text-slate-200">Panic &amp; Urgency</strong>: 55 points</li>
                  <li>• <strong className="text-slate-200">Normal Chat</strong>: 10 points</li>
                </ul>
                <div className="text-[10px] text-amber-300 font-mono-vs pt-1 border-t border-white/5">
                  Calculation: (Risk Points × 0.25)
                </div>
              </div>

              {/* Pillar 3 */}
              <div className="rounded-xl border border-purple-500/20 bg-purple-950/10 p-3.5 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono-vs text-[10px] font-bold text-purple-400 uppercase">
                    Pillar 3 · 20% Weight
                  </span>
                  <span className="rounded bg-purple-500/20 px-1.5 py-0.5 text-[9px] font-bold text-purple-300">
                    Identity
                  </span>
                </div>
                <h4 className="font-bold text-white text-sm">Directory Penalties</h4>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Cross-references claims against official bank directory:
                </p>
                <ul className="space-y-0.5 text-[10px] text-slate-400">
                  <li>• <strong className="text-slate-200">Fake Organization</strong>: +35 pts</li>
                  <li>• <strong className="text-slate-200">Fake / Mismatched Branch</strong>: +35 pts</li>
                  <li>• <strong className="text-slate-200">Unlisted Caller ID</strong>: +20 pts</li>
                </ul>
                <div className="text-[10px] text-purple-300 font-mono-vs pt-1 border-t border-white/5">
                  Calculation: (Min(100, Sum) × 0.20)
                </div>
              </div>

              {/* Pillar 4 */}
              <div className="rounded-xl border border-blue-500/20 bg-blue-950/10 p-3.5 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono-vs text-[10px] font-bold text-blue-400 uppercase">
                    Pillar 4 · Thresholds
                  </span>
                  <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[9px] font-bold text-blue-300">
                    Policy
                  </span>
                </div>
                <h4 className="font-bold text-white text-sm">Action Bands</h4>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Maps final score to RBI &amp; TRAI consumer guidance:
                </p>
                <ul className="space-y-0.5 text-[10px] text-slate-400">
                  <li>• <strong className="text-emerald-400">0–29 LOW</strong>: Safe to proceed</li>
                  <li>• <strong className="text-amber-400">30–59 MODERATE</strong>: Callback required</li>
                  <li>• <strong className="text-orange-400">60–79 HIGH</strong>: Do not share OTP</li>
                  <li>• <strong className="text-red-400">80–100 CRITICAL</strong>: Disconnect now</li>
                </ul>
                <div className="text-[10px] text-blue-300 font-mono-vs pt-1 border-t border-white/5">
                  Prescribes automated action
                </div>
              </div>
            </div>

            {/* Concrete Real-Life Calculation Walkthrough */}
            <div className="rounded-xl border border-white/10 bg-black/40 p-4 text-xs space-y-2">
              <span className="font-mono-vs text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Worked Example: How a Scam Call Hits &quot;59.1 / 100 (Moderate Risk)&quot;
              </span>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 text-[11px] font-mono-vs text-slate-300 bg-white/5 rounded-lg p-2.5">
                <div>
                  <span className="text-red-400 block font-bold">1. Voice Forensics</span>
                  86% AI Likelihood × 0.40 = <strong className="text-white">34.4 pts</strong>
                </div>
                <div>
                  <span className="text-amber-400 block font-bold">2. Conversation Tactic</span>
                  Urgency Hook (55) × 0.25 = <strong className="text-white">13.75 pts</strong>
                </div>
                <div>
                  <span className="text-purple-400 block font-bold">3. Identity Mismatch</span>
                  (Branch 35 + Line 20) × 0.20 = <strong className="text-white">11.0 pts</strong>
                </div>
                <div>
                  <span className="text-cyan-400 block font-bold">Final Sum</span>
                  34.4 + 13.75 + 11.0 = <strong className="text-amber-400 font-bold">59.1 / 100</strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}