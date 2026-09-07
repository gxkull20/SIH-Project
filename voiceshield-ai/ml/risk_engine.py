"""
RiskEngine (Section 21).

Combines fused voice signal + conversation signal + verification/identity
signal into a single 0-100 risk score and a policy-defined risk band. The
thresholds are an explicit, configurable POLICY — not a scientifically
calibrated probability — and are labeled as such everywhere they're shown.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

DEFAULT_THRESHOLDS = {
    "LOW": (0, 29),
    "MODERATE": (30, 59),
    "HIGH": (60, 79),
    "CRITICAL": (80, 100),
}

DEFAULT_ENGINE_WEIGHTS = {
    "voice_weight": 0.40,
    "conversation_weight": 0.25,
    "identity_weight": 0.20,
    "context_weight": 0.15,
}

RECOMMENDATIONS = {
    "LOW": "No immediate action required. Continue normal verification practices.",
    "MODERATE": "Verify the caller through an independently obtained trusted channel before "
                "sharing any information.",
    "HIGH": "Do not share OTPs, passwords or account details. Verify the caller through an "
            "independently obtained trusted channel and consider ending the call.",
    "CRITICAL": "Do not share any authentication secrets. End the call and independently contact "
                "the organization using a number you already trust, not one provided by the caller.",
}


@dataclass
class RiskResult:
    risk_score: float | None
    risk_level: str | None
    risk_factors: list[str] = field(default_factory=list)
    recommendation: str | None = None
    thresholds_used: dict[str, Any] = field(default_factory=dict)
    weights_used: dict[str, float] = field(default_factory=dict)
    is_scientifically_calibrated_probability: bool = False

    def to_dict(self) -> dict[str, Any]:
        return {
            "risk_score": self.risk_score,
            "risk_level": self.risk_level,
            "risk_factors": self.risk_factors,
            "recommendation": self.recommendation,
            "thresholds_used": self.thresholds_used,
            "weights_used": self.weights_used,
            "is_scientifically_calibrated_probability": self.is_scientifically_calibrated_probability,
            "note": "risk_level is derived from a configurable policy threshold, not a calibrated "
                    "probability of fraud.",
        }


def _level_for_score(score: float, thresholds: dict[str, tuple[int, int]]) -> str:
    if score >= 80.0:
        return "CRITICAL"
    if score >= 60.0:
        return "HIGH"
    if score >= 30.0:
        return "MODERATE"
    return "LOW"


class PolicyRiskEngine:
    def score(
        self,
        *,
        fusion_result: dict[str, Any],
        conversation_result: dict[str, Any],
        verification_result: dict[str, Any],
        weights: dict[str, float] | None = None,
        thresholds: dict[str, tuple[int, int]] | None = None,
    ) -> dict[str, Any]:
        weights = weights or DEFAULT_ENGINE_WEIGHTS
        thresholds = thresholds or DEFAULT_THRESHOLDS

        risk_factors: list[str] = []

        # --- Voice component ---
        synthetic_likelihood = fusion_result.get("synthetic_likelihood")
        voice_component = (synthetic_likelihood or 0.0) * 100
        if synthetic_likelihood is not None and synthetic_likelihood >= 0.6:
            risk_factors.append("Multiple voice-analysis signals indicate possible synthetic speech.")
        if fusion_result.get("model_agreement") is not None and fusion_result["model_agreement"] < 0.5:
            risk_factors.append("Voice-detection models disagree significantly — treat voice signal with caution.")

        # --- Conversation component ---
        hint_map = {"low": 10, "moderate": 55, "high": 90}
        conversation_hint = conversation_result.get("conversation_risk_hint", "low")
        conversation_component = hint_map.get(conversation_hint, 10)
        otp = conversation_result.get("otp_detection", {})
        if otp.get("detected"):
            risk_factors.append("Sensitive authentication (OTP/credential) request detected in conversation.")
            conversation_component = max(conversation_component, 90)
        for cat, count in conversation_result.get("signal_counts", {}).items():
            if count > 0:
                pretty = cat.replace("_", " ")
                risk_factors.append(f"Conversation contains {pretty.replace('claim', 'claims')} language.")

        # --- Identity / verification component ---
        org_state = verification_result.get("organization", {}).get("state")
        branch_state = verification_result.get("branch", {}).get("state")
        caller_state = verification_result.get("caller", {}).get("state")

        identity_penalty = 0
        if org_state in ("unknown", "inconsistent"):
            identity_penalty += 35
            risk_factors.append("Claimed organization could not be verified.")
        if branch_state == "inconsistent":
            identity_penalty += 35
            risk_factors.append("Organization/branch information is inconsistent with known records.")
        elif branch_state == "unknown":
            identity_penalty += 15
            risk_factors.append("Branch/location claim requires verification.")
        if caller_state in ("unverified", "unknown", "requires_independent_verification"):
            identity_penalty += 20
            risk_factors.append("Caller identity is unverified.")
        identity_component = min(100, identity_penalty)

        # --- Context component (placeholder for future contextual signals) ---
        context_component = 0.0

        weighted_score = (
            voice_component * weights["voice_weight"]
            + conversation_component * weights["conversation_weight"]
            + identity_component * weights["identity_weight"]
            + context_component * weights["context_weight"]
        )
        weighted_score = round(min(100.0, max(0.0, weighted_score)), 1)

        level = _level_for_score(weighted_score, thresholds)

        return RiskResult(
            risk_score=weighted_score,
            risk_level=level,
            risk_factors=risk_factors,
            recommendation=RECOMMENDATIONS[level],
            thresholds_used={k: list(v) for k, v in thresholds.items()},
            weights_used=weights,
            is_scientifically_calibrated_probability=False,
        ).to_dict()
