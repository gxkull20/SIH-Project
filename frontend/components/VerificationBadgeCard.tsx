"use client";

import type { VerificationEntry } from "@/types/api";
import clsx from "clsx";

const STATE_STYLE: Record<string, string> = {
  verified: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  unverified: "border-orange-500/40 bg-orange-500/10 text-orange-300",
  inconsistent: "border-red-500/40 bg-red-500/10 text-red-300",
  unknown: "border-slate-500/40 bg-slate-500/10 text-slate-300",
  requires_independent_verification: "border-amber-500/40 bg-amber-500/10 text-amber-300",
};

const STATE_LABEL: Record<string, string> = {
  verified: "Verified",
  unverified: "Unverified",
  inconsistent: "Inconsistent",
  unknown: "Unknown",
  requires_independent_verification: "Requires independent verification",
};

export default function VerificationBadgeCard({
  title,
  entry,
}: {
  title: string;
  entry?: VerificationEntry;
}) {
  const state = entry?.state || "unknown";
  return (
    <div className="glass-panel p-5">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-white">{title}</h4>
        {entry?.is_fictional_demo_data && (
          <span className="text-[10px] uppercase tracking-wide text-slate-500">Demo data</span>
        )}
      </div>
      <span
        className={clsx(
          "mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-semibold",
          STATE_STYLE[state]
        )}
      >
        {STATE_LABEL[state] || state}
      </span>
      {entry?.reason && <p className="mt-3 text-xs text-slate-400">{entry.reason}</p>}
      {entry?.matched_organization && (
        <p className="mt-1 text-xs text-slate-500">Matched: {entry.matched_organization}</p>
      )}
      {entry?.matched_city && <p className="mt-1 text-xs text-slate-500">City: {entry.matched_city}</p>}
    </div>
  );
}
