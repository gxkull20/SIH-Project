# 🛡️ VoiceShield-AI — Prototype & Presentation Guide

> **Smart India Hackathon (SIH) Demo Script & Technical Architecture**  
> *"Detect. Verify. Explain."*

---

## 1. Executive Summary

Traditional deepfake voice detectors fail in real-world fraud because they attempt to answer only one question: *"Is this voice audio synthetically generated?"* 

In real fraud attacks against citizens and banking clients:
- Scammers combine **AI voice clones** with **caller ID spoofing** and **psychological manipulation** (urgency, threats, panic).
- Mobile telephony compresses audio (8kHz AMR-WB / G.711), degrading single-model acoustic classifiers.
- Victims cannot act on a mysterious "87% fake" score without explainable context.

**VoiceShield-AI solves this through a 3-Pillar Explainable Security Defense**:
1. **Multi-Model Voice Forensics**: Tri-model fusion (Mel-Spectrogram CNN + WavLM transformer embeddings + Librosa DSP Prosody metrics).
2. **Conversation Intelligence**: Real-time pattern detection for OTP solicitation, credential theft, and manufactured urgency.
3. **Enterprise Identity Verification**: Multi-factor registry checks matching claimed Organization, Branch city, and Caller ID against authoritative databases.

All three layers feed into a **Policy-Driven Risk Engine (0–100 score)** with an auditable evidence trail and downloadable PDF forensic reports.

---

## 2. The 90-Second Live Demonstration Script

### Step 1: Launch the Prototype (5 seconds)
1. Double click `run_local.bat` (or run `python run_local.py`).
2. Both the FastAPI backend and Next.js frontend start simultaneously, and your browser opens to `http://localhost:3000`.

### Step 2: In-Call Smartphone Co-Pilot (`/simulate`) (35 seconds)
1. Click **"Call Simulator"** in the top navigation bar.
2. Select **"Bank KYC & Urgent Card Block Scam"**:
   - Show the smartphone simulator ringing from *"Rajesh V. (Central Fraud Cell)"*.
   - Point out the **In-Call Co-Pilot HUD** on the right:
     - **Voice Forensics**: Flags `86% Synthetic Speech` (Voice cloning detected).
     - **Branch Record**: Flags `INCONSISTENT` (claimed Delhi branch does not match known demo bank records).
     - **Caller ID**: Flags `UNVERIFIED`.
   - Click the green **"Answer Call"** button. Listen to the simulated caller dialogue demanding a cancellation OTP.
   - Click the suspicious response: *"Which branch are you calling from?"* Watch the caller escalate pressure and the Co-Pilot HUD generate real-time red warning banners:
     `🚨 CRITICAL: Caller is actively soliciting an OTP / verification code!`
3. Switch to **"Legitimate Bank Call (Control Case)"**:
   - Show that a genuine call has `Verified Org`, `Verified Branch`, `Human Speech (8% synthetic)`, and `LOW RISK (0/100)` — demonstrating that VoiceShield does not trigger false alarms.

### Step 3: 1-Click Forensic Deep-Dive (`/detect`) (30 seconds)
1. Click **"Detect"** in the navigation bar.
2. Under **"⚡ Quick Demo Presets (1-Click Evaluation)"**, click **"Analyze Suspicious Impersonation Call"**.
3. Watch the animated **11-Stage Forensic Pipeline** run live:
   `Upload → Preprocess → Segment → Spectrogram/WavLM/Prosody → Fusion → Transcribe → OTP Analysis → Org Verification → Risk Engine → Report`
4. Arrive at the **Analysis Dashboard (`/analysis/[id]`)**:
   - **Voice Authenticity Gauge**: Fused probability with calibrated uncertainty.
   - **Model Signals**: Shows Mel-Spectrogram CNN, WavLM embeddings, and **Acoustic Prosody DSP** metrics (F0 pitch jitter, Wiener spectral flatness, pause ratio, speaking rate).
   - **Segment Timeline**: Shows the audio waveform segmented with per-chunk classifications.
   - **Verification Badges**: Organization, Branch, and Caller ID verification statuses.
   - **Forensic Evidence Trail**: Clear list of corroborated facts backing the verdict.
5. Click **"Download Report"** to show the generated PDF forensic incident report.

### Step 4: Scientific Integrity & Research Lab (`/research`) (20 seconds)
1. Click **"Research Lab"**.
2. Show the **Model Cards**: Transparent documentation of architecture, training data (ASVspoof), limitations, and ethical considerations.
3. Show the **Experiment Runner**: Demonstrates scientific rigor where evaluators can benchmark detection thresholds.

---

## 3. Technical Architecture Overview

```
                          ┌────────────────────────┐
                          │   Audio Input / Call   │
                          └───────────┬────────────┘
                                      │
           ┌──────────────────────────┼──────────────────────────┐
           │                          │                          │
           ▼                          ▼                          ▼
   [Voice Forensics]       [Conversation Intel]       [Caller Verification]
   • Mel-Spectrogram CNN   • OTP Keyword Regex        • Organization Match
   • WavLM Representation  • Credential Harvesting    • Branch Consistency
   • Prosody DSP (Librosa) • Urgency / Extortion      • Caller ID Registry
           │                          │                          │
           ▼                          ▼                          ▼
   [Weighted Fusion]       [Risk Signals Extractor]   [Identity State]
           │                          │                          │
           └──────────────────────────┼──────────────────────────┘
                                      ▼
                        ┌───────────────────────────┐
                        │    Policy Risk Engine     │
                        │  (Weighted 0 - 100 Score) │
                        └─────────────┬─────────────┘
                                      │
                                      ▼
                        ┌───────────────────────────┐
                        │    Explanation Engine     │
                        │  • Evidence Trail Items   │
                        │  • Forensic PDF Report    │
                        │  • In-Call Shield HUD     │
                        └───────────────────────────┘
```

---

## 4. Key Questions & Judge Talking Points

| Question | Winning Response |
| :--- | :--- |
| **"Why not just use a single deep learning model?"** | A single model is fragile against telephony transcoding and adversarial noise. By fusing acoustic spectral features, transformer embeddings, and physical prosody DSP with conversational and identity signals, VoiceShield eliminates single points of failure. |
| **"What if the caller ID is spoofed?"** | VoiceShield explicitly treats caller ID as an *untrusted claim*. Even if a scammer spoofs the bank's real phone number, the voice forensics and OTP solicitation alerts will immediately flag the call as High/Critical risk. |
| **"Does this invade privacy by recording calls?"** | No. The OTP detector never stores or returns numerical authentication digits. All conversational rules check for pattern intent, not confidential data. |
| **"Can real model weights be connected?"** | Yes! The architecture is modular: setting `SPECTROGRAM_MODEL_PATH` or `WAVLM_MODEL_PATH` immediately plugs in real trained PyTorch checkpoints with zero code modifications. |

---

## 5. Prototype Commands Quick Reference

| Action | Command |
| :--- | :--- |
| **Launch Everything** | `run_local.bat` or `python run_local.py` |
| **Frontend URL** | `http://localhost:3000` |
| **Call Simulator** | `http://localhost:3000/simulate` |
| **Audio Forensics** | `http://localhost:3000/detect` |
| **FastAPI Swagger Docs**| `http://127.0.0.1:8000/docs` |
