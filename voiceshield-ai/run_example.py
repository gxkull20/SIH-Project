"""
VoiceShield-AI — Quick Run Example Script
-----------------------------------------
This script demonstrates the complete VoiceShield-AI workflow:
1. Verifies the backend server is active.
2. Checks organization & caller verification.
3. Uploads and analyzes a sample voice recording.
4. Prints the risk assessment and explainable evidence.
5. Downloads the generated audit PDF report.
6. Provides the direct URL to inspect in the web browser.
"""

import os
import sys
import requests

API_URL = os.environ.get("API_URL", "http://127.0.0.1:8000")
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")

def main():
    print("=" * 60)
    print("   VoiceShield-AI — Live Workflow Demonstration")
    print("=" * 60)

    # 1. Health check
    print(f"\n[1/5] Checking backend server at {API_URL}...")
    try:
        r = requests.get(f"{API_URL}/health", timeout=5)
        r.raise_for_status()
        print("      Backend is ONLINE:", r.json())
    except Exception as e:
        print(f"      ERROR: Could not reach backend at {API_URL}.")
        print("      Please make sure the backend is running with:")
        print("      cd backend && .\\.venv\\Scripts\\uvicorn app.main:app --port 8000")
        sys.exit(1)

    # 2. Caller verification check
    print("\n[2/5] Testing Caller Verification Directory...")
    payload = {
        "claimed_organization": "Demo Bank",
        "claimed_branch": "Chennai",
        "claimed_city": "Chennai",
        "caller_id": "+91-DEMO-1000",
    }
    r = requests.post(f"{API_URL}/api/verify/caller", json=payload)
    v_data = r.json()
    print(f"      Organization State: {v_data['organization']['state'].upper()}")
    print(f"      Branch State:       {v_data['branch']['state'].upper()}")
    print(f"      Caller ID State:    {v_data['caller']['state'].upper()}")

    # 3. Audio analysis upload
    sample_path = os.path.join(os.path.dirname(__file__), "samples", "sample_bank_call.wav")
    print(f"\n[3/5] Uploading sample audio: {sample_path}...")
    if not os.path.exists(sample_path):
        print(f"      ERROR: Sample file not found at {sample_path}")
        sys.exit(1)

    with open(sample_path, "rb") as f:
        r = requests.post(
            f"{API_URL}/api/analyze/upload",
            files={"file": ("sample_bank_call.wav", f, "audio/wav")},
            data={
                "claimed_organization": "Demo Bank",
                "claimed_branch": "Chennai",
                "caller_id": "+91-DEMO-1000",
            },
        )
    r.raise_for_status()
    analysis = r.json()
    session_id = analysis["session_id"]
    risk = analysis.get("risk", {})
    fusion = analysis.get("fusion", {})
    evidence = analysis.get("evidence", [])

    print(f"      Analysis Complete! Session ID: {session_id}")
    print(f"      Duration:         {analysis['audio']['duration_s']}s")
    print(f"      Synthetic Speech: {fusion.get('synthetic_likelihood', 0)*100:.1f}%")
    print(f"      Human Likelihood: {fusion.get('human_likelihood', 0)*100:.1f}%")
    print(f"      Model Agreement:  {fusion.get('model_agreement', 0)*100:.1f}%")
    print(f"      Final Risk Score: {risk.get('risk_score')}/100 ({risk.get('risk_level')})")
    print(f"      Recommendation:   {risk.get('recommendation')}")

    # 4. Explainable Evidence
    print(f"\n[4/5] Explainable Evidence Items ({len(evidence)}):")
    for idx, item in enumerate(evidence, start=1):
        print(f"      {idx}. [{item.get('category')}] {item.get('title')}:")
        print(f"         {item.get('description')}")

    # 5. Download PDF Report
    print(f"\n[5/5] Downloading PDF Report...")
    report_url = f"{API_URL}/api/reports/{session_id}"
    rep = requests.get(report_url)
    pdf_filename = f"report_{session_id[:8]}.pdf"
    with open(pdf_filename, "wb") as f:
        f.write(rep.content)
    print(f"      Report saved as: {pdf_filename} ({len(rep.content):,} bytes)")

    print("\n" + "=" * 60)
    print("   Success! View the full interactive dashboard at:")
    print(f"   {FRONTEND_URL}/analysis/{session_id}")
    print("=" * 60 + "\n")

if __name__ == "__main__":
    main()
