export default function DatasetsPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="font-mono-vs text-3xl font-bold text-white">Datasets</h1>

      <div className="glass-panel p-6">
        <h3 className="font-semibold text-white">What this prototype ships with</h3>
        <p className="mt-2 text-sm text-slate-300">
          VoiceShield-AI does not bundle the ASVspoof dataset or any other licensed speech corpus.
          Doing so would violate most dataset licenses, which require independent registration and
          agreement to terms.
        </p>
      </div>

      <div className="glass-panel p-6">
        <h3 className="font-semibold text-white">Fictional demo data</h3>
        <p className="mt-2 text-sm text-slate-300">
          "Demo Bank" and "Demo Telecom" and their branches (Chennai, Coimbatore, Bangalore,
          Hyderabad, Mumbai) are entirely fictional and exist only so the verification pipeline is
          demonstrable end-to-end. They do not represent, and are not connected to, any real
          institution.
        </p>
      </div>

      <div className="glass-panel p-6">
        <h3 className="font-semibold text-white">Getting real evaluation data</h3>
        <p className="mt-2 text-sm text-slate-300">
          To run real experiments: obtain the ASVspoof2019/2021 dataset directly from the official
          ASVspoof organizers (registration required), generate detector scores using your trained
          checkpoint, and submit those (scores, labels) pairs to{" "}
          <code className="rounded bg-black/30 px-1.5 py-0.5 font-mono-vs text-xs">
            POST /api/experiments/run
          </code>
          . The Research Lab will compute EER/ROC-AUC/F1/Precision/Recall from what you provide —
          it will never fabricate these numbers on your behalf.
        </p>
      </div>
    </div>
  );
}
