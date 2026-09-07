# Using ASVspoof With VoiceShield-AI

VoiceShield-AI does **not** bundle the ASVspoof dataset. To run real
experiments:

1. Register for and download ASVspoof2019 or ASVspoof2021 directly from the
   official organizers (https://www.asvspoof.org/). This prototype cannot
   and does not redistribute it.
2. Run your trained detector (Spectrogram / WavLM / your own) over the
   eval protocol to produce a `(score, label)` pair per trial, where
   `label = 0` for genuine and `label = 1` for spoof.
3. POST those arrays to `/api/experiments/run` along with `dataset`,
   `model`, and `decision_threshold`. The backend computes EER, ROC-AUC,
   F1, Precision, and Recall directly from what you send
   (`ml/evaluation/asvspoof_experiments.py`) — it does not know or invent
   anything about ASVspoof itself.
4. Results are persisted to the `experiments` / `experiment_results` tables
   and shown in Research Lab → Experiments, alongside `software_version`
   for reproducibility.

## Known limitations of ASVspoof-style evaluation

- ASVspoof attacks are a specific, dated set of TTS/VC/replay attack types.
  A model scoring well on ASVspoof eval protocols is not guaranteed to
  generalize to attacks released after the dataset was built.
- EER computed on a balanced eval set does not reflect real-world class
  imbalance (genuine calls vastly outnumber spoofed ones in practice).
- Cross-lingual and cross-channel (e.g. telephony-band, VoIP-compressed)
  generalization is a known open problem and is not addressed by this
  prototype.
