"use client";

import { useEffect, useState } from "react";
import { listModels } from "@/lib/api";

export default function ModelsPage() {
  const [models, setModels] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    listModels().then((res) => setModels(res.models));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-mono-vs text-3xl font-bold text-white">Model Management</h1>
        <p className="mt-1 text-slate-400">Status, architecture, and training transparency for every model.</p>
      </div>

      <div className="glass-panel overflow-x-auto p-2">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-slate-500">
              <th className="p-3">Model</th>
              <th className="p-3">Status</th>
              <th className="p-3">EER</th>
              <th className="p-3">ROC-AUC</th>
              <th className="p-3">F1</th>
              <th className="p-3">Precision</th>
              <th className="p-3">Recall</th>
            </tr>
          </thead>
          <tbody>
            {models.map((m) => (
              <tr
                key={m.model_key}
                className="cursor-pointer border-t border-white/5 hover:bg-white/5"
                onClick={() => setExpanded(expanded === m.model_key ? null : m.model_key)}
              >
                <td className="p-3 font-semibold text-white">{m.model_card?.model_name || m.model_key}</td>
                <td className="p-3">
                  <span className={m.status === "connected" ? "badge-connected" : "badge-simulated"}>
                    {m.status}
                  </span>
                </td>
                {["EER", "ROC_AUC", "F1", "Precision", "Recall"].map((k) => (
                  <td key={k} className="p-3 font-mono-vs text-slate-300">
                    {m.model_card?.metrics?.[k] ?? "Not documented."}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-4">
        {models.map((m) => (
          <div key={m.model_key} className="glass-panel p-6">
            <button
              className="flex w-full items-center justify-between text-left"
              onClick={() => setExpanded(expanded === m.model_key ? null : m.model_key)}
            >
              <h3 className="text-lg font-semibold text-white">{m.model_card?.model_name}</h3>
              <span className="text-slate-500">{expanded === m.model_key ? "−" : "+"}</span>
            </button>
            {expanded === m.model_key && m.model_card && (
              <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                <CardField label="Version" value={m.model_card.version} />
                <CardField label="Architecture" value={m.model_card.architecture} />
                <CardField label="Training Data" value={m.model_card.training_data} />
                <CardField label="Input Format" value={m.model_card.input_format} />
                <CardField label="Sampling Rate" value={m.model_card.sampling_rate} />
                <CardField label="Segment Length" value={m.model_card.segment_length} />
                <CardField label="Output" value={m.model_card.output} />
                <CardField label="Training Configuration" value={m.model_card.training_configuration} />
                <CardField label="Evaluation Dataset" value={m.model_card.evaluation_dataset} />
                <CardField label="Language Considerations" value={m.model_card.language_considerations} />
                <CardField label="Noise Considerations" value={m.model_card.noise_considerations} />
                <CardField label="Replay Limitations" value={m.model_card.replay_limitations} />
                <div className="md:col-span-2">
                  <span className="text-xs uppercase tracking-wide text-slate-500">Known Limitations</span>
                  <ul className="mt-1 list-disc pl-5 text-slate-300">
                    {(m.model_card.known_limitations || []).map((l: string, i: number) => (
                      <li key={i}>{l}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function CardField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="text-slate-300">{value}</div>
    </div>
  );
}
