"use client";

import type { Segment } from "@/types/api";
import { useState } from "react";
import clsx from "clsx";

function segmentColor(segment: Segment): string {
  const wavlm = segment.predictions.find((p) => p.model_name === "wavlm-base-plus-antispoof");
  const score = wavlm?.synthetic_likelihood ?? null;
  if (score === null) return "bg-slate-700";
  if (score >= 0.7) return "bg-red-500";
  if (score >= 0.4) return "bg-amber-500";
  return "bg-emerald-500";
}

export default function SegmentTimeline({
  segments,
  onSelect,
}: {
  segments: Segment[];
  onSelect?: (segment: Segment) => void;
}) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const totalDuration = segments.length ? segments[segments.length - 1].end_s : 1;

  return (
    <div className="glass-panel p-6">
      <h3 className="font-mono-vs text-sm uppercase tracking-wider text-slate-400">
        Segment-Level Analysis
      </h3>

      <div className="relative mt-4 flex h-10 w-full overflow-hidden rounded-lg border border-white/10">
        {segments.map((seg, i) => (
          <button
            key={seg.segment_id}
            style={{ width: `${((seg.end_s - seg.start_s) / totalDuration) * 100}%` }}
            className={clsx(
              "h-full border-r border-navy-950/60 transition-opacity",
              segmentColor(seg),
              activeIdx === i ? "opacity-100" : "opacity-70 hover:opacity-100"
            )}
            onClick={() => {
              setActiveIdx(i);
              onSelect?.(seg);
            }}
            title={`Segment ${i + 1}: ${seg.start_s.toFixed(1)}s - ${seg.end_s.toFixed(1)}s`}
          />
        ))}
      </div>
      <div className="mt-1 flex justify-between text-xs text-slate-500">
        <span>0:00</span>
        <span>{Math.floor(totalDuration / 60)}:{String(Math.floor(totalDuration % 60)).padStart(2, "0")}</span>
      </div>

      {activeIdx !== null && segments[activeIdx] && (
        <div className="mt-4 rounded-lg border border-white/10 bg-black/20 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-white">
              Segment {activeIdx + 1} · {segments[activeIdx].start_s.toFixed(1)}s–
              {segments[activeIdx].end_s.toFixed(1)}s
            </span>
          </div>
          {segments[activeIdx].transcript_text && (
            <p className="mt-2 text-sm italic text-slate-300">
              &ldquo;{segments[activeIdx].transcript_text}&rdquo;
            </p>
          )}
          <div className="mt-3 grid grid-cols-3 gap-2">
            {segments[activeIdx].predictions.map((p) => (
              <div key={p.model_name} className="rounded-md bg-white/5 p-2 text-center">
                <div className="text-xs text-slate-400">{p.model_name.split("-")[0]}</div>
                <div className="font-mono-vs text-sm font-semibold text-white">
                  {p.synthetic_likelihood !== null ? `${Math.round(p.synthetic_likelihood * 100)}%` : "—"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3 flex gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Likely human</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" /> Uncertain</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500" /> Likely synthetic</span>
      </div>
    </div>
  );
}
