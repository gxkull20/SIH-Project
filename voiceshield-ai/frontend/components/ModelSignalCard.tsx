"use client";

import type { SegmentPrediction } from "@/types/api";
import { pct } from "@/lib/risk-style";

const MODEL_LABEL: Record<string, string> = {
  "spectrogram-cnn": "Mel-Spectrogram CNN",
  "wavlm-base-plus-antispoof": "WavLM Self-Supervised",
  "acoustic-prosody-analyzer": "Acoustic Prosody DSP",
};

const MODEL_TECH_DESC: Record<string, string> = {
  "spectrogram-cnn": "Frequency domain vocoder artifact detection via 80-band mel spectrograms.",
  "wavlm-base-plus-antispoof": "Self-supervised transformer embeddings capturing temporal & phonetic continuity.",
  "acoustic-prosody-analyzer": "Pure DSP feature extraction: F0 pitch stability, Wiener flatness, and pause mechanics.",
};

function StatusBadge({ status, isSimulated }: { status: string; isSimulated: boolean }) {
  if (status === "connected" && !isSimulated) return <span className="badge-connected">Connected</span>;
  if (status === "unavailable") return <span className="badge-unavailable">Unavailable</span>;
  return <span className="badge-simulated">Simulation Mode</span>;
}

export default function ModelSignalCard({
  prediction,
  onClick,
}: {
  prediction: SegmentPrediction;
  onClick?: () => void;
}) {
  const isProsody = prediction.model_name === "acoustic-prosody-analyzer";

  return (
    <div
      onClick={onClick}
      className="glass-panel w-full p-5 text-left transition-all hover:border-cyan-500/30"
    >
      <div className="flex items-center justify-between">
        <h4 className="font-mono-vs text-sm font-bold text-white">
          {MODEL_LABEL[prediction.model_name] || prediction.model_name}
        </h4>
        <StatusBadge status={prediction.status} isSimulated={prediction.is_simulated} />
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-mono-vs text-2xl font-extrabold text-cyan-accent">
          {pct(prediction.synthetic_likelihood)}
        </span>
        <span className="text-xs text-slate-400">synthetic likelihood</span>
      </div>

      <p className="mt-2 text-xs text-slate-400 leading-relaxed">
        {MODEL_TECH_DESC[prediction.model_name] || prediction.message}
      </p>

      {isProsody && (
        <div className="mt-3 flex flex-wrap gap-1.5 font-mono-vs text-[10px] text-slate-300">
          <span className="rounded bg-black/40 px-2 py-0.5 border border-white/5 text-cyan-300">
            F0 Pitch Contour
          </span>
          <span className="rounded bg-black/40 px-2 py-0.5 border border-white/5 text-teal-300">
            Wiener Flatness
          </span>
          <span className="rounded bg-black/40 px-2 py-0.5 border border-white/5 text-emerald-300">
            Speaking Rate
          </span>
          <span className="rounded bg-black/40 px-2 py-0.5 border border-white/5 text-indigo-300">
            Pause Ratio
          </span>
        </div>
      )}

      <div className="mt-3 border-t border-white/5 pt-2 flex flex-wrap gap-3 text-[11px] font-mono-vs text-slate-500">
        <span>v{prediction.model_version}</span>
        {prediction.uncertainty !== null && <span>uncertainty {pct(prediction.uncertainty)}</span>}
        {prediction.processing_time_ms !== null && (
          <span>{prediction.processing_time_ms.toFixed(0)}ms</span>
        )}
      </div>
    </div>
  );
}
