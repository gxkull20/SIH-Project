"""
Demo mode (Section 43).

Every value below is precomputed and explicitly labeled as demo/simulated
data — never presented as a live scientific measurement. Judges can switch
scenarios instantly with no ML inference latency.
"""

from __future__ import annotations

from fastapi import APIRouter

router = APIRouter(prefix="/api/demo", tags=["demo"])

_SCENARIOS = {
    "scenario_1_human_low_risk": {
        "label": "Human voice / low risk",
        "is_demo_data": True,
        "fusion": {
            "synthetic_likelihood": 0.08, "human_likelihood": 0.92, "model_agreement": 0.93,
            "uncertainty": 0.12, "contributing_models": ["spectrogram-cnn", "wavlm-base-plus-antispoof",
            "acoustic-prosody-analyzer"], "unavailable_models": [], "any_simulated": True,
            "weights_used": {"spectrogram-cnn": 0.35, "wavlm-base-plus-antispoof": 0.45,
                              "acoustic-prosody-analyzer": 0.20},
        },
        "conversation": {"signals": [], "signal_counts": {}, "conversation_risk_hint": "low",
                          "otp_detection": {"detected": False, "matches": []}},
        "verification": {
            "organization": {"state": "verified", "matched_organization": "Demo Bank", "is_fictional_demo_data": True},
            "branch": {"state": "verified", "matched_city": "Coimbatore", "is_fictional_demo_data": True},
            "caller": {"state": "requires_independent_verification", "caller_id_known": True},
        },
        "risk": {"risk_score": 12.0, "risk_level": "LOW", "risk_factors": [],
                 "recommendation": "No immediate action required. Continue normal verification practices."},
        "evidence": [
            {"id": "demo-1a", "category": "VOICE", "severity": "info",
             "title": "Voice signal consistent with human speech",
             "description": "Fused models estimate a low (8%) synthetic-speech likelihood.",
             "source": "FusionEngine", "segment_id": None, "timestamp_s": None, "model_name": None},
        ],
    },
    "scenario_2_synthetic_suspicious": {
        "label": "Synthetic voice / suspicious",
        "is_demo_data": True,
        "fusion": {
            "synthetic_likelihood": 0.81, "human_likelihood": 0.19, "model_agreement": 0.74,
            "uncertainty": 0.31, "contributing_models": ["spectrogram-cnn", "wavlm-base-plus-antispoof",
            "acoustic-prosody-analyzer"], "unavailable_models": [], "any_simulated": True,
            "weights_used": {"spectrogram-cnn": 0.35, "wavlm-base-plus-antispoof": 0.45,
                              "acoustic-prosody-analyzer": 0.20},
        },
        "conversation": {"signals": [], "signal_counts": {}, "conversation_risk_hint": "low",
                          "otp_detection": {"detected": False, "matches": []}},
        "verification": {
            "organization": {"state": "unknown", "reason": "Claimed organization not found in demo directory."},
            "branch": {"state": "unknown"},
            "caller": {"state": "unverified"},
        },
        "risk": {"risk_score": 58.0, "risk_level": "MODERATE", "risk_factors": [
            "Multiple voice-analysis signals indicate possible synthetic speech.",
            "Claimed organization could not be verified.",
        ], "recommendation": "Verify the caller through an independently obtained trusted channel "
                              "before sharing any information."},
        "evidence": [
            {"id": "demo-2a", "category": "VOICE", "severity": "high",
             "title": "Possible synthetic speech signal",
             "description": "Fused voice-analysis models estimate an 81% synthetic-speech likelihood.",
             "source": "FusionEngine", "segment_id": None, "timestamp_s": None, "model_name": None},
            {"id": "demo-2b", "category": "IDENTITY", "severity": "high",
             "title": "Organization could not be verified",
             "description": "Claimed organization not found in demo directory.",
             "source": "OrganizationVerifier", "segment_id": None, "timestamp_s": None, "model_name": None},
        ],
    },
    "scenario_3_synthetic_otp_mismatch": {
        "label": "Synthetic voice + OTP request + organization mismatch",
        "is_demo_data": True,
        "fusion": {
            "synthetic_likelihood": 0.88, "human_likelihood": 0.12, "model_agreement": 0.81,
            "uncertainty": 0.22, "contributing_models": ["spectrogram-cnn", "wavlm-base-plus-antispoof",
            "acoustic-prosody-analyzer"], "unavailable_models": [], "any_simulated": True,
            "weights_used": {"spectrogram-cnn": 0.35, "wavlm-base-plus-antispoof": 0.45,
                              "acoustic-prosody-analyzer": 0.20},
        },
        "conversation": {
            "signals": [{"category": "urgency", "matched_phrase": "immediately",
                         "segment_index": 2, "timestamp_s": 11.4}],
            "signal_counts": {"urgency": 1},
            "conversation_risk_hint": "high",
            "otp_detection": {"detected": True, "matches": [
                {"matched_phrase": "verification code", "pattern_category": "otp_request",
                 "segment_index": 3, "timestamp_s": 14.0,
                 "reason": "Transcript phrase matches known OTP/verification-code request pattern."}
            ]},
        },
        "verification": {
            "organization": {"state": "verified", "matched_organization": "Demo Bank", "is_fictional_demo_data": True},
            "branch": {"state": "inconsistent",
                       "reason": "'Mumbai' is not a known branch of Demo Bank in the demo directory.",
                       "is_fictional_demo_data": True},
            "caller": {"state": "unverified"},
        },
        "risk": {"risk_score": 87.5, "risk_level": "CRITICAL", "risk_factors": [
            "Multiple voice-analysis signals indicate possible synthetic speech.",
            "Sensitive authentication (OTP/credential) request detected in conversation.",
            "Organization/branch information is inconsistent with known records.",
            "Caller identity is unverified.",
        ], "recommendation": "Do not share any authentication secrets. End the call and independently "
                              "contact the organization using a number you already trust, not one "
                              "provided by the caller."},
        "evidence": [
            {"id": "demo-3a", "category": "VOICE", "severity": "high",
             "title": "Possible synthetic speech signal",
             "description": "Fused voice-analysis models estimate an 88% synthetic-speech likelihood.",
             "source": "FusionEngine", "segment_id": None, "timestamp_s": None, "model_name": None},
            {"id": "demo-3b", "category": "CONVERSATION", "severity": "high",
             "title": "Sensitive authentication request detected",
             "description": "Transcript phrase \"verification code\" matches a known otp request pattern.",
             "source": "OTPDetector", "segment_id": None, "timestamp_s": 14.0, "model_name": None},
            {"id": "demo-3c", "category": "IDENTITY", "severity": "high",
             "title": "Branch/location inconsistency",
             "description": "'Mumbai' is not a known branch of Demo Bank in the demo directory.",
             "source": "BranchVerifier", "segment_id": None, "timestamp_s": None, "model_name": None},
            {"id": "demo-3d", "category": "CONTEXT", "severity": "critical",
             "title": "Multiple independent risk factors present",
             "description": "Voice, conversation, and identity signals combine to produce an overall "
                            "CRITICAL risk classification under the current policy thresholds.",
             "source": "RiskEngine", "segment_id": None, "timestamp_s": None, "model_name": None},
        ],
    },
    "scenario_4_human_suspicious_conversation": {
        "label": "Human voice + suspicious conversation",
        "is_demo_data": True,
        "fusion": {
            "synthetic_likelihood": 0.14, "human_likelihood": 0.86, "model_agreement": 0.9,
            "uncertainty": 0.15, "contributing_models": ["spectrogram-cnn", "wavlm-base-plus-antispoof",
            "acoustic-prosody-analyzer"], "unavailable_models": [], "any_simulated": True,
            "weights_used": {"spectrogram-cnn": 0.35, "wavlm-base-plus-antispoof": 0.45,
                              "acoustic-prosody-analyzer": 0.20},
        },
        "conversation": {
            "signals": [
                {"category": "bypass_channel", "matched_phrase": "keep this confidential",
                 "segment_index": 1, "timestamp_s": 6.2},
                {"category": "authority_claim", "matched_phrase": "this is an official",
                 "segment_index": 0, "timestamp_s": 1.0},
            ],
            "signal_counts": {"bypass_channel": 1, "authority_claim": 1},
            "conversation_risk_hint": "high",
            "otp_detection": {"detected": True, "matches": [
                {"matched_phrase": "OTP", "pattern_category": "otp_request",
                 "segment_index": 2, "timestamp_s": 9.5,
                 "reason": "Transcript phrase matches known OTP/verification-code request pattern."}
            ]},
        },
        "verification": {
            "organization": {"state": "verified", "matched_organization": "Demo Telecom", "is_fictional_demo_data": True},
            "branch": {"state": "verified", "matched_city": "Chennai", "is_fictional_demo_data": True},
            "caller": {"state": "unverified"},
        },
        "risk": {"risk_score": 62.0, "risk_level": "HIGH", "risk_factors": [
            "Sensitive authentication (OTP/credential) request detected in conversation.",
            "Conversation contains bypass channel language.",
            "Conversation contains authority claims language.",
            "Caller identity is unverified.",
        ], "recommendation": "Do not share OTPs, passwords or account details. Verify the caller "
                              "through an independently obtained trusted channel and consider ending "
                              "the call."},
        "evidence": [
            {"id": "demo-4a", "category": "CONVERSATION", "severity": "high",
             "title": "Sensitive authentication request detected",
             "description": "Transcript phrase \"OTP\" matches a known otp request pattern.",
             "source": "OTPDetector", "segment_id": None, "timestamp_s": 9.5, "model_name": None},
            {"id": "demo-4b", "category": "CONVERSATION", "severity": "medium",
             "title": "Bypass Channel language detected",
             "description": "Transcript phrase \"keep this confidential\" matches a bypass channel "
                            "pattern often seen in social-engineering attempts. This alone does not "
                            "confirm fraud.",
             "source": "ConversationAnalyzer", "segment_id": None, "timestamp_s": 6.2, "model_name": None},
            {"id": "demo-4c", "category": "IDENTITY", "severity": "medium",
             "title": "Caller identity unverified",
             "description": "Caller identity has not been independently verified.",
             "source": "CallerVerifier", "segment_id": None, "timestamp_s": None, "model_name": None},
        ],
    },
}


@router.get("/scenarios")
def list_scenarios():
    return {"scenarios": [{"key": k, "label": v["label"]} for k, v in _SCENARIOS.items()]}


@router.get("/scenarios/{scenario_key}")
def get_scenario(scenario_key: str):
    scenario = _SCENARIOS.get(scenario_key)
    if not scenario:
        return {"error": "Scenario not found."}
    return scenario
