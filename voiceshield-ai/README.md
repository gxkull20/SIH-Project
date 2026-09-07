# VoiceShield-AI

### Detect. Verify. Explain.

An explainable voice-security platform that combines AI voice forensics
(spectrogram + WavLM + acoustic prosody), conversation intelligence (OTP /
social-engineering detection), and caller verification (organization /
branch / caller ID) into one auditable risk score with a full evidence
trail.

> **Read this first:** every detector in this repo can run in two modes —
> `connected` (a real trained checkpoint is loaded) or `simulated`
> (deterministic, clearly-labeled dev adapter). No trained weights ship
> with this repo. Out of the box, **the whole app runs end-to-end in
> Simulation Mode** — every screen works, every number is real DSP/logic,
> but voice-authenticity scores are illustrative until you plug in trained
> weights. This is by design (see `docs/research/scientific-integrity.md`),
> not a placeholder we forgot to fill in.

---

## 1. Architecture

See `docs/architecture/overview.md` for the full diagram. Short version:

```
Next.js (frontend) → FastAPI (backend) → ml/ (framework-agnostic pipeline) → PostgreSQL
                                                                            → Local/MinIO storage
```

## 2. Local deployment

**Requirements:** Docker + Docker Compose. Nothing else needs to be
installed on your host.

```bash
git clone <this-repo>
cd voiceshield-ai
cp docker/.env.example docker/.env
docker compose -f docker/docker-compose.yml up --build
```

This starts:
- `db` — PostgreSQL 16
- `minio` — S3-compatible object storage (optional; local filesystem is the default)
- `backend` — FastAPI on http://localhost:8000 (Swagger docs at `/docs`), runs `alembic upgrade head` + seeds demo data on startup
- `frontend` — Next.js on http://localhost:3000

Open **http://localhost:3000**.

### Running without Docker (1-Click Unified Local Runner)

You can launch **both** the FastAPI backend and Next.js frontend together with one single command:

```bash
# Windows (Double-click or run from terminal)
run_local.bat
# or in PowerShell:
.\run_local.ps1
# or with Python:
python run_local.py
```

This will automatically:
1. Start FastAPI on `http://127.0.0.1:8000` (and `http://127.0.0.1:8000/docs`)
2. Start Next.js on `http://localhost:3000`
3. Check service health and automatically launch your default browser
4. Provide unified, labeled terminal logs and clean Ctrl+C shutdown

---

### Running Individual Services Manually

```bash
# Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend (separate terminal)
cd frontend
bun run dev  # or npm run dev
```

### Connecting real model weights (optional)

Set in `docker/.env`:
```
SPECTROGRAM_MODEL_PATH=/path/to/spectrogram_checkpoint.pt
WAVLM_MODEL_PATH=/path/to/wavlm_antispoof_head.pt
```
Without these, both detectors run in Simulation Mode automatically — no
crash, no fake "connected" status.

## 3. Testing

```bash
cd backend
pip install -r requirements.txt pytest
PYTHONPATH=.:.. pytest app/tests -v
```

The `ml/` package has zero FastAPI/SQLAlchemy dependencies, so these tests
run fast and can also be imported directly in a notebook for experimentation.

## 4. The 60–90 second SIH demo

1. Open the home page → click **Analyze a Voice**.
2. Go to **About → Demo Mode** and step through the 4 precomputed scenarios
   (human/low-risk, synthetic/suspicious, synthetic+OTP+branch-mismatch,
   human+suspicious-conversation) — instant, no inference latency, clearly
   labeled `DEMO / SIMULATED DATA`.
3. Switch to **Detect** → upload a real WAV/MP3/FLAC file → watch the
   11-stage pipeline run live → land on the Analysis dashboard: Voice
   Authenticity gauge → Model Signals (Spectrogram/WavLM/Prosody) →
   Segment Timeline → Verification badges → **Final Risk** → **"Why is
   this risky?"** evidence panel.
4. Open **Research Lab → Models** to show model cards and honest
   "Not documented." fields where real training info doesn't exist.
5. Open **Research Lab → Experiments** → run with sample scores to show
   the real EER/ROC-AUC/F1 computation pipeline, then explain that a real
   run needs an actual ASVspoof protocol (`docs/research/asvspoof.md`).
6. Back on the analysis page, click **Download Report** for the PDF.
7. Closing line: *"Possible AI-generated impersonation + social
   engineering attempt — not 'Scam Confirmed.' We show our work."*

## 5. What's implemented vs. simulated

**Implemented (real code, real math, runs locally):**
- Audio validation, decoding, resampling, normalization
- Fixed-window segmentation
- Real spectral feature extraction (librosa) and real prosodic feature
  extraction (pitch/energy/pause/spectral-shape)
- Weighted multi-signal fusion with agreement/uncertainty statistics
- Rule-based OTP and social-engineering pattern detection (regex-based,
  fully auditable, never extracts actual OTP digits)
- Fictional-but-structurally-real organization/branch/caller verification
- Policy-based risk scoring with configurable weights/thresholds
- Evidence generation traced back to its source signal
- PDF report generation
- EER/ROC-AUC/F1/Precision/Recall computation from real `(score, label)`
  arrays (see `ml/evaluation/asvspoof_experiments.py`)
- Live browser-microphone detection over WebSocket
- Full Postgres schema + Alembic migration + Docker Compose

**Simulated until real weights/data are supplied:**
- Spectrogram-CNN and WavLM synthetic-speech scores (deterministic dev
  adapters — see `ml/detectors/*.py` docstrings for exactly what they do
  instead of real inference)
- Speech-to-text (works if `faster-whisper` downloads a model at runtime;
  otherwise transcript is empty, never fabricated)
- ASVspoof benchmark metrics (computed correctly, but only from data you
  provide — no ASVspoof dataset ships with this repo, see
  `docs/research/asvspoof.md`)

## 6. Privacy & security

- No OTP values, passwords, or credentials are ever extracted, logged, or
  stored — `ml/conversation/otp_detector.py` only ever returns the
  *pattern name* that matched, never digits.
- Structured JSON logging redacts any field named like a secret
  (`backend/app/core/logging.py`).
- Uploaded filenames are never trusted for storage paths (path-traversal
  protection in `backend/app/services/storage.py`).
- All demo organizations/branches are explicitly labeled
  `is_fictional_demo_data: true` end-to-end, from the database layer to the UI.

## 7. Known limitations

- No background job queue — analysis runs synchronously in the request.
  Fine for demo-length clips; a Celery/RQ worker is the natural next step
  for production-scale audio.
- Fusion is a configurable weighted average, not a learned meta-model — a
  deliberate transparency trade-off (`docs/research/risk-policy.md`).
- The org/branch/caller extraction from transcript text
  (`_extract_org_claim` in `backend/app/services/pipeline.py`) is a small
  regex heuristic for demo purposes, not an NLP entity extractor.
- Live detection scores voice signal only; conversation/identity checks
  still require the Verify page.

## 8. SIH Pitch

**Problem.** Voice-cloning scams increasingly combine a synthetic voice
with a false organizational identity and urgency-based social engineering
to extract OTPs and credentials. Deepfake-voice detectors alone answer only
one-third of the real question.

**Solution.** VoiceShield-AI fuses voice forensics with caller/organization
verification and conversation-pattern analysis into one explainable risk
score, so the output is never just a number — it's a traceable case file.

**Innovation.** Multi-signal fusion with explicit model-agreement
reporting; a risk engine that requires corroborating signals (not just one
strong detector) to reach CRITICAL; evidence items that link back to the
exact segment/model/verification source that produced them; and a research
lab that treats "no data yet" as a valid, honestly-labeled state instead of
filling the gap with invented numbers.

**Technical architecture.** Next.js/TypeScript frontend, FastAPI/Python
backend, a framework-agnostic `ml/` package with replaceable interfaces for
every model, PostgreSQL, and Docker Compose — cloneable and runnable by any
student team.

**Impact.** A tool a bank, telecom, or individual could plausibly use to
triage suspicious calls, backed by a design that refuses to overstate its
own certainty.

**Scalability.** Swap the storage backend to S3, add a job queue for
concurrent analysis, and swap any detector for a production-trained
checkpoint — none of it requires touching the API or frontend contracts.

**Research value.** Every model ships with a model card; every experiment
is reproducible and versioned; ASVspoof integration is a real, documented
contract rather than a hardcoded number.

**Future scope.** Real-time telephony integration (with appropriate legal/
consent frameworks), a learned fusion meta-model trained on labeled
incident data, multilingual conversation-pattern detection, and
NLP-based (rather than regex-based) organization/OTP extraction.
