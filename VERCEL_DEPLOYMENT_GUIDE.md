# VoiceShield AI — Complete Deployment Guide (Vercel & Cloud)

This guide walks you through deploying **VoiceShield AI** to production:
1. **Frontend (Next.js 14)** ➔ Deployed on **Vercel** (Global Edge CDN, High Performance)
2. **Backend (FastAPI + Forensics ML Engine)** ➔ Deployed on **Render / Railway / Fly.io / Hugging Face Spaces**
3. **Environment Connection** ➔ Linking frontend to the backend via `NEXT_PUBLIC_API_URL`

---

## Architecture Overview

```
                        ┌─────────────────────────────────────────┐
                        │              User Browser               │
                        └───────────────────┬─────────────────────┘
                                            │
                    ┌───────────────────────┴───────────────────────┐
                    ▼                                               ▼
         ┌─────────────────────┐                         ┌─────────────────────┐
         │   Vercel (Edge)     │                         │   Cloud Backend     │
         │  Next.js 14 Frontend│                         │  FastAPI + PyTorch  │
         │                     │                         │  ML Forensics & DB  │
         │ • In-Call Simulator │    /api/* Proxies /     │                     │
         │ • Verification UI   │ ──────────────────────> │ • Voice Anti-Spoof  │
         │ • Risk Meter & HUD  │   NEXT_PUBLIC_API_URL   │ • Identity Registry │
         │ • Research Lab      │                         │ • WebSocket Streams │
         └─────────────────────┘                         └─────────────────────┘
```

> **Why split frontend & backend?**
> Next.js runs natively on Vercel's serverless edge infrastructure. Python ML dependencies (`torch`, `librosa`, `scipy`, neural checkpoints) exceed Vercel's 50MB function bundle limit and require a persistent Python container.

---

## Part 1: Deploying the Frontend to Vercel (3 Minutes)

Because this repository houses both frontend and backend in subdirectories, **the single most important setting is configuring the Root Directory**.

### Step 1: Open Vercel Dashboard
1. Go to [vercel.com](https://vercel.com) and sign in with your GitHub account.
2. Click **"Add New..."** ➔ **"Project"**.

### Step 2: Import Your GitHub Repository
1. Under **"Import Git Repository"**, find:
   ```
   gxkull20/SIH-Project
   ```
2. Click **"Import"**.

### Step 3: Set Root Directory (CRITICAL STEP ⚠️)
1. On the project configuration screen, locate **Root Directory**.
2. Click the **"Edit"** button.
3. Select or type:
   ```
   voiceshield-ai/frontend
   ```
4. Click **"Continue"**.

### Step 4: Verify Build Settings
Vercel will automatically detect Next.js:
- **Framework Preset**: `Next.js`
- **Build Command**: `next build` (or `bun run build`)
- **Output Directory**: `.next`
- **Install Command**: `yarn install` or `bun install`

### Step 5: Configure Environment Variables (Optional initially)
Expand the **Environment Variables** section:

| Variable Name | Value | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://your-backend.onrender.com` | Live backend URL (if deployed) |
| `NEXT_PUBLIC_WS_URL` | `wss://your-backend.onrender.com/api/live/stream` | Live WebSocket endpoint |

*(If you haven't deployed the backend yet, leave them blank! The frontend has built-in offline simulation and fallback presets that allow full testing of the UI, phone simulator, and caller verification badges.)*

### Step 6: Click "Deploy"
1. Click the blue **"Deploy"** button.
2. In about ~45 seconds, Vercel will complete the build and present your live deployment URL (e.g. `https://sih-project-xxxx.vercel.app`)!

---

## Part 2: Deploying the FastAPI Backend (Free on Render)

To connect the live audio analysis and PyTorch models to your Vercel frontend:

### Step 1: Create a Free Web Service on Render
1. Go to [render.com](https://render.com) and sign up / log in with GitHub.
2. Click **"New +"** ➔ **"Web Service"**.
3. Select your repository: `gxkull20/SIH-Project`.

### Step 2: Configure Service Settings
- **Name**: `voiceshield-backend`
- **Region**: Nearest to your users (e.g., Singapore, Frankfurt, or Oregon)
- **Branch**: `main`
- **Root Directory**: `voiceshield-ai`
- **Runtime**: `Python 3` (or `Docker` using `backend/Dockerfile`)
- **Build Command**:
  ```bash
  pip install -r backend/requirements.txt
  ```
- **Start Command**:
  ```bash
  uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT
  ```

### Step 3: Add Environment Variables on Render
Under **Environment Variables**, add:
```
PYTHONPATH = .
PORT = 8000
```

### Step 4: Click "Create Web Service"
Render will build and assign you a public URL such as:
```
https://voiceshield-backend.onrender.com
```

---

## Part 3: Link Vercel Frontend to Render Backend

1. In your **Vercel Dashboard**, open your deployed `sih-project`.
2. Go to **Settings** ➔ **Environment Variables**.
3. Add or update:
   - `NEXT_PUBLIC_API_URL` = `https://voiceshield-backend.onrender.com`
   - `NEXT_PUBLIC_WS_URL` = `wss://voiceshield-backend.onrender.com/api/live/stream`
4. Go to **Deployments** ➔ Click the three dots `...` on your latest deployment ➔ **Redeploy**.

---

## Part 4: Alternative Backend Deployments

| Platform | Deployment Type | Best For |
|---|---|---|
| **Render** | Docker or Python Web Service | Free tier, easiest setup, automatic SSL |
| **Railway** | Docker (uses `backend/Dockerfile`) | Zero-configuration, fast builds |
| **Fly.io** | Container (`fly launch`) | Ultra-low global latency, persistent volumes |
| **Hugging Face Spaces** | Docker Space (Free CPU/T4 GPU) | Best for hosting large open-source ML models |

---

## Live Feature Verification

Once deployed on Vercel, verify these key interactive modules:

- [x] **In-Call Simulator (`/simulate`)**: Experience interactive fraud scenarios, speech synthesis, and real-time HUD defense.
- [x] **Caller Verification Portal (`/verify`)**: Test known vs. spoofed institutional callers with the 5-stage identity verification pipeline.
- [x] **Deepfake Forensics (`/detect`)**: Test preset audio forensics files and live microphone streaming.
- [x] **Forensics Lab & Model Cards (`/research/models`)**: Review scientific integrity, EER metrics, and model limitations.
