"""
Unit tests for the ML pipeline modules. Run with: pytest backend/app/tests
(PYTHONPATH must include both backend/ and the repo root so `ml.*` resolves).
"""
from __future__ import annotations

import numpy as np
import pytest

from ml.base import DetectorPrediction, ModelStatus
from ml.fusion.fusion_engine import WeightedFusionEngine
from ml.risk_engine import PolicyRiskEngine
from ml.conversation.otp_detector import RuleBasedOTPDetector
from ml.conversation.conversation_analyzer import RuleBasedConversationAnalyzer
from ml.verification.verifiers import OrganizationVerifier, BranchVerifier, CallerVerifier
from ml.segmentation.segmenter import segment_waveform
from ml.preprocessing.preprocessor import validate_upload, AudioValidationError


def make_pred(model_name, score, status=ModelStatus.SIMULATED, is_simulated=True):
    return DetectorPrediction(
        segment_id="seg-1", model_name=model_name, model_version="test",
        status=status, synthetic_likelihood=score, human_likelihood=1 - score,
        is_simulated=is_simulated,
    )


class TestSegmentation:
    def test_basic_segmentation(self):
        sr = 16000
        waveform = np.zeros(sr * 12)  # 12 seconds
        result = segment_waveform(waveform, sr, segment_length_s=5.0)
        assert len(result.segments) == 3
        assert result.segments[0].duration_s == pytest.approx(5.0, abs=0.01)
        assert result.segments[-1].duration_s == pytest.approx(2.0, abs=0.01)

    def test_short_audio_single_segment(self):
        sr = 16000
        waveform = np.zeros(sr * 2)
        result = segment_waveform(waveform, sr, segment_length_s=5.0)
        assert len(result.segments) == 1


class TestUploadValidation:
    def test_rejects_unsupported_extension(self):
        with pytest.raises(AudioValidationError):
            validate_upload("call.ogg", 1000)

    def test_rejects_empty_file(self):
        with pytest.raises(AudioValidationError):
            validate_upload("call.wav", 0)

    def test_rejects_oversized_file(self):
        with pytest.raises(AudioValidationError):
            validate_upload("call.wav", 300 * 1024 * 1024)

    def test_accepts_valid_wav(self):
        validate_upload("call.wav", 1024)  # should not raise


class TestFusionEngine:
    def test_fuses_agreeing_models(self):
        preds = [make_pred("spectrogram-cnn", 0.8), make_pred("wavlm-base-plus-antispoof", 0.82)]
        result = WeightedFusionEngine().fuse(preds)
        assert result["synthetic_likelihood"] > 0.7
        assert result["model_agreement"] > 0.9

    def test_flags_disagreement(self):
        preds = [make_pred("spectrogram-cnn", 0.1), make_pred("wavlm-base-plus-antispoof", 0.9)]
        result = WeightedFusionEngine().fuse(preds)
        assert result["model_agreement"] < 0.3

    def test_handles_all_unavailable(self):
        preds = [DetectorPrediction(
            segment_id="s", model_name="x", model_version="v",
            status=ModelStatus.UNAVAILABLE, is_simulated=True,
        )]
        result = WeightedFusionEngine().fuse(preds)
        assert result["synthetic_likelihood"] is None
        assert "x" in result["unavailable_models"]


class TestOTPDetector:
    def test_detects_otp_request(self):
        transcript = [{"text": "Please share the verification code sent to your phone.", "start_s": 1.0}]
        result = RuleBasedOTPDetector().detect(transcript)
        assert result["detected"] is True
        assert result["matches"][0]["pattern_category"] == "otp_request"

    def test_no_false_positive_on_neutral_text(self):
        transcript = [{"text": "Thanks for calling, have a nice day.", "start_s": 1.0}]
        result = RuleBasedOTPDetector().detect(transcript)
        assert result["detected"] is False

    def test_never_returns_a_numeric_code(self):
        transcript = [{"text": "Your OTP is 483920, please confirm.", "start_s": 1.0}]
        result = RuleBasedOTPDetector().detect(transcript)
        for match in result["matches"]:
            assert "483920" not in match["matched_phrase"]


class TestConversationAnalyzer:
    def test_detects_urgency_and_authority(self):
        transcript = [
            {"text": "This is an official call, act now.", "start_s": 0.0},
        ]
        result = RuleBasedConversationAnalyzer().analyze(transcript)
        categories = {s["category"] for s in result["signals"]}
        assert "authority_claim" in categories
        assert result["conversation_risk_hint"] in ("moderate", "high")

    def test_low_risk_hint_for_neutral_conversation(self):
        transcript = [{"text": "Sure, I can help you with that today.", "start_s": 0.0}]
        result = RuleBasedConversationAnalyzer().analyze(transcript)
        assert result["conversation_risk_hint"] == "low"


class TestVerification:
    def test_verified_organization(self):
        result = OrganizationVerifier().verify("Demo Bank")
        assert result["state"] == "verified"

    def test_unknown_organization(self):
        result = OrganizationVerifier().verify("Totally Fake Corp")
        assert result["state"] == "unknown"

    def test_inconsistent_branch(self):
        result = BranchVerifier().verify("Demo Bank", "Mumbai", None)
        assert result["state"] == "inconsistent"

    def test_consistent_branch(self):
        result = BranchVerifier().verify("Demo Bank", "Chennai", None)
        assert result["state"] == "verified"

    def test_caller_id_never_fully_verified_alone(self):
        org_result = {"matched_organization": "Demo Bank"}
        branch_result = {"state": "verified"}
        result = CallerVerifier().verify("+91-DEMO-1000", org_result, branch_result)
        assert result["state"] == "requires_independent_verification"


class TestRiskEngine:
    def test_low_risk_all_clear(self):
        fusion = {"synthetic_likelihood": 0.05, "model_agreement": 0.95}
        conversation = {"conversation_risk_hint": "low", "signal_counts": {}, "otp_detection": {"detected": False}}
        verification = {
            "organization": {"state": "verified"}, "branch": {"state": "verified"},
            "caller": {"state": "verified"},
        }
        result = PolicyRiskEngine().score(fusion_result=fusion, conversation_result=conversation,
                                           verification_result=verification)
        assert result["risk_level"] == "LOW"

    def test_high_or_critical_risk_multiple_factors(self):
        # With every voice/conversation/identity signal maximally adverse, the
        # weighted policy score lands in the HIGH/CRITICAL band. It is
        # deliberately not forced above the CRITICAL boundary by tuning these
        # inputs artificially — see docs/research/risk-policy.md for why
        # reaching CRITICAL requires near-certain voice signal *and* multiple
        # corroborating identity/conversation failures, not just one.
        fusion = {"synthetic_likelihood": 0.9, "model_agreement": 0.6}
        conversation = {"conversation_risk_hint": "high", "signal_counts": {"urgency": 2},
                         "otp_detection": {"detected": True}}
        verification = {
            "organization": {"state": "unknown"}, "branch": {"state": "inconsistent"},
            "caller": {"state": "unverified"},
        }
        result = PolicyRiskEngine().score(fusion_result=fusion, conversation_result=conversation,
                                           verification_result=verification)
        assert result["risk_level"] in ("HIGH", "CRITICAL")
        assert len(result["risk_factors"]) > 0

    def test_critical_requires_near_certain_voice_signal(self):
        fusion = {"synthetic_likelihood": 0.99, "model_agreement": 0.9}
        conversation = {"conversation_risk_hint": "high", "signal_counts": {"urgency": 3},
                         "otp_detection": {"detected": True}}
        verification = {
            "organization": {"state": "unknown"}, "branch": {"state": "inconsistent"},
            "caller": {"state": "unverified"},
        }
        result = PolicyRiskEngine().score(fusion_result=fusion, conversation_result=conversation,
                                           verification_result=verification)
        assert result["risk_score"] >= 79

    def test_risk_level_is_never_claimed_as_probability(self):
        result = PolicyRiskEngine().score(
            fusion_result={"synthetic_likelihood": 0.5, "model_agreement": 0.5},
            conversation_result={"conversation_risk_hint": "low", "signal_counts": {}, "otp_detection": {"detected": False}},
            verification_result={"organization": {"state": "unknown"}, "branch": {"state": "unknown"},
                                  "caller": {"state": "unknown"}},
        )
        assert result["is_scientifically_calibrated_probability"] is False
