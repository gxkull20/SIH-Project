"use client";

import clsx from "clsx";

export const PROCESSING_STAGES = [
  "Upload received",
  "Preprocessing",
  "Segmenting",
  "Spectrogram extraction",
  "WavLM inference",
  "Prosody extraction",
  "Signal fusion",
  "Conversation analysis",
  "Verification",
  "Risk calculation",
  "Explanation generation",
];

export default function ProcessingStages({ activeIndex }: { activeIndex: number }) {
  return (
    <div className="glass-panel p-6">
      <h3 className="font-mono-vs mb-4 text-sm uppercase tracking-wider text-slate-400">
        Analysis Pipeline
      </h3>
      <ol className="space-y-2">
        {PROCESSING_STAGES.map((stage, i) => {
          const done = i < activeIndex;
          const active = i === activeIndex;
          return (
            <li key={stage} className="flex items-center gap-3">
              <span
                className={clsx(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                  done && "bg-safe-accent/20 text-safe-accent",
                  active && "bg-cyan-accent/20 text-cyan-accent pulse-live",
                  !done && !active && "bg-white/5 text-slate-500"
                )}
              >
                {done ? "✓" : i + 1}
              </span>
              <span
                className={clsx(
                  "text-sm",
                  done && "text-slate-400 line-through decoration-slate-600",
                  active && "font-semibold text-white",
                  !done && !active && "text-slate-500"
                )}
              >
                {stage}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
