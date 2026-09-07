"""
Demo verification directory (Section 27).

Every organization/branch here is FICTIONAL and exists only to make the
verification pipeline demonstrable. None of this represents real-world
bank/branch data or a connection to any real institution's systems.
"""

from __future__ import annotations

DEMO_ORGANIZATIONS: dict[str, dict] = {
    "demo bank": {
        "display_name": "Demo Bank",
        "is_fictional": True,
        "branches": {
            "chennai": {"city": "Chennai", "state": "Tamil Nadu"},
            "coimbatore": {"city": "Coimbatore", "state": "Tamil Nadu"},
            "bangalore": {"city": "Bangalore", "state": "Karnataka"},
            "hyderabad": {"city": "Hyderabad", "state": "Telangana"},
        },
        "known_caller_ids": ["+91-DEMO-1000", "+91-DEMO-1001"],
    },
    "demo telecom": {
        "display_name": "Demo Telecom",
        "is_fictional": True,
        "branches": {
            "chennai": {"city": "Chennai", "state": "Tamil Nadu"},
            "mumbai": {"city": "Mumbai", "state": "Maharashtra"},
        },
        "known_caller_ids": ["+91-DEMO-2000"],
    },
}


def normalize(text: str | None) -> str | None:
    return text.strip().lower() if text else None
