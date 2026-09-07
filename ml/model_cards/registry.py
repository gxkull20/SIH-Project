"""
Model cards (Section 37). One card per model, with "Not documented." used
literally wherever real information isn't available — never invented.
"""

from __future__ import annotations

from typing import Any

NOT_DOCUMENTED = "Not documented."

MODEL_CARDS: dict[str, dict[str, Any]] = {
    "spectrogram-cnn": {
        "model_name": "Spectrogram CNN",
        "version": "dev-0.1.0",
        "architecture": "Mel-spectrogram + small CNN classifier (architecture placeholder; "
                          "no trained weights connected in this prototype).",
        "training_data": NOT_DOCUMENTED,
        "input_format": "Mono waveform, 16kHz, 5s segments -> 80-band mel-spectrogram",
        "sampling_rate": "16000 Hz",
        "segment_length": "5s (configurable)",
        "output": "synthetic_likelihood, human_likelihood in [0,1]",
        "training_configuration": NOT_DOCUMENTED,
        "evaluation_dataset": NOT_DOCUMENTED,
        "metrics": {"EER": None, "ROC_AUC": None, "F1": None, "Precision": None, "Recall": None},
        "known_limitations": [
            "No trained checkpoint is connected by default — runs in Development/Simulation Mode.",
            "Even once trained, spectrogram-only detectors are known to be sensitive to recording "
            "conditions and compression artifacts.",
        ],
        "known_failure_cases": NOT_DOCUMENTED,
        "language_considerations": NOT_DOCUMENTED,
        "noise_considerations": "Not evaluated for noisy/telephony-band audio in this prototype.",
        "replay_limitations": NOT_DOCUMENTED,
    },
    "wavlm-base-plus-antispoof": {
        "model_name": "WavLM Base+ (anti-spoofing head)",
        "version": "dev-0.1.0",
        "architecture": "microsoft/wavlm-base-plus backbone + linear anti-spoofing head "
                          "(head weights not connected in this prototype).",
        "training_data": NOT_DOCUMENTED,
        "input_format": "Mono waveform, 16kHz",
        "sampling_rate": "16000 Hz",
        "segment_length": "5s (configurable)",
        "output": "synthetic_likelihood, human_likelihood in [0,1]",
        "training_configuration": NOT_DOCUMENTED,
        "evaluation_dataset": NOT_DOCUMENTED,
        "metrics": {"EER": None, "ROC_AUC": None, "F1": None, "Precision": None, "Recall": None},
        "known_limitations": [
            "No fine-tuned checkpoint is connected by default — runs in Development/Simulation Mode.",
            "WavLM backbone alone (without a fine-tuned anti-spoofing head) is not a spoof detector.",
        ],
        "known_failure_cases": NOT_DOCUMENTED,
        "language_considerations": NOT_DOCUMENTED,
        "noise_considerations": NOT_DOCUMENTED,
        "replay_limitations": NOT_DOCUMENTED,
    },
    "acoustic-prosody-analyzer": {
        "model_name": "Acoustic/Prosodic Analyzer",
        "version": "0.1.0",
        "architecture": "Deterministic DSP feature extraction (librosa) + weak hand-tuned heuristic "
                          "scoring rule. Not a trained classifier.",
        "training_data": "N/A — rule-based, not trained.",
        "input_format": "Mono waveform, 16kHz",
        "sampling_rate": "16000 Hz",
        "segment_length": "5s (configurable)",
        "output": "pitch/energy/pause/spectral features + a weak heuristic synthetic_likelihood",
        "training_configuration": "N/A",
        "evaluation_dataset": NOT_DOCUMENTED,
        "metrics": {"EER": None, "ROC_AUC": None, "F1": None, "Precision": None, "Recall": None},
        "known_limitations": [
            "The heuristic score is illustrative only and has not been validated against any "
            "labeled dataset.",
            "No single prosodic feature is proof of synthetic speech.",
        ],
        "known_failure_cases": NOT_DOCUMENTED,
        "language_considerations": "Pitch-tracking (pyin) performance varies by language and speaker.",
        "noise_considerations": "Sensitive to background noise; not evaluated systematically.",
        "replay_limitations": NOT_DOCUMENTED,
    },
    "fusion-engine": {
        "model_name": "Weighted Signal Fusion Engine",
        "version": "0.1.0",
        "architecture": "Configurable weighted average of available detector outputs, plus "
                          "agreement/uncertainty statistics. Not a learned meta-model.",
        "training_data": "N/A — rule-based fusion, not trained.",
        "input_format": "List of DetectorPrediction objects",
        "sampling_rate": "N/A",
        "segment_length": "N/A",
        "output": "fused synthetic_likelihood, model_agreement, uncertainty",
        "training_configuration": "N/A",
        "evaluation_dataset": NOT_DOCUMENTED,
        "metrics": {"EER": None, "ROC_AUC": None, "F1": None, "Precision": None, "Recall": None},
        "known_limitations": [
            "A weighted average cannot capture nonlinear interactions between signals the way a "
            "learned meta-model could — a documented, deliberate trade-off for transparency.",
        ],
        "known_failure_cases": NOT_DOCUMENTED,
        "language_considerations": "N/A",
        "noise_considerations": "N/A",
        "replay_limitations": NOT_DOCUMENTED,
    },
}


def get_model_card(model_key: str) -> dict[str, Any] | None:
    return MODEL_CARDS.get(model_key)


def list_model_cards() -> list[dict[str, Any]]:
    return list(MODEL_CARDS.values())
