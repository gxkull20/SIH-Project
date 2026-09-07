from __future__ import annotations

from fastapi import APIRouter

from app.schemas.schemas import CallerVerifyRequest
from ml.verification.verifiers import OrganizationVerifier, BranchVerifier, CallerVerifier
from ml.conversation.otp_detector import RuleBasedOTPDetector
from ml.conversation.conversation_analyzer import RuleBasedConversationAnalyzer

router = APIRouter(prefix="/api/verify", tags=["verify"])

_org_verifier = OrganizationVerifier()
_branch_verifier = BranchVerifier()
_caller_verifier = CallerVerifier()
_otp_detector = RuleBasedOTPDetector()
_conversation_analyzer = RuleBasedConversationAnalyzer()


@router.post("/organization")
def verify_organization(payload: dict):
    return _org_verifier.verify(payload.get("claimed_organization"))


@router.post("/branch")
def verify_branch(payload: dict):
    return _branch_verifier.verify(
        payload.get("claimed_organization"), payload.get("claimed_branch"), payload.get("claimed_city")
    )


@router.post("/caller")
def verify_caller(payload: CallerVerifyRequest):
    org_result = _org_verifier.verify(payload.claimed_organization)
    branch_result = _branch_verifier.verify(
        payload.claimed_organization, payload.claimed_branch, payload.claimed_city
    )
    caller_result = _caller_verifier.verify(payload.caller_id, org_result, branch_result)
    return {"organization": org_result, "branch": branch_result, "caller": caller_result}


@router.post("/conversation")
def verify_conversation(payload: dict):
    transcript_segments = payload.get("transcript_segments", [])
    conversation_result = _conversation_analyzer.analyze(transcript_segments)
    conversation_result["otp_detection"] = _otp_detector.detect(transcript_segments)
    return conversation_result
