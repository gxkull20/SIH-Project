# Scientific Integrity Rules

These rules are enforced structurally, not just by convention — see
`DetectorPrediction.is_simulated` in `ml/base.py`, which every detector
output carries.

1. **No fabricated numbers.** If a real trained checkpoint is not loaded, a
   detector returns `status=SIMULATED` or `UNAVAILABLE`, never a number
   dressed up as production inference.
2. **No fabricated benchmark results.** `ml/evaluation/asvspoof_experiments.py`
   only computes EER/ROC-AUC/F1/Precision/Recall from `(scores, labels)`
   pairs the caller actually supplies. No dataset configured → the API
   returns "No experiment results available." verbatim.
3. **Risk levels are policy, not probability.** Every `RiskResult` carries
   `is_scientifically_calibrated_probability: false` and a note saying so.
   See `docs/research/risk-policy.md`.
4. **Single features are never treated as proof.** The prosody analyzer's
   docstring and model card both say explicitly that no single acoustic
   feature is evidence of synthetic speech on its own.
5. **Model cards say "Not documented." literally** wherever real
   information isn't available (training data, evaluation dataset, etc.) —
   see `ml/model_cards/registry.py`. Nothing is invented to fill a card.
6. **Demo/fictional data is labeled at the data layer**, not just the UI —
   `is_fictional_demo_data: true` travels with every organization/branch
   verification result all the way from `ml/verification/demo_directory.py`
   through to the API response.
