import type { AnalysisSession, DemoScenario, ModelCard } from "@/types/api";

const BASE = ""; // Next.js rewrites /api/* to the backend (see next.config.mjs)

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = "Request failed.";
    try {
      const body = await res.json();
      detail = body.detail || body.error || detail;
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }
  return res.json() as Promise<T>;
}

export async function uploadAndAnalyze(
  file: File,
  options: {
    segmentLengthS?: number;
    claimedOrganization?: string;
    claimedBranch?: string;
    claimedCity?: string;
    callerId?: string;
  } = {}
): Promise<AnalysisSession> {
  const form = new FormData();
  form.append("file", file);
  if (options.segmentLengthS) form.append("segment_length_s", String(options.segmentLengthS));
  if (options.claimedOrganization) form.append("claimed_organization", options.claimedOrganization);
  if (options.claimedBranch) form.append("claimed_branch", options.claimedBranch);
  if (options.claimedCity) form.append("claimed_city", options.claimedCity);
  if (options.callerId) form.append("caller_id", options.callerId);

  const res = await fetch(`${BASE}/api/analyze/upload`, { method: "POST", body: form });
  return handle<AnalysisSession>(res);
}

export async function getAnalysis(analysisId: string): Promise<AnalysisSession> {
  const res = await fetch(`${BASE}/api/analysis/${analysisId}`);
  return handle<AnalysisSession>(res);
}

export async function getSegments(analysisId: string) {
  const res = await fetch(`${BASE}/api/analysis/${analysisId}/segments`);
  return handle<{ segments: any[] }>(res);
}

export async function verifyCaller(payload: {
  claimed_organization?: string;
  claimed_branch?: string;
  claimed_city?: string;
  caller_id?: string;
}) {
  const res = await fetch(`${BASE}/api/verify/caller`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handle<any>(res);
}

export async function listModels() {
  const res = await fetch(`${BASE}/api/models`);
  return handle<{ models: { model_key: string; status: string; model_card: ModelCard }[] }>(res);
}

export async function listExperiments() {
  const res = await fetch(`${BASE}/api/experiments`);
  return handle<{ experiments: any[] }>(res);
}

export async function runExperiment(payload: {
  dataset: string;
  model: string;
  attack_type?: string;
  segment_length_s?: number;
  decision_threshold?: number;
  scores?: number[];
  labels?: number[];
}) {
  const res = await fetch(`${BASE}/api/experiments/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handle<any>(res);
}

export async function listDemoScenarios() {
  const res = await fetch(`${BASE}/api/demo/scenarios`);
  return handle<{ scenarios: { key: string; label: string }[] }>(res);
}

export async function getDemoScenario(key: string) {
  const res = await fetch(`${BASE}/api/demo/scenarios/${key}`);
  return handle<DemoScenario>(res);
}

export function reportDownloadUrl(analysisId: string) {
  return `${BASE}/api/reports/${analysisId}`;
}

export async function listSimulateScenarios() {
  const res = await fetch(`${BASE}/api/simulate/scenarios`);
  return handle<{ scenarios: any[] }>(res);
}

export async function evaluateSimulateTurn(payload: {
  caller_text: string;
  user_reply?: string;
  claimed_organization?: string;
  claimed_branch?: string;
  claimed_city?: string;
  caller_id?: string;
  simulated_synthetic_likelihood?: number;
}) {
  const res = await fetch(`${BASE}/api/simulate/evaluate-turn`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handle<any>(res);
}

export async function listPresetSamples() {
  const res = await fetch(`${BASE}/api/samples`);
  return handle<{ samples: any[] }>(res);
}

export async function analyzePresetSample(sampleName: string): Promise<AnalysisSession> {
  const res = await fetch(`${BASE}/api/samples/${sampleName}/analyze`, {
    method: "POST",
  });
  return handle<AnalysisSession>(res);
}
