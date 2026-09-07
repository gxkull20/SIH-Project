# VoiceShield AI — Multi-Model Voice Forensics & Scam Defense System

> **Smart India Hackathon (SIH) Innovation Project**  
> Real-time voice biometrics, synthetic deepfake audio detection, caller verification, and scam simulation defense engine.

---

## 🚀 Quick Links & Deployment

- **GitHub Repository**: [gxkull20/SIH-Project](https://github.com/gxkull20/SIH-Project)
- **Frontend Live on Vercel**: `https://sih-project-mocha-zeta.vercel.app`
- **Architecture**: Hybrid Next.js 14 App Router (Frontend) + FastAPI / PyTorch ML Service (Backend)

---

## ⚡ Vercel Deployment Configuration

All project files are now hosted directly at the repository root level.

### Quick Configuration on Vercel Dashboard

1. **Set Root Directory**:
   - Go to your Project on [Vercel Dashboard](https://vercel.com/dashboard) ➔ **Settings** ➔ **General**.
   - Under **Root Directory**, click **Edit**.
   - Set the root directory to:
     ```text
     frontend
     ```
   - Click **Save**.

2. **Trigger Build / Redeploy**:
   - Go to the **Deployments** tab.
   - Click the three dots (`...`) on the latest deployment ➔ select **Redeploy** (or simply push a commit to `main`).
   - Vercel automatically detects **Next.js**, installs dependencies, runs `next build`, and publishes the live site.

### Optional: Connect Live Python ML Backend

By default, the deployed frontend includes standalone simulation and fallback telemetry for interactive live demos. To connect the live FastAPI ML pipeline:
1. Deploy `backend` on Render, Railway, or Fly.io using `backend/Dockerfile` (or Python 3.11).
2. On Vercel ➔ **Settings** ➔ **Environment Variables**, add:
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend-service.onrender.com
   ```
3. Redeploy. All `/api/*` requests will be securely proxied to your Python service.

---

## 📁 Repository Structure

```text
SIH-Project/
├── frontend/                 # Next.js 14 App Router, Tailwind CSS, Recharts, WaveSurfer
│   ├── app/                  # Routes: /simulate, /verify, /detect, /research, etc.
│   ├── components/           # UI Badges, Audio Visualizers, HUD Cards
│   ├── lib/                  # API clients & fallbacks
│   ├── package.json          # Frontend dependencies & Next 14 scripts
│   ├── vercel.json           # Vercel security headers & presets
│   └── yarn.lock             # Deterministic build lockfile
├── backend/                  # FastAPI async server & REST API
│   ├── app/                  # Endpoints: /analyze, /verify, /simulate, /models
│   ├── requirements.txt      # Python dependencies
│   └── Dockerfile            # Container recipe for cloud hosting
├── ml/                       # Multi-model ensemble (AASIST, Wav2Vec2, SpecCNN, Whisper)
├── samples/                  # Real & synthetic audio test samples
├── docs/                     # System architecture and evaluation reports
├── docker/                   # Docker compose files
├── VERCEL_DEPLOYMENT_GUIDE.md# Step-by-step Vercel deployment walkthrough
├── PROTOTYPE_GUIDE.md        # Comprehensive prototype walkthrough
├── run_local.bat             # 1-click Windows local runner
└── run_local.ps1             # PowerShell local runner
```

---

## 💻 Local Development

To run the complete system locally:

```powershell
# Double-click run_local.bat or in PowerShell:
.\run_local.ps1
```

Or run individual services manually:

```powershell
# In frontend/:
cd frontend
bun install   # or npm install
bun run dev   # Runs at http://localhost:3000

# In backend/:
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
