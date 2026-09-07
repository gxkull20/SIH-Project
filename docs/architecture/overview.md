# Architecture Overview

```
Browser
  │
  ├─ Next.js (frontend/) ── TypeScript, Tailwind, App Router
  │     talks to the backend via /api/* (proxied by next.config.mjs rewrites)
  │
  ▼
FastAPI (backend/app/)
  │
  ├─ api/          route handlers (analyze, verify, research, reports, live, demo)
  ├─ core/         config, db session, logging
  ├─ models/db.py  SQLAlchemy ORM models (one per Section 9 entity)
  ├─ schemas/      Pydantic request/response contracts
  ├─ services/
  │     pipeline.py          orchestrates the full audio → risk pipeline
  │     report_generator.py  PDF generation (reportlab)
  │     storage.py           local filesystem / S3-compatible storage
  │
  ▼
ml/ (framework-agnostic — no FastAPI/SQLAlchemy imports, testable standalone)
  │
  ├─ base.py                 abstract interfaces every component implements
  ├─ preprocessing/          decode, resample, normalize
  ├─ segmentation/           fixed-window segmentation
  ├─ detectors/              Spectrogram, WavLM, Prosody (each: connected|simulated)
  ├─ fusion/                 weighted signal fusion
  ├─ transcription.py        replaceable ASR interface
  ├─ conversation/           OTP detector, conversation analyzer
  ├─ verification/           org/branch/caller verifiers + fictional demo directory
  ├─ risk_engine.py          policy-based risk scoring
  ├─ explanation_engine.py   evidence generation
  ├─ model_cards/            training-transparency registry
  └─ evaluation/             ASVspoof-style metric computation
  │
  ▼
PostgreSQL (all entities from Section 9) + Local/MinIO storage for audio blobs
```

## Why `ml/` is separate from `backend/`

Every class in `ml/` can be imported and unit-tested with zero FastAPI or
SQLAlchemy dependency (see `backend/app/tests/test_ml_pipeline.py`, which
imports only from `ml.*`). This is what makes "replace a model without
rewriting the app" (Section 8) actually true: a student swaps
`ml/detectors/wavlm_detector.py` for their own class implementing
`BaseVoiceDetector`, and nothing in `backend/` needs to change beyond the
one import in `backend/app/services/pipeline.py`.

## Request flow for `POST /api/analyze/upload`

1. `backend/app/api/analyze.py` validates the upload and saves it via
   `services/storage.py`.
2. `services/pipeline.run_full_analysis` is called synchronously (a
   background task queue is a natural next step for a class project, but
   is out of scope for this prototype — see Limitations in the README).
3. Inside the pipeline: preprocess → segment → run all 3 detectors per
   segment → fuse → transcribe → analyze conversation/OTP → verify
   organization/branch/caller → score risk → generate evidence → persist
   everything to Postgres.
4. The API returns a fully serialized `AnalysisSession`.

## Live detection

`backend/app/api/live.py` runs a WebSocket loop: browser mic → 16kHz PCM16
chunks → buffered into 5s windows → same detector stack as the upload path
→ streamed back per-window. It intentionally does not touch the database —
it's meant for live judge demos, not persisted analysis history.
