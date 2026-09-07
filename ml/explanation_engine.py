"""
ExplanationEngine (Section 31-32).

Turns the raw outputs of fusion / conversation analysis / verification /
risk scoring into a list of structured, traceable EvidenceItems. Nothing is
added here that isn't backed by an actual upstream signal — this module
does not invent explanations to make the result feel more convincing.
"""

from __future__ import annotations

import uuid
from typing import Any

from ml.base import EvidenceCategory, EvidenceItem, EvidenceSeverity


def _new_id() -> str:
    return f"ev-{uuid.uuid4().hex[:8]}"


class ExplanationEngine:
    def explain(
        self,
        *,
        fusion_result: dict[str, Any],
        conversation_result: dict[str, Any],
        verification_result: dict[str, Any],
        risk_result: dict[str, Any],
    ) -> list[dict[str, Any]]:
        items: list[EvidenceItem] = []

        # --- VOICE evidence ---
        synthetic_likelihood = fusion_result.get("synthetic_likelihood")
        if synthetic_likelihood is not None:
            if synthetic_likelihood >= 0.6:
                items.append(EvidenceItem(
                    id=_new_id(), category=EvidenceCategory.VOICE, severity=EvidenceSeverity.HIGH,
                    title="Possible synthetic speech signal",
                    description=f"Fused voice-analysis models estimate a "
                                f"{synthetic_likelihood*100:.0f}% synthetic-speech likelihood "
                                f"across {len(fusion_result.get('contributing_models', []))} model(s).",
                    source="FusionEngine",
                ))
            elif synthetic_likelihood <= 0.3:
                items.append(EvidenceItem(
                    id=_new_id(), category=EvidenceCategory.VOICE, severity=EvidenceSeverity.INFO,
                    title="Voice signal consistent with human speech",
                    description=f"Fused models estimate a low ({synthetic_likelihood*100:.0f}%) "
                                f"synthetic-speech likelihood.",
                    source="FusionEngine",
                ))
        if fusion_result.get("model_agreement") is not None and fusion_result["model_agreement"] < 0.5:
            items.append(EvidenceItem(
                id=_new_id(), category=EvidenceCategory.VOICE, severity=EvidenceSeverity.MEDIUM,
                title="Voice-detection models disagree",
                description="Individual detector outputs diverge significantly — treat the fused "
                            "voice signal with additional caution.",
                source="FusionEngine",
            ))
        if fusion_result.get("any_simulated"):
            items.append(EvidenceItem(
                id=_new_id(), category=EvidenceCategory.VOICE, severity=EvidenceSeverity.INFO,
                title="Development/Simulation Mode active",
                description="One or more voice-detection models are running in simulation mode "
                            "(no trained checkpoint connected). Treat voice signal as illustrative, "
                            "not production-grade.",
                source="FusionEngine",
            ))

        # --- CONVERSATION evidence ---
        otp = conversation_result.get("otp_detection", {})
        for match in otp.get("matches", []):
            items.append(EvidenceItem(
                id=_new_id(), category=EvidenceCategory.CONVERSATION, severity=EvidenceSeverity.HIGH,
                title="Sensitive authentication request detected",
                description=f"Transcript phrase \"{match['matched_phrase']}\" matches a known "
                            f"{match['pattern_category'].replace('_', ' ')} pattern.",
                source="OTPDetector",
                timestamp_s=match.get("timestamp_s"),
            ))
        for signal in conversation_result.get("signals", []):
            items.append(EvidenceItem(
                id=_new_id(), category=EvidenceCategory.CONVERSATION, severity=EvidenceSeverity.MEDIUM,
                title=f"{signal['category'].replace('_', ' ').title()} language detected",
                description=f"Transcript phrase \"{signal['matched_phrase']}\" matches a "
                            f"{signal['category'].replace('_', ' ')} pattern often seen in "
                            f"social-engineering attempts. This alone does not confirm fraud.",
                source="ConversationAnalyzer",
                timestamp_s=signal.get("timestamp_s"),
            ))

        # --- IDENTITY evidence ---
        org = verification_result.get("organization", {})
        branch = verification_result.get("branch", {})
        caller = verification_result.get("caller", {})

        if org.get("state") in ("unknown", "inconsistent"):
            items.append(EvidenceItem(
                id=_new_id(), category=EvidenceCategory.IDENTITY, severity=EvidenceSeverity.HIGH,
                title="Organization could not be verified",
                description=org.get("reason", "Organization claim did not match the verification directory."),
                source="OrganizationVerifier",
            ))
        if branch.get("state") == "inconsistent":
            items.append(EvidenceItem(
                id=_new_id(), category=EvidenceCategory.IDENTITY, severity=EvidenceSeverity.HIGH,
                title="Branch/location inconsistency",
                description=branch.get("reason", "Branch claim is inconsistent with known records."),
                source="BranchVerifier",
            ))
        if caller.get("state") in ("unverified", "unknown", "requires_independent_verification"):
            items.append(EvidenceItem(
                id=_new_id(), category=EvidenceCategory.IDENTITY, severity=EvidenceSeverity.MEDIUM,
                title="Caller identity unverified",
                description=caller.get("reason", "Caller identity has not been independently verified."),
                source="CallerVerifier",
            ))

        # --- CONTEXT evidence ---
        if risk_result.get("risk_level") in ("HIGH", "CRITICAL"):
            items.append(EvidenceItem(
                id=_new_id(), category=EvidenceCategory.CONTEXT, severity=EvidenceSeverity.CRITICAL
                if risk_result["risk_level"] == "CRITICAL" else EvidenceSeverity.HIGH,
                title="Multiple independent risk factors present",
                description="Voice, conversation and/or identity signals combine to produce an "
                            f"overall {risk_result['risk_level']} risk classification under the "
                            f"current policy thresholds.",
                source="RiskEngine",
            ))

        return [item.to_dict() for item in items]
