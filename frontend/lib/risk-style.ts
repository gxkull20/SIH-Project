import type { RiskLevel } from "@/types/api";

export function riskTextClass(level: RiskLevel | null | undefined): string {
  switch (level) {
    case "LOW":
      return "risk-low";
    case "MODERATE":
      return "risk-moderate";
    case "HIGH":
      return "risk-high";
    case "CRITICAL":
      return "risk-critical";
    default:
      return "text-slate-400";
  }
}

export function riskBgClass(level: RiskLevel | null | undefined): string {
  switch (level) {
    case "LOW":
      return "bg-risk-low";
    case "MODERATE":
      return "bg-risk-moderate";
    case "HIGH":
      return "bg-risk-high";
    case "CRITICAL":
      return "bg-risk-critical";
    default:
      return "bg-slate-800 border-slate-700";
  }
}

export function pct(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return `${Math.round(value * 100)}%`;
}
