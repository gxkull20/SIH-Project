"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AudioDropzone from "@/components/AudioDropzone";
import ProcessingStages, { PROCESSING_STAGES } from "@/components/ProcessingStages";
import LiveDetectionPanel from "@/components/LiveDetectionPanel";
import { uploadAndAnalyze } from "@/lib/api";

const DEFAULT_PRESETS = [
  {
    id: "sample_bank_call",
    filename: "sample_bank_call.wav",
    title: "Legitimate Bank Call",
    subtitle: "Customer Care Address Update (Control Case)",
    claimed_organization: "Demo Bank",
    claimed_branch: "Chennai",
    claimed_city: "Chennai",
    caller_id: "+91-DEMO-1000",
    expected_risk: "LOW",
    description: "Legitimate customer service confirmation adhering to banking protocols with zero credential solicitation.",
    badge_color: "emerald",
  },
  {
    id: "sample_suspicious_call",
    filename: "sample_suspicious_call.wav",
    title: "Suspicious Impersonation Call",
    subtitle: "Urgent Unauthorized Transaction Alert",
    claimed_organization: "Demo Bank",
    claimed_branch: "Delhi",
    claimed_city: "Delhi",
    caller_id: "+91-98210-44912",
    expected_risk: "HIGH",
    description: "Impersonates bank central fraud cell, manufactures urgency, and uses unverified branch credentials.",
    badge_color: "red",
  },
];

function DetectContent() {
  const router = useRouter();
  const params = useSearchParams();
  const initialLive = params.get("mode") === "live";

  const [mode, setMode] = useState<"upload" | "live">(initialLive ? "live" : "upload");
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [analyzingPreset, setAnalyzingPreset] = useState<string | null>(null);
  const [stageIndex, setStageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [samples, setSamples] = useState<any[]>(DEFAULT_PRESETS);

  async function handleAnalyze() {
    if (!file) return;
    setProcessing(true);
    setAnalyzingPreset(null);
    setError(null);
    setStageIndex(0);

    const interval = setInterval(() => {
      setStageIndex((i) => Math.min(i + 1, PROCESSING_STAGES.length - 1));
    }, 350);

    try {
      const result = await uploadAndAnalyze(file, {});
      clearInterval(interval);
      router.push(`/analysis/${result.session_id}`);
    } catch (err: any) {
      clearInterval(interval);
      setError(err.message || "Audio could not be processed.");
      setProcessing(false);
    }
  }

  useEffect(() => {
    import("@/lib/api")
      .then(({ listPresetSamples }) => {
        listPresetSamples()
          .then((res) => {
            if (res.samples && res.samples.length > 0) {
              setSamples(res.samples);
            }
          })
          .catch((err) => console.warn("Using default preset samples (backend warming up):", err));
      })
      .catch(() => {});
  }, []);

  async function handleAnalyzePreset(sampleName: string) {
    setProcessing(true);
    setAnalyzingPreset(sampleName);
    setError(null);
    setStageIndex(0);

    const interval = setInterval(() => {
      setStageIndex((i) => Math.min(i + 1, PROCESSING_STAGES.length - 1));
    }, 320);

    try {
      const { analyzePresetSample } = await import("@/lib/api");
      const result = await analyzePresetSample(sampleName);
      clearInterval(interval);
      router.push(`/analysis/${result.session_id}`);
    } catch (err: any) {
      clearInterval(interval);
      setError(err.message || "Sample audio could not be analyzed.");
      setProcessing(false);
      setAnalyzingPreset(null);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-mono-vs text-3xl font-bold text-white">Detect</h1>
        <p className="mt-1 text-slate-400">
          Upload a call recording, test our 1-click workable demo models, or start live browser-microphone detection.
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setMode("upload")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
            mode === "upload" ? "bg-cyan-accent text-navy-950" : "border border-white/10 text-slate-300 hover:bg-white/5"
          }`}
        >
          Upload Audio &amp; Presets
        </button>
        <button
          onClick={() => setMode("live")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
            mode === "live" ? "bg-cyan-accent text-navy-950" : "border border-white/10 text-slate-300 hover:bg-white/5"
          }`}
        >
          Live Detection
        </button>
      </div>

      {mode === "upload" && (
        <div className="space-y-8">
          {/* Quick Demo Models Presets Card */}
          <div className="rounded-2xl border border-cyan-500/30 bg-navy-950/80 p-6 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">⚡</span>
                  <h2 className="font-mono-vs text-lg font-bold text-white uppercase tracking-wider">
                    Workable Demo Models &amp; Audio Presets
                  </h2>
                  <span className="rounded-full border border-cyan-400/40 bg-cyan-500/10 px-2.5 py-0.5 font-mono-vs text-[10px] font-bold text-cyan-300">
                    Ready to Test
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  Pre-bundled voice recordings for instant evaluation. Runs the full 11-stage forensic stack (Mel-CNN, WavLM, Prosody DSP, OTP, Verification &amp; Risk).
                </p>
              </div>

              {processing && analyzingPreset && (
                <div className="flex items-center gap-2 rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 font-mono-vs text-xs font-semibold text-cyan-300 animate-pulse">
                  <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                  Executing Forensic Pipeline…
                </div>
              )}
            </div>

            {/* If analyzing a preset, show stages inline */}
            {processing && analyzingPreset && (
              <div className="rounded-xl border border-cyan-500/30 bg-black/40 p-4">
                <ProcessingStages activeIndex={stageIndex} />
              </div>
            )}

            <div className="grid gap-5 md:grid-cols-2">
              {samples.map((s) => {
                const isCurrent = analyzingPreset === s.filename || analyzingPreset === s.id;
                return (
                  <div
                    key={s.id}
                    className={`flex flex-col justify-between rounded-xl border p-5 transition-all duration-300 ${
                      isCurrent
                        ? "border-cyan-400 bg-cyan-500/10 shadow-lg shadow-cyan-500/10"
                        : "border-white/10 bg-white/[0.02] hover:border-cyan-500/40 hover:bg-white/[0.04]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono-vs text-base font-bold text-white">{s.title}</span>
                        <span
                          className={`rounded px-2.5 py-0.5 font-mono-vs text-[10px] font-bold tracking-wider ${
                            s.expected_risk === "LOW"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-red-500/20 text-red-300 border border-red-500/30"
                          }`}
                        >
                          {s.expected_risk} RISK
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-300 leading-relaxed">{s.description}</p>

                      <div className="mt-3 flex flex-wrap gap-2 font-mono-vs text-[11px] text-slate-300">
                        <span className="rounded bg-black/40 px-2 py-0.5 border border-white/5">
                          Org: {s.claimed_organization}
                        </span>
                        <span className="rounded bg-black/40 px-2 py-0.5 border border-white/5">
                          Branch: {s.claimed_branch}
                        </span>
                        <span className="rounded bg-black/40 px-2 py-0.5 border border-white/5">
                          {s.caller_id}
                        </span>
                      </div>

                      {/* Audio Player Preview */}
                      <div className="mt-4 rounded-lg bg-black/50 p-2.5 border border-white/5">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5 font-mono-vs">
                          <span>🎙️ Sample Audio Preview</span>
                          <span className="text-cyan-400">{s.filename}</span>
                        </div>
                        <audio
                          controls
                          preload="metadata"
                          className="h-8 w-full rounded focus:outline-none"
                          src={`/api/samples/${s.filename}/download`}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => handleAnalyzePreset(s.filename)}
                      disabled={processing}
                      className={`mt-4 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-mono-vs text-xs font-bold transition disabled:opacity-50 ${
                        s.expected_risk === "LOW"
                          ? "bg-emerald-500/90 text-navy-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/20"
                          : "bg-gradient-to-r from-red-500 to-amber-500 text-white hover:brightness-110 shadow-md shadow-red-500/20"
                      }`}
                    >
                      {isCurrent ? (
                        <>
                          <span className="h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                          Processing {s.title}…
                        </>
                      ) : (
                        `▶ Run Model & Analyze ${s.title}`
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
                {error}
              </div>
            )}
          </div>

          {/* Custom File Upload Section */}
          <div className="rounded-2xl border border-white/10 bg-navy-950/40 p-6 space-y-4">
            <h3 className="font-mono-vs text-sm font-bold text-white uppercase tracking-wider">
              Or Upload Your Own Custom Audio File
            </h3>
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-4">
                <AudioDropzone onFileSelected={setFile} disabled={processing} />

                <button
                  onClick={handleAnalyze}
                  disabled={!file || processing}
                  className="w-full rounded-lg bg-cyan-accent px-4 py-3 font-semibold text-navy-950 transition disabled:opacity-40 hover:brightness-105"
                >
                  {processing && !analyzingPreset ? "Analyzing Custom Audio…" : "Analyze Custom Voice File"}
                </button>
              </div>

              <div>{processing && !analyzingPreset && <ProcessingStages activeIndex={stageIndex} />}</div>
            </div>
          </div>
        </div>
      )}

      {mode === "live" && <LiveDetectionPanel />}
    </div>
  );
}

export default function DetectPage() {
  return (
    <Suspense fallback={<div className="text-slate-400">Loading detect…</div>}>
      <DetectContent />
    </Suspense>
  );
}
