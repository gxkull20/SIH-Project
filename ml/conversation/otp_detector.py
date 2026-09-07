"""
OTPDetector (Section 26).

Rule/keyword-based detection of OTP, verification-code and credential
requests in a transcript. Deliberately simple and auditable — every match
is traceable to the exact phrase that triggered it (evidence-first design).

CRITICAL PRIVACY RULE: this module NEVER extracts, stores or returns an
actual numeric code that may appear in speech. It only detects that an
OTP/credential *request pattern* occurred.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Any

OTP_PATTERNS = [
    r"\bone[\s-]?time\s+password\b",
    r"\bOTP\b",
    r"\bverification\s+code\b",
    r"\bsecurity\s+code\b",
    r"\bauthentication\s+code\b",
    r"\bsix[\s-]?digit\s+code\b",
    r"\blogin\s+code\b",
    r"\bconfirmation\s+code\b",
    r"\bpin\s+number\b",
    r"\bshare\s+(the|your)\s+code\b",
]

CREDENTIAL_PATTERNS = [
    r"\bpassword\b",
    r"\bcvv\b",
    r"\bcard\s+number\b",
    r"\bnet\s*banking\s+(id|password)\b",
    r"\bUPI\s+pin\b",
]

_COMPILED_OTP = [re.compile(p, re.IGNORECASE) for p in OTP_PATTERNS]
_COMPILED_CRED = [re.compile(p, re.IGNORECASE) for p in CREDENTIAL_PATTERNS]


@dataclass
class OTPMatch:
    matched_phrase: str
    pattern_category: str
    segment_index: int
    timestamp_s: float | None
    reason: str

    def to_dict(self) -> dict[str, Any]:
        return self.__dict__.copy()


@dataclass
class OTPDetectionResult:
    detected: bool
    matches: list[OTPMatch] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return {"detected": self.detected, "matches": [m.to_dict() for m in self.matches]}


class RuleBasedOTPDetector:
    """
    Initial implementation per spec Section 26: keyword/rule matching.
    The `detect` contract is stable so this can later be swapped for an NLP
    classifier (BaseOTPDetector in ml/base.py) without touching callers.
    """

    def detect(self, transcript_segments: list[dict[str, Any]]) -> dict[str, Any]:
        matches: list[OTPMatch] = []

        for idx, seg in enumerate(transcript_segments):
            text = seg.get("text", "") or ""
            ts = seg.get("start_s")

            for pattern in _COMPILED_OTP:
                m = pattern.search(text)
                if m:
                    matches.append(
                        OTPMatch(
                            matched_phrase=m.group(0),
                            pattern_category="otp_request",
                            segment_index=idx,
                            timestamp_s=ts,
                            reason="Transcript phrase matches known OTP/verification-code request pattern.",
                        )
                    )
            for pattern in _COMPILED_CRED:
                m = pattern.search(text)
                if m:
                    matches.append(
                        OTPMatch(
                            matched_phrase=m.group(0),
                            pattern_category="credential_request",
                            segment_index=idx,
                            timestamp_s=ts,
                            reason="Transcript phrase matches known credential-request pattern.",
                        )
                    )

        return OTPDetectionResult(detected=len(matches) > 0, matches=matches).to_dict()
