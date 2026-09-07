# Risk Policy: Weights and Thresholds

This document exists because it's an easy trap to build a risk score that
*feels* rigorous but is actually just a set of magic numbers. Here's exactly
what ours are, why, and what a critical reader should push back on.

## The formula

```
risk_score = voice_component   * voice_weight        (default 0.40)
           + conversation_comp * conversation_weight  (default 0.25)
           + identity_component* identity_weight      (default 0.20)
           + context_component * context_weight       (default 0.15, currently always 0)
```

- `voice_component` = fused `synthetic_likelihood` × 100.
- `conversation_component` = a step function of the conversation "risk hint"
  (`low`→10, `moderate`→55, `high`→90). This is deliberately coarse — we do
  not claim a continuous conversation-risk probability.
- `identity_component` = additive penalties (org unverified +35, branch
  inconsistent +35, branch unknown +15, caller unverified +20), capped at
  100.
- `context_component` is a placeholder for future contextual signals (time
  of day, call frequency, device reputation, etc.) — always 0 today. Its
  weight is reserved, not secretly redistributed.

## What we verified empirically (see `backend/app/tests/test_ml_pipeline.py`)

With current weights, a session needs **both** a near-certain voice signal
(≥ ~0.95 synthetic likelihood) **and** multiple corroborating conversation +
identity failures to cross into CRITICAL (≥80). A single strong signal in
isolation — e.g. high synthetic-speech likelihood alone with clean
verification — lands in MODERATE or HIGH, not CRITICAL. That's intentional:
the product's whole premise is that voice-alone detection is insufficient,
so the policy should not let voice alone dominate the top risk band.

## Known limitations a judge should ask about

1. **This is a weighted sum, not a learned model.** It cannot capture
   nonlinear interactions (e.g. "OTP request + inconsistent branch is worse
   together than the sum of their parts"). That's a deliberate transparency
   trade-off, not an oversight — see `ml/model_cards/registry.py` for the
   fusion engine's own model card, which states this explicitly.
2. **The thresholds (30/60/80) are policy, not calibration.** They were not
   fit against any labeled outcome dataset. Every place this is shown in
   the UI or the report says so.
3. **`context_component` is currently inert.** Its weight exists so a
   contributing student can add real contextual signals later without
   re-deriving the whole formula.
4. **Conversation risk is a 3-bucket step function**, which is coarse by
   design — the alternative (a smooth score from keyword density) implies
   more precision than rule-based matching actually has.
