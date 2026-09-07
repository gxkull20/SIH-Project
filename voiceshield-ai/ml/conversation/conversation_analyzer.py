"""
ConversationAnalyzer (Section 25).

Looks for social-engineering language patterns in a transcript: urgency,
authority claims, threat-of-consequence framing, requests to bypass normal
channels. Every flagged signal carries the matched evidence — never a bare
"suspicious: true" with no reason (spec: "Every detected signal must have
supporting evidence" and "Do not assume urgency alone means fraud.").
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Any

URGENCY_PATTERNS = [
    r"\bright\s+now\b",
    r"\bimmediately\b",
    r"\bwithin\s+(the\s+)?next\s+\d+\s+(minutes|hours)\b",
    r"\byour\s+account\s+will\s+be\s+(blocked|suspended|frozen|closed)\b",
    r"\bact\s+now\b",
    r"\burgent(ly)?\b",
]

AUTHORITY_PATTERNS = [
    r"\bi\s+am\s+calling\s+from\b",
    r"\bthis\s+is\s+(an?\s+)?official\b",
    r"\bfrom\s+the\s+(bank|police|income\s+tax|government)\b",
    r"\byour\s+(supervisor|manager|senior\s+officer)\b",
]

BYPASS_CHANNEL_PATTERNS = [
    r"\bdo\s+not\s+(tell|inform|contact)\b",
    r"\bkeep\s+this\s+confidential\b",
    r"\bdon'?t\s+visit\s+the\s+branch\b",
    r"\bdon'?t\s+hang\s+up\b",
]

_CATEGORIES = {
    "urgency": URGENCY_PATTERNS,
    "authority_claim": AUTHORITY_PATTERNS,
    "bypass_channel": BYPASS_CHANNEL_PATTERNS,
}
_COMPILED = {
    cat: [re.compile(p, re.IGNORECASE) for p in patterns] for cat, patterns in _CATEGORIES.items()
}


@dataclass
class ConversationSignal:
    category: str
    matched_phrase: str
    segment_index: int
    timestamp_s: float | None

    def to_dict(self) -> dict[str, Any]:
        return self.__dict__.copy()


@dataclass
class ConversationAnalysisResult:
    signals: list[ConversationSignal] = field(default_factory=list)
    signal_counts: dict[str, int] = field(default_factory=dict)
    conversation_risk_hint: str = "low"   # low | moderate | high — a hint only, not the final risk

    def to_dict(self) -> dict[str, Any]:
        return {
            "signals": [s.to_dict() for s in self.signals],
            "signal_counts": self.signal_counts,
            "conversation_risk_hint": self.conversation_risk_hint,
        }


class RuleBasedConversationAnalyzer:
    def analyze(self, transcript_segments: list[dict[str, Any]]) -> dict[str, Any]:
        signals: list[ConversationSignal] = []

        for idx, seg in enumerate(transcript_segments):
            text = seg.get("text", "") or ""
            ts = seg.get("start_s")
            for category, patterns in _COMPILED.items():
                for pattern in patterns:
                    m = pattern.search(text)
                    if m:
                        signals.append(
                            ConversationSignal(
                                category=category,
                                matched_phrase=m.group(0),
                                segment_index=idx,
                                timestamp_s=ts,
                            )
                        )

        counts: dict[str, int] = {}
        for s in signals:
            counts[s.category] = counts.get(s.category, 0) + 1

        distinct_categories = len(counts)
        if distinct_categories >= 2 and sum(counts.values()) >= 3:
            hint = "high"
        elif distinct_categories >= 1:
            hint = "moderate"
        else:
            hint = "low"

        return ConversationAnalysisResult(
            signals=signals, signal_counts=counts, conversation_risk_hint=hint
        ).to_dict()
