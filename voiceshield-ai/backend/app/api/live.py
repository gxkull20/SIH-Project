"""
Live detection (Section 33).

Browser mic -> audio chunks (base64 PCM16, 16kHz mono) -> WebSocket ->
buffer into ~5s windows -> run the same detector stack used for uploads ->
stream back per-window results.

Clearly labeled: this only ever analyzes audio captured by the browser's
own microphone. It makes no claim about telephone network interception.
"""

from __future__ import annotations

import base64
import json
import uuid

import numpy as np
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.core.config import settings
from ml.detectors.spectrogram_detector import SpectrogramDetector
from ml.detectors.wavlm_detector import WavLMDetector
from ml.detectors.prosody_analyzer import ProsodyAnalyzer
from ml.fusion.fusion_engine import WeightedFusionEngine, DEFAULT_WEIGHTS
from ml.risk_engine import PolicyRiskEngine

router = APIRouter(prefix="/api/live", tags=["live"])

_spectrogram_detector = SpectrogramDetector()
_wavlm_detector = WavLMDetector()
_prosody_analyzer = ProsodyAnalyzer()
_fusion_engine = WeightedFusionEngine()
_risk_engine = PolicyRiskEngine()

WINDOW_SECONDS = 5.0


@router.websocket("/stream")
async def live_stream(websocket: WebSocket):
    await websocket.accept()
    session_id = f"live-{uuid.uuid4().hex[:8]}"
    sample_rate = settings.DEFAULT_SAMPLE_RATE
    buffer = np.zeros(0, dtype=np.float32)
    window_samples = int(WINDOW_SECONDS * sample_rate)
    segment_index = 0

    await websocket.send_json({
        "type": "session_started",
        "session_id": session_id,
        "note": "Browser microphone live analysis. This does not intercept telephone calls.",
    })

    try:
        while True:
            raw = await websocket.receive_text()
            try:
                message = json.loads(raw)
            except json.JSONDecodeError:
                await websocket.send_json({"type": "error", "message": "Invalid message format."})
                continue

            if message.get("type") == "stop":
                break

            if message.get("type") != "audio_chunk":
                continue

            try:
                pcm_bytes = base64.b64decode(message["data"])
                chunk = np.frombuffer(pcm_bytes, dtype=np.int16).astype(np.float32) / 32768.0
            except Exception:
                await websocket.send_json({"type": "error", "message": "Could not decode audio chunk."})
                continue

            buffer = np.concatenate([buffer, chunk])

            while len(buffer) >= window_samples:
                window = buffer[:window_samples]
                buffer = buffer[window_samples:]
                segment_id = f"{session_id}-seg-{segment_index:03d}"

                rms = float(np.sqrt(np.mean(window ** 2))) if len(window) > 0 else 0.0
                if rms < 0.003:
                    # Ambient silence / room pause — return low neutral score without pseudo-spikes
                    await websocket.send_json({
                        "type": "segment_result",
                        "segment_index": segment_index,
                        "is_silence": True,
                        "rms": round(rms, 5),
                        "message": "Ambient silence or pause detected. Listening for active voice...",
                        "predictions": [
                            {
                                "model_name": "spectrogram-cnn",
                                "model_version": _spectrogram_detector.model_version,
                                "status": "simulated",
                                "synthetic_likelihood": 0.05,
                                "human_likelihood": 0.95,
                                "message": "Low energy / background silence",
                            },
                            {
                                "model_name": "wavlm-base-plus-antispoof",
                                "model_version": _wavlm_detector.model_version,
                                "status": "simulated",
                                "synthetic_likelihood": 0.05,
                                "human_likelihood": 0.95,
                                "message": "Low energy / background silence",
                            },
                            {
                                "model_name": "acoustic-prosody-analyzer",
                                "model_version": _prosody_analyzer.model_version,
                                "status": "simulated",
                                "synthetic_likelihood": 0.05,
                                "human_likelihood": 0.95,
                                "message": "Low energy / background silence",
                            },
                        ],
                        "fusion": {
                            "synthetic_likelihood": 0.05,
                            "human_likelihood": 0.95,
                            "model_agreement": 0.95,
                            "uncertainty": 0.1,
                            "contributing_models": ["spectrogram-cnn", "wavlm-base-plus-antispoof", "acoustic-prosody-analyzer"],
                            "unavailable_models": [],
                            "any_simulated": True,
                            "weights_used": DEFAULT_WEIGHTS,
                        },
                        "risk": {
                            "risk_score": 5.0,
                            "risk_level": "LOW",
                            "risk_factors": ["Ambient silence detected — waiting for user speech."],
                            "recommendation": "Speak clearly into your microphone to evaluate live voice authenticity.",
                        },
                    })
                    segment_index += 1
                    continue

                preds = [
                    _spectrogram_detector.timed_predict(segment_id, window, sample_rate),
                    _wavlm_detector.timed_predict(segment_id, window, sample_rate),
                    _prosody_analyzer.timed_predict(segment_id, window, sample_rate),
                ]
                fusion_result = _fusion_engine.fuse(preds, DEFAULT_WEIGHTS)

                # Live microphone mode evaluates voice authenticity directly.
                # Identity/organization checks are marked not_applicable so
                # unverified caller ID rules do not create false positives on raw mic input.
                risk_result = _risk_engine.score(
                    fusion_result=fusion_result,
                    conversation_result={"conversation_risk_hint": "low", "signal_counts": {}},
                    verification_result={
                        "organization": {"state": "not_applicable"},
                        "branch": {"state": "not_applicable"},
                        "caller": {"state": "not_applicable"},
                    },
                    weights={
                        "voice_weight": 1.0,
                        "conversation_weight": 0.0,
                        "identity_weight": 0.0,
                        "context_weight": 0.0,
                    },
                )

                await websocket.send_json({
                    "type": "segment_result",
                    "segment_index": segment_index,
                    "is_silence": False,
                    "rms": round(rms, 5),
                    "predictions": [p.to_dict() for p in preds],
                    "fusion": fusion_result,
                    "risk": risk_result,
                })
                segment_index += 1

    except WebSocketDisconnect:
        pass
    finally:
        try:
            await websocket.close()
        except Exception:
            pass
