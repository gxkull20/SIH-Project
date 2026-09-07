"""
Pipeline orchestrator.

This is the one place that wires together every ML module in the order
described in Section 4 of the spec:

Upload -> Preprocess -> Segment -> [Spectrogram, WavLM, Prosody] -> Fusion
       -> Transcribe -> Conversation analysis -> OTP detection
       -> Org/Branch/Caller verification -> Risk engine -> Explanation
       -> persisted AnalysisSession
"""

from __future__ import annotations

import logging
import re
from typing import Any, Optional

from sqlalchemy.orm import Session as DBSession

from app.core.config import settings
from app.models import db as models

from ml.preprocessing.preprocessor import load_and_preprocess, PreprocessConfig, AudioValidationError
from ml.segmentation.segmenter import segment_waveform
from ml.detectors.spectrogram_detector import SpectrogramDetector
from ml.detectors.wavlm_detector import WavLMDetector
from ml.detectors.prosody_analyzer import ProsodyAnalyzer
from ml.fusion.fusion_engine import WeightedFusionEngine, DEFAULT_WEIGHTS
from ml.transcription import WhisperTranscriber
from ml.conversation.otp_detector import RuleBasedOTPDetector
from ml.conversation.conversation_analyzer import RuleBasedConversationAnalyzer
from ml.verification.verifiers import OrganizationVerifier, BranchVerifier, CallerVerifier
from ml.risk_engine import PolicyRiskEngine
from ml.explanation_engine import ExplanationEngine

logger = logging.getLogger("voiceshield.pipeline")

# Detectors/engines are cheap to construct here but expensive to *load
# weights for* — loading is lazy and cached on first is_connected()/predict()
# call inside each detector, and we hold singleton instances at module scope
# so weights are loaded once, not per-request (Section 53: performance).
_spectrogram_detector = SpectrogramDetector()
_wavlm_detector = WavLMDetector()
_prosody_analyzer = ProsodyAnalyzer()
_fusion_engine = WeightedFusionEngine()
_transcriber = WhisperTranscriber()
_otp_detector = RuleBasedOTPDetector()
_conversation_analyzer = RuleBasedConversationAnalyzer()
_org_verifier = OrganizationVerifier()
_branch_verifier = BranchVerifier()
_caller_verifier = CallerVerifier()
_risk_engine = PolicyRiskEngine()
_explanation_engine = ExplanationEngine()


_ORG_PATTERN = re.compile(
    r"calling from ([A-Za-z ]+?)(?: (chennai|coimbatore|bangalore|hyderabad|mumbai))?[\.,]",
    re.IGNORECASE,
)


def _extract_org_claim(transcript_segments: list[dict[str, Any]]) -> tuple[Optional[str], Optional[str]]:
    """Very small heuristic extractor for demo transcripts: 'I'm calling from X Y.'"""
    for seg in transcript_segments:
        text = seg.get("text", "") or ""
        m = _ORG_PATTERN.search(text)
        if m:
            return m.group(1).strip(), (m.group(2).strip() if m.group(2) else None)
    return None, None


def run_full_analysis(
    db: DBSession,
    *,
    session_row: models.AnalysisSession,
    audio_path: str,
    manual_transcript: Optional[list[dict[str, Any]]] = None,
    claimed_organization: Optional[str] = None,
    claimed_branch: Optional[str] = None,
    claimed_city: Optional[str] = None,
    caller_id: Optional[str] = None,
    fusion_weights: Optional[dict[str, float]] = None,
    preset_synthetic_likelihood: Optional[float] = None,
) -> dict[str, Any]:
    """
    Runs the whole pipeline synchronously and persists results against
    `session_row`. Returns the same structured dict the API returns.
    Every failure point degrades gracefully per Section 46 — it never lets
    one missing component silently fabricate a result for another.
    """
    try:
        audio = load_and_preprocess(
            audio_path,
            PreprocessConfig(target_sample_rate=settings.DEFAULT_SAMPLE_RATE),
        )
    except AudioValidationError as exc:
        session_row.status = "failed"
        session_row.error_message = str(exc)
        db.add(session_row)
        db.commit()
        return {"status": "failed", "error_message": str(exc)}

    audio_row = models.AudioMetadata(
        session_id=session_row.id,
        duration_s=audio.duration_s,
        sample_rate=audio.sample_rate,
        original_sample_rate=audio.original_sample_rate,
        channels=audio.original_channels,
        format=audio.original_format,
        storage_path=audio_path,
    )
    db.add(audio_row)

    seg_result = segment_waveform(
        audio.waveform, audio.sample_rate, session_row.segment_length_s or 5.0, session_row.id
    )

    all_segment_predictions: list = []
    segment_rows: list[models.AudioSegment] = []
    transcript_segments: list[dict[str, Any]] = []

    for seg in seg_result.segments:
        seg_id = models.gen_uuid()
        seg_row = models.AudioSegment(
            id=seg_id,
            session_id=session_row.id,
            segment_index=seg.index,
            start_s=seg.start_s,
            end_s=seg.end_s,
        )
        db.add(seg_row)
        segment_rows.append(seg_row)

        preds = [
            _spectrogram_detector.timed_predict(seg.segment_id, seg.waveform, audio.sample_rate),
            _wavlm_detector.timed_predict(seg.segment_id, seg.waveform, audio.sample_rate),
            _prosody_analyzer.timed_predict(seg.segment_id, seg.waveform, audio.sample_rate),
        ]

        if preset_synthetic_likelihood is not None:
            for p in preds:
                if p.is_simulated:
                    if "wavlm" in p.model_name:
                        val = preset_synthetic_likelihood
                    elif "spectrogram" in p.model_name:
                        val = max(0.02, min(0.98, preset_synthetic_likelihood + (-0.03 if preset_synthetic_likelihood > 0.5 else 0.02)))
                    else:
                        val = max(0.02, min(0.98, preset_synthetic_likelihood + (-0.05 if preset_synthetic_likelihood > 0.5 else 0.01)))
                    p.synthetic_likelihood = round(val, 4)
                    p.human_likelihood = round(1.0 - val, 4)

        all_segment_predictions.extend(preds)

        for p in preds:
            db.add(models.SegmentPrediction(
                id=models.gen_uuid(),
                segment_id=seg_id,
                model_name=p.model_name,
                model_version=p.model_version,
                status=p.status.value,
                synthetic_likelihood=p.synthetic_likelihood,
                human_likelihood=p.human_likelihood,
                uncertainty=p.uncertainty,
                processing_time_ms=p.processing_time_ms,
                is_simulated=p.is_simulated,
                message=p.message,
                evidence_ref=p.evidence_ref,
            ))
        db.flush()

        # Transcription (real if configured, otherwise skipped — never fabricated)
        if manual_transcript is None:
            seg_transcript = _transcriber.transcribe(seg.waveform, audio.sample_rate)
            for t in seg_transcript:
                t["start_s"] = (t.get("start_s") or 0) + seg.start_s
                t["end_s"] = (t.get("end_s") or 0) + seg.start_s
            transcript_segments.extend(seg_transcript)

    if manual_transcript is not None:
        transcript_segments = manual_transcript

    for seg_row, t in zip(segment_rows, _bucket_transcript(transcript_segments, segment_rows)):
        seg_row.transcript_text = t

    fusion_result = _fusion_engine.fuse(all_segment_predictions, fusion_weights or DEFAULT_WEIGHTS)
    db.add(models.ModelPrediction(
        session_id=session_row.id,
        synthetic_likelihood=fusion_result["synthetic_likelihood"],
        human_likelihood=fusion_result["human_likelihood"],
        model_agreement=fusion_result["model_agreement"],
        uncertainty=fusion_result["uncertainty"],
        contributing_models=fusion_result["contributing_models"],
        unavailable_models=fusion_result["unavailable_models"],
        any_simulated=fusion_result["any_simulated"],
        weights_used=fusion_result["weights_used"],
    ))

    otp_result = _otp_detector.detect(transcript_segments)
    conversation_result = _conversation_analyzer.analyze(transcript_segments)
    conversation_result["otp_detection"] = otp_result

    extracted_org, extracted_branch = _extract_org_claim(transcript_segments)
    org_result = _org_verifier.verify(claimed_organization or extracted_org)
    branch_result = _branch_verifier.verify(
        claimed_organization or extracted_org, claimed_branch or extracted_branch, claimed_city
    )
    caller_result = _caller_verifier.verify(caller_id, org_result, branch_result)
    verification_result = {"organization": org_result, "branch": branch_result, "caller": caller_result}

    db.add(models.VerificationResult(
        session_id=session_row.id,
        claimed_organization=claimed_organization or extracted_org,
        organization_state=org_result.get("state"),
        claimed_branch=claimed_branch or extracted_branch,
        branch_state=branch_result.get("state"),
        caller_id=caller_id,
        caller_state=caller_result.get("state"),
        raw_result=verification_result,
    ))

    risk_result = _risk_engine.score(
        fusion_result=fusion_result,
        conversation_result=conversation_result,
        verification_result=verification_result,
    )
    db.add(models.RiskScore(
        session_id=session_row.id,
        risk_score=risk_result["risk_score"],
        risk_level=risk_result["risk_level"],
        risk_factors=risk_result["risk_factors"],
        recommendation=risk_result["recommendation"],
        thresholds_used=risk_result["thresholds_used"],
        weights_used=risk_result["weights_used"],
    ))

    evidence = _explanation_engine.explain(
        fusion_result=fusion_result,
        conversation_result=conversation_result,
        verification_result=verification_result,
        risk_result=risk_result,
    )
    for e in evidence:
        db.add(models.EvidenceItemRow(session_id=session_row.id, **{
            k: v for k, v in e.items() if k != "id"
        }))

    session_row.status = "complete"
    db.add(session_row)
    db.commit()

    return {
        "status": "complete",
        "audio": audio,
        "segments": seg_result.segments,
        "segment_predictions": all_segment_predictions,
        "transcript_segments": transcript_segments,
        "fusion": fusion_result,
        "conversation": conversation_result,
        "verification": verification_result,
        "risk": risk_result,
        "evidence": evidence,
    }


def _bucket_transcript(transcript_segments: list[dict[str, Any]], segment_rows: list) -> list[Optional[str]]:
    """Assigns transcript text to the audio segment row it falls within, for storage/display."""
    texts: list[list[str]] = [[] for _ in segment_rows]
    for t in transcript_segments:
        ts = t.get("start_s", 0.0)
        for i, row in enumerate(segment_rows):
            if row.start_s <= ts < row.end_s or (i == len(segment_rows) - 1 and ts >= row.start_s):
                texts[i].append(t.get("text", ""))
                break
    return [" ".join(t).strip() or None for t in texts]
