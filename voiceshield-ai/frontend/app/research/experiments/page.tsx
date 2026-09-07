"use client";

import { useEffect, useState } from "react";
import { listExperiments, runExperiment } from "@/lib/api";

export default function ExperimentsPage() {
  const [experiments, setExperiments] = useState<any[]>([]);
  const [dataset, setDataset] = useState("ASVspoof2019-LA-eval");
  const [model, setModel] = useState("wavlm-base-plus-antispoof");
  const [threshold, setThreshold] = useState(0.5);
  const [running, setRunning] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  function refresh() {
    listExperiments().then((res) => setExperiments(res.experiments));
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleRun(withSampleScores: boolean) {
    setRunning(true);
    try {
      // Without a real ASVspoof protocol file wired up, we deliberately do
      // NOT invent scores. `withSampleScores` demonstrates the metrics
      // pipeline using synthetic-for-testing numbers, clearly labeled as such.
      const payload: any = { dataset, model, decision_threshold: threshold };
      if (withSampleScores) {
        const n = 200;
        const labels = Array.from({ length: n }, (_, i) => (i % 2));
        const scores = labels.map((l) => (l === 1 ? Math.random() * 0.5 + 0.4 : Math.random() * 0.5));
        payload.scores = scores;
        payload.labels = labels;
      }
      const result = await runExperiment(payload);
      setLastResult({ ...result, usedSampleScores: withSampleScores });
      refresh();
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-mono-vs text-3xl font-bold text-white">ASVspoof Experiments</h1>
        <p className="mt-1 text-slate-400">
          Configure and run an evaluation. Metrics are only computed from real (scores, labels)
          pairs you provide — never fabricated.
        </p>
      </div>

      <div className="glass-panel grid gap-3 p-6 md:grid-cols-2">
        <input
          className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
          value={dataset}
          onChange={(e) => setDataset(e.target.value)}
          placeholder="Dataset"
        />
        <select
          className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
          value={model}
          onChange={(e) => setModel(e.target.value)}
        >
          <option value="spectrogram-cnn">Spectrogram</option>
          <option value="wavlm-base-plus-antispoof">WavLM</option>
          <option value="acoustic-prosody-analyzer">Acoustic Prosody</option>
        </select>
        <div>
          <label className="text-xs text-slate-500">Decision threshold: {threshold}</label>
          <input
            type="range"
            min={0.1}
            max={0.9}
            step={0.05}
            value={threshold}
            onChange={(e) => setThreshold(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
        <div className="flex items-end gap-3">
          <button
            onClick={() => handleRun(false)}
            disabled={running}
            className="rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Run (no dataset configured)
          </button>
          <button
            onClick={() => handleRun(true)}
            disabled={running}
            className="rounded-lg bg-cyan-accent px-4 py-2 text-sm font-semibold text-navy-950 disabled:opacity-50"
          >
            Run with sample scores
          </button>
        </div>
      </div>

      {lastResult && (
        <div className="glass-panel p-6">
          <h3 className="font-semibold text-white">Latest Result</h3>
          {lastResult.usedSampleScores && (
            <p className="mt-1 text-xs text-amber-300">
              Computed from synthetic-for-testing scores, not a real ASVspoof run — for
              demonstrating the metrics pipeline only.
            </p>
          )}
          {!lastResult.dataset_available ? (
            <p className="mt-3 text-slate-400">{lastResult.message || "No experiment results available."}</p>
          ) : (
            <div className="mt-3 grid grid-cols-5 gap-3 text-center">
              {Object.entries(lastResult.metrics).map(([k, v]: [string, any]) => (
                <div key={k} className="rounded-lg bg-white/5 p-3">
                  <div className="font-mono-vs text-lg font-bold text-white">
                    {typeof v === "number" ? v.toFixed(3) : "—"}
                  </div>
                  <div className="text-xs text-slate-500">{k}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div>
        <h3 className="font-mono-vs mb-3 text-sm uppercase tracking-wider text-slate-400">
          Experiment History
        </h3>
        <div className="space-y-3">
          {experiments.length === 0 && <p className="text-sm text-slate-500">No experiments run yet.</p>}
          {experiments.map((exp) => (
            <div key={exp.experiment_id} className="glass-panel p-4 text-sm">
              <div className="flex justify-between">
                <span className="font-semibold text-white">{exp.model}</span>
                <span className="text-slate-500">{exp.dataset}</span>
              </div>
              {exp.results.map((r: any, i: number) => (
                <div key={i} className="mt-1 text-slate-400">
                  {r.metrics
                    ? Object.entries(r.metrics)
                        .map(([k, v]: [string, any]) => `${k}: ${Number(v).toFixed(3)}`)
                        .join(" · ")
                    : "No experiment results available."}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
