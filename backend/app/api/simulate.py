"""
Interactive In-Call Simulator API
---------------------------------
Provides branching phone-call fraud scenarios and real-time turn-by-turn evaluation
fusing simulated voice forensics with live conversation/OTP intelligence and caller verification.
"""

from __future__ import annotations

from typing import Any, Optional
from fastapi import APIRouter
from pydantic import BaseModel

from ml.conversation.otp_detector import RuleBasedOTPDetector
from ml.conversation.conversation_analyzer import RuleBasedConversationAnalyzer
from ml.verification.verifiers import OrganizationVerifier, BranchVerifier, CallerVerifier
from ml.risk_engine import PolicyRiskEngine
from ml.explanation_engine import ExplanationEngine

router = APIRouter(prefix="/api/simulate", tags=["simulate"])

_otp_detector = RuleBasedOTPDetector()
_conversation_analyzer = RuleBasedConversationAnalyzer()
_org_verifier = OrganizationVerifier()
_branch_verifier = BranchVerifier()
_caller_verifier = CallerVerifier()
_risk_engine = PolicyRiskEngine()
_explanation_engine = ExplanationEngine()

_SCENARIOS = [
    {
        "id": "bank_kyc_otp_fraud",
        "title": "Bank KYC & Urgent Card Block Scam",
        "category": "Banking Fraud / Social Engineering",
        "caller_profile": {
            "name": "Rajesh V. (Central Fraud Cell)",
            "claimed_organization": "Demo Bank",
            "claimed_branch": "Delhi", # Intentionally inconsistent with known demo branch (Chennai/Coimbatore)
            "claimed_city": "Delhi",
            "caller_id": "+91-98210-44912",
            "avatar_color": "from-red-500 to-amber-600",
            "voice_synthetic_likelihood": 0.86,
            "voice_type": "synthetic",
            "voice_pitch": 0.9,
            "voice_rate": 1.05,
        },
        "description": "Caller impersonates bank fraud division claiming an unauthorized transaction of Rs. 48,990 and urgently requests a 6-digit cancellation OTP to steal funds.",
        "turns": [
            {
                "id": "turn_1",
                "caller_text": "Urgent security alert from Demo Bank Central Security. We detected an unauthorized transaction of Rs. 48,990 on your card ending in 4109 from Singapore. Did you authorize this charge?",
                "options": [
                    {
                        "label": "No, I did not authorize this! Cancel it immediately.",
                        "user_reply": "No, I did not authorize this! Please cancel it immediately.",
                        "next_turn": "turn_2a",
                        "compliance_type": "panicked",
                    },
                    {
                        "label": "Which branch are you calling from? What is your employee ID?",
                        "user_reply": "Which branch are you calling from? What is your employee ID?",
                        "next_turn": "turn_2b",
                        "compliance_type": "suspicious",
                    },
                    {
                        "label": "I will call the customer care number on the back of my card directly.",
                        "user_reply": "I will call the customer care number on the back of my card directly.",
                        "next_turn": "turn_hangup_safe",
                        "compliance_type": "safe",
                    },
                ],
            },
            {
                "id": "turn_2a",
                "caller_text": "Understood sir. The transaction is in pending clearance for 3 minutes only. I have generated a cancellation code to reverse the funds. Please read out the 6-digit OTP you just received right now.",
                "options": [
                    {
                        "label": "Okay, the OTP is 849201. Please reverse it fast!",
                        "user_reply": "Okay, the OTP is 849201. Please reverse it fast!",
                        "next_turn": "turn_compromised",
                        "compliance_type": "compromised",
                    },
                    {
                        "label": "My bank says never share OTPs with anyone on call.",
                        "user_reply": "My bank app says never share OTPs with anyone on call. I am not sharing it.",
                        "next_turn": "turn_caller_pressure",
                        "compliance_type": "suspicious",
                    },
                    {
                        "label": "I am terminating this call and reporting this to 1930 Cyber Cell.",
                        "user_reply": "I am terminating this call and reporting this to 1930 Cyber Cell.",
                        "next_turn": "turn_hangup_safe",
                        "compliance_type": "safe",
                    },
                ],
            },
            {
                "id": "turn_2b",
                "caller_text": "Sir, this is Central Fraud Operations in Delhi, Badge ID EMP-9921! There is no time for questions, the funds are getting permanently debited in 2 minutes! Do you want to lose 48,000 rupees? Share the cancellation OTP immediately!",
                "options": [
                    {
                        "label": "Fine, the OTP is 849201! Stop the charge!",
                        "user_reply": "Fine, the OTP is 849201! Stop the charge!",
                        "next_turn": "turn_compromised",
                        "compliance_type": "compromised",
                    },
                    {
                        "label": "Your branch info does not match. I am hanging up.",
                        "user_reply": "Your branch info does not match the bank directory. I am hanging up.",
                        "next_turn": "turn_hangup_safe",
                        "compliance_type": "safe",
                    },
                ],
            },
            {
                "id": "turn_caller_pressure",
                "caller_text": "Sir, this is an automated cancellation code, not an OTP! If you refuse to verify it within 60 seconds, Demo Bank is not liable for your 48,000 rupee loss! Give the code now!",
                "options": [
                    {
                        "label": "I will never share an OTP. Goodbye.",
                        "user_reply": "I will never share an OTP. Goodbye.",
                        "next_turn": "turn_hangup_safe",
                        "compliance_type": "safe",
                    },
                    {
                        "label": "Alright fine, it is 849201.",
                        "user_reply": "Alright fine, it is 849201.",
                        "next_turn": "turn_compromised",
                        "compliance_type": "compromised",
                    },
                ],
            },
            {
                "id": "turn_compromised",
                "caller_text": "Code accepted. Your card is updated. (Call disconnects abruptly — money debited).",
                "options": [],
                "is_terminal": True,
                "outcome": "CRITICAL: Account compromised. Scammer extracted OTP to complete unauthorized transaction.",
            },
            {
                "id": "turn_hangup_safe",
                "caller_text": "Wait sir, do not hang up! (Call terminated by user).",
                "options": [],
                "is_terminal": True,
                "outcome": "ATTACK BLOCKED: You successfully defended your credentials and avoided financial loss.",
            },
        ],
    },
    {
        "id": "customs_police_extortion",
        "title": "Customs Narcotics & Police Arrest Threat",
        "category": "Law Enforcement Impersonation / Extortion",
        "caller_profile": {
            "name": "Inspector Vikramaditya (Crime Branch)",
            "claimed_organization": "Delhi Police Crime Branch",
            "claimed_branch": "IGI Airport Division",
            "claimed_city": "New Delhi",
            "caller_id": "+91-11-2301-8841",
            "avatar_color": "from-blue-600 to-indigo-900",
            "voice_synthetic_likelihood": 0.82,
            "voice_type": "synthetic",
            "voice_pitch": 0.85,
            "voice_rate": 0.95,
        },
        "description": "Caller impersonates airport customs and cyber police, claiming an intercepted parcel with illegal passports and narcotics under your Aadhaar, demanding urgent settlement.",
        "turns": [
            {
                "id": "turn_1",
                "caller_text": "This is Inspector Vikramaditya from Crime Branch IGI Airport. Customs has confiscated a DHL parcel sent to Malaysia containing 5 forged passports and 250 grams of narcotics booked under your Aadhaar number. A non-bailable arrest warrant has been issued.",
                "options": [
                    {
                        "label": "Sir, I have never sent any parcel! My Aadhaar must have been misused!",
                        "user_reply": "Sir, I have never sent any parcel! My Aadhaar must have been misused!",
                        "next_turn": "turn_2a",
                        "compliance_type": "panicked",
                    },
                    {
                        "label": "I will report directly to my local police station to verify this warrant.",
                        "user_reply": "I will report directly to my local police station to verify this warrant.",
                        "next_turn": "turn_hangup_safe",
                        "compliance_type": "safe",
                    },
                ],
            },
            {
                "id": "turn_2a",
                "caller_text": "If you are innocent, we can place you under virtual police custody right now on Skype. To avoid immediate detention at your residence, you must transfer a 50,000 rupee refundable RBI verification bond.",
                "options": [
                    {
                        "label": "Police never request money transfers over the phone. Hanging up now.",
                        "user_reply": "Police never request money transfers over the phone. Hanging up now.",
                        "next_turn": "turn_hangup_safe",
                        "compliance_type": "safe",
                    },
                    {
                        "label": "Okay, where do I send the verification deposit?",
                        "user_reply": "Okay, where do I send the verification deposit?",
                        "next_turn": "turn_compromised",
                        "compliance_type": "compromised",
                    },
                ],
            },
            {
                "id": "turn_compromised",
                "caller_text": "Send the funds to this UPI handle immediately. (Extortion trap complete).",
                "options": [],
                "is_terminal": True,
                "outcome": "CRITICAL: Extortion scam successful. Cyber-criminals extracted fraudulent bond payment.",
            },
            {
                "id": "turn_hangup_safe",
                "caller_text": "You cannot disconnect, you will be arrested! (Call terminated safely).",
                "options": [],
                "is_terminal": True,
                "outcome": "ATTACK BLOCKED: Law enforcement extortion recognized and safely terminated.",
            },
        ],
    },
    {
        "id": "legitimate_bank_verification",
        "title": "Legitimate Bank Call (Control Case)",
        "category": "Legitimate Business / Customer Care",
        "caller_profile": {
            "name": "Ananya (Customer Relations)",
            "claimed_organization": "Demo Bank",
            "claimed_branch": "Chennai",
            "claimed_city": "Chennai",
            "caller_id": "+91-DEMO-1000",
            "avatar_color": "from-emerald-500 to-teal-700",
            "voice_synthetic_likelihood": 0.08,
            "voice_type": "human",
            "voice_pitch": 1.05,
            "voice_rate": 1.0,
        },
        "description": "Legitimate call from Demo Bank confirming a requested address update without asking for credentials, OTPs, or passwords.",
        "turns": [
            {
                "id": "turn_1",
                "caller_text": "Good afternoon. This is Ananya calling from Demo Bank Chennai Branch. We received your request yesterday to update your correspondence address on file. Please note Demo Bank customer care will never ask you for confidential account credentials. Can you confirm if you submitted this request?",
                "options": [
                    {
                        "label": "Yes, I submitted that update request yesterday.",
                        "user_reply": "Yes, I submitted that update request yesterday.",
                        "next_turn": "turn_legit_end",
                        "compliance_type": "normal",
                    },
                    {
                        "label": "No, I did not request that.",
                        "user_reply": "No, I did not request that.",
                        "next_turn": "turn_legit_reject",
                        "compliance_type": "normal",
                    },
                ],
            },
            {
                "id": "turn_legit_end",
                "caller_text": "Thank you for confirming. Your address update will be processed within 24 hours. Have a great day.",
                "options": [],
                "is_terminal": True,
                "outcome": "SAFE / LOW RISK: Legitimate call adhering to banking security protocols. Zero credentials requested.",
            },
            {
                "id": "turn_legit_reject",
                "caller_text": "Thank you for notifying us. We have cancelled the request and flagged your profile for safety. Please visit the branch at your convenience.",
                "options": [],
                "is_terminal": True,
                "outcome": "SAFE / LOW RISK: Legitimate verification call resolved safely.",
            },
        ],
    },
]


class EvaluateTurnRequest(BaseModel):
    caller_text: str
    user_reply: Optional[str] = None
    claimed_organization: Optional[str] = None
    claimed_branch: Optional[str] = None
    claimed_city: Optional[str] = None
    caller_id: Optional[str] = None
    simulated_synthetic_likelihood: float = 0.5


@router.get("/scenarios")
def list_scenarios():
    return {"scenarios": _SCENARIOS}


@router.post("/evaluate-turn")
def evaluate_turn(payload: EvaluateTurnRequest):
    transcript_segments = [
        {"start_s": 0.0, "end_s": 5.0, "text": payload.caller_text}
    ]
    if payload.user_reply:
        transcript_segments.append({"start_s": 5.0, "end_s": 10.0, "text": payload.user_reply})

    # 1. Voice Fusion
    sl = payload.simulated_synthetic_likelihood
    hl = round(1.0 - sl, 2)
    fusion_result = {
        "synthetic_likelihood": sl,
        "human_likelihood": hl,
        "model_agreement": round(0.70 + (0.2 * (1.0 - abs(sl - 0.5))), 2),
        "uncertainty": round(0.20 + (0.3 * (1.0 - abs(sl - 0.5))), 2),
        "contributing_models": ["spectrogram-cnn", "wavlm-base-plus-antispoof", "acoustic-prosody-analyzer"],
        "unavailable_models": [],
        "any_simulated": True,
        "weights_used": {"spectrogram-cnn": 0.35, "wavlm-base-plus-antispoof": 0.45, "acoustic-prosody-analyzer": 0.20},
    }

    # 2. Conversation & OTP
    otp_res = _otp_detector.detect(transcript_segments)
    conv_res = _conversation_analyzer.analyze(transcript_segments)
    conv_res["otp_detection"] = otp_res

    # 3. Verification
    org_res = _org_verifier.verify(payload.claimed_organization)
    branch_res = _branch_verifier.verify(
        payload.claimed_organization, payload.claimed_branch, payload.claimed_city
    )
    caller_res = _caller_verifier.verify(payload.caller_id, org_res, branch_res)
    verif_res = {"organization": org_res, "branch": branch_res, "caller": caller_res}

    # 4. Risk Score
    risk_res = _risk_engine.score(
        fusion_result=fusion_result,
        conversation_result=conv_res,
        verification_result=verif_res,
    )

    # 5. Explanations & Evidence
    evidence = _explanation_engine.explain(
        fusion_result=fusion_result,
        conversation_result=conv_res,
        verification_result=verif_res,
        risk_result=risk_res,
    )

    # In-Call Copilot Tactical Guidance
    guidance = []
    if otp_res.get("detected"):
        guidance.append({
            "level": "critical",
            "message": "🚨 CRITICAL: Caller is actively soliciting an OTP/verification code! Never speak or key in authentication digits.",
        })
    if conv_res.get("signal_counts", {}).get("urgency_claim", 0) > 0:
        guidance.append({
            "level": "warning",
            "message": "⚠️ TACTIC DETECTED: Caller is manufacturing artificial urgency to induce panic.",
        })
    if branch_res.get("state") == "inconsistent":
        guidance.append({
            "level": "warning",
            "message": "⚠️ IDENTITY MISMATCH: Claimed branch does not match known organization records.",
        })
    if sl >= 0.70:
        guidance.append({
            "level": "warning",
            "message": "🎙️ VOICE FORENSICS: Voice acoustic properties match AI speech synthesis / voice cloning.",
        })
    if not guidance:
        guidance.append({
            "level": "info",
            "message": "🛡️ SHIELD ACTIVE: Conversation conforms to normal protocols. Remain vigilant.",
        })

    return {
        "fusion": fusion_result,
        "conversation": conv_res,
        "verification": verif_res,
        "risk": risk_res,
        "evidence": evidence,
        "guidance": guidance,
    }
