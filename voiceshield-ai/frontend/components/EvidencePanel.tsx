"use client";

import { useState } from "react";
import type { EvidenceItem } from "@/types/api";
import clsx from "clsx";

const SEVERITY_COLOR: Record<string, string> = {
  info: "border-slate-500/40 text-slate-300",
  low: "border-emerald-500/40 text-emerald-300",
  medium: "border-amber-500/40 text-amber-300",
  high: "border-orange-500/40 text-orange-300",
  critical: "border-red-500/40 text-red-300",
};

const CATEGORY_LABEL: Record<string, string> = {
  VOICE: "Voice",
  CONVERSATION: "Conversation",
  IDENTITY: "Identity",
  CONTEXT: "Context",
};

export default function EvidencePanel({
  evidence,
  onSelect,
}: {
  evidence: EvidenceItem[];
  onSelect?: (item: EvidenceItem) => void;
}) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (!evidence || evidence.length === 0) {
    return (
      <div className="glass-panel p-6 text-sm text-slate-400">
        No evidence has been generated for this session yet.
      </div>
    );
  }

  return (
    <div className="glass-panel p-6">
      <h3 className="font-mono-vs text-sm uppercase tracking-wider text-slate-400">
        Why is this risky?
      </h3>
      <div className="mt-4 space-y-3">
        {evidence.map((item, idx) => {
          const isOpen = openId === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setOpenId(isOpen ? null : item.id);
                onSelect?.(item);
              }}
              className={clsx(
                "w-full rounded-lg border bg-black/20 p-4 text-left transition-colors",
                SEVERITY_COLOR[item.severity] || "border-slate-500/40",
                "hover:bg-black/30"
              )}
            >
              <div className="flex items-start gap-3">
                <span className="font-mono-vs text-lg font-bold text-slate-500">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-wide text-slate-500">
                      {CATEGORY_LABEL[item.category] || item.category}
                    </span>
                    <span className={clsx("text-xs font-semibold uppercase", SEVERITY_COLOR[item.severity])}>
                      {item.severity}
                    </span>
                  </div>
                  <div className="mt-1 font-semibold text-white">{item.title}</div>
                  {isOpen && (
                    <p className="mt-2 text-sm text-slate-300">{item.description}</p>
                  )}
                  {isOpen && (item.segment_id || item.timestamp_s !== null) && (
                    <p className="mt-2 text-xs text-slate-500">
                      Source: {item.source}
                      {item.segment_id ? ` · segment ${item.segment_id}` : ""}
                      {item.timestamp_s !== null && item.timestamp_s !== undefined
                        ? ` · t=${item.timestamp_s.toFixed(1)}s`
                        : ""}
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
