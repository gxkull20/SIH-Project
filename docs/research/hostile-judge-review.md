# Hostile Judge Review

Self-review against the spec's own attack checklist (Section 58), done
honestly rather than defensively.

## A. Critical issues

1. **No real trained detector ships with the repo.** Both voice-authenticity
   models run in Simulation Mode until someone connects real weights. This
   is disclosed everywhere (badges, model cards, README) but a judge could
   reasonably call the *voice detection itself* unproven. **Fix applied:**
   made this the first line of the README instead of burying it, and made
   `is_simulated` structurally impossible to omit from any API response.
2. **Synchronous, single-request pipeline.** A slow or malicious upload
   blocks the request thread; there's no timeout on the whole pipeline.
   **Not fixed in this pass** — documented as a known limitation
   (background job queue is the correct fix, out of scope for a prototype).

## B. High-priority issues

1. **Org/branch extraction from transcript is a toy regex.** It will miss
   most real phrasing. **Mitigated:** the UI also lets the caller/analyst
   supply the claim directly, so the pipeline doesn't depend on extraction
   succeeding.
2. **Live detection doesn't include conversation/identity signals**, only
   voice. **Documented as a known limitation**, not hidden.
3. **Risk engine's identity penalty caps at 100 but voice/conversation
   don't have a matching "corroboration requirement" enforced in code** —
   the CRITICAL band is reachable in principle by voice signal alone if
   fused synthetic_likelihood is 1.0 exactly (see `docs/research/risk-policy.md`
   math). In practice with all-clean verification the identity component
   is 0, so voice alone maxes at 40 (LOW/MODERATE) — verified in tests —
   but this is a property of the weights, not a hard rule. **Fix applied:**
   documented explicitly rather than overclaiming corroboration is enforced
   structurally.

## C. Medium-priority issues

1. **Rate limiting is now implemented.** `backend/app/core/rate_limit.py`
   adds a simple in-memory sliding-window limiter wired into
   `app.main` via middleware — 60 req/min per IP by default
   (`RATE_LIMIT_PER_MINUTE`). Documented as in-process only; a
   multi-instance deployment should swap in a Redis-backed limiter.
2. **Whisper transcription silently returns empty output** if
   `faster-whisper` isn't installed or fails to download a model on first
   run (no internet in some environments). Correct per spec (never
   fabricate), but could look like a bug in a live demo — **mitigated** by
   using Demo Mode for the timed portion of a live pitch.
3. **CORS defaults to localhost:3000 only** — fine for local deployment,
   would need updating for any real remote deployment.

## D. Optional improvements (not done, listed honestly)

- Learned fusion meta-model instead of weighted average.
- NLP-based OTP/entity extraction instead of regex.
- Background job queue (Celery/RQ) for concurrent/long audio.
- Real telephony integration (would require significant legal/consent work
  out of scope for a hackathon prototype).

## E. Questions a judge will ask, and what we'd say

- *"Is your accuracy real?"* — No trained checkpoint ships; we show the
  architecture and honest model cards instead of a number we can't defend.
- *"What happens if models disagree?"* — `model_agreement` is computed and
  surfaced explicitly; disagreement lowers confidence in the UI rather than
  being hidden.
- *"Can caller ID be spoofed?"* — Yes, and the caller verifier's state is
  literally named `requires_independent_verification` — it never returns
  `verified` on caller ID alone.
- *"Does this store OTPs?"* — No; the OTP detector only returns the pattern
  name that matched, never digits, and this is a repo-wide invariant, not a
  best-effort filter.
- *"Can students replace a model?"* — Yes: implement `BaseVoiceDetector`
  from `ml/base.py` and change one import in
  `backend/app/services/pipeline.py`.

## F. Demo failure contingency plan

If live inference or the mic fails during a demo: fall back to **About →
Demo Mode**, which requires no backend inference and is explicitly labeled
as precomputed. If the backend itself is down, the frontend degrades to
clear error states ("Audio could not be processed.", "Microphone
permission is required.") rather than a blank screen or stack trace.
