"""
OrganizationVerifier, BranchVerifier, CallerVerifier (Sections 27-29).

All three verify claims *against the fictional demo directory only*. They
never claim real-world identity assurance, and caller ID is always treated
as one weak, spoofable signal — never proof of identity on its own.
"""

from __future__ import annotations

from typing import Any, Optional

from ml.base import VerificationState
from ml.verification.demo_directory import DEMO_ORGANIZATIONS, normalize


class OrganizationVerifier:
    def verify(self, claimed_org: Optional[str]) -> dict[str, Any]:
        key = normalize(claimed_org)
        if not key:
            return {
                "state": VerificationState.UNKNOWN.value,
                "claimed_organization": claimed_org,
                "reason": "No organization claim was extracted from the conversation.",
            }
        org = DEMO_ORGANIZATIONS.get(key)
        if org is None:
            return {
                "state": VerificationState.UNKNOWN.value,
                "claimed_organization": claimed_org,
                "reason": f"'{claimed_org}' does not match any organization in the demo directory.",
            }
        return {
            "state": VerificationState.VERIFIED.value,
            "claimed_organization": claimed_org,
            "matched_organization": org["display_name"],
            "reason": "Organization name matches an entry in the demo verification directory.",
            "is_fictional_demo_data": True,
        }


class BranchVerifier:
    def verify(
        self, claimed_org: Optional[str], claimed_branch: Optional[str], claimed_city: Optional[str]
    ) -> dict[str, Any]:
        org_key = normalize(claimed_org)
        branch_key = normalize(claimed_branch) or normalize(claimed_city)

        if not org_key or org_key not in DEMO_ORGANIZATIONS:
            return {
                "state": VerificationState.UNKNOWN.value,
                "reason": "Organization is unverified or unknown, so branch cannot be checked.",
            }
        if not branch_key:
            return {
                "state": VerificationState.UNKNOWN.value,
                "reason": "No branch/location claim was extracted from the conversation.",
            }

        org = DEMO_ORGANIZATIONS[org_key]
        branch = org["branches"].get(branch_key)
        if branch is None:
            return {
                "state": VerificationState.INCONSISTENT.value,
                "claimed_branch": claimed_branch,
                "reason": f"'{claimed_branch or claimed_city}' is not a known branch of {org['display_name']} "
                          f"in the demo directory.",
                "is_fictional_demo_data": True,
            }
        return {
            "state": VerificationState.VERIFIED.value,
            "claimed_branch": claimed_branch,
            "matched_city": branch["city"],
            "reason": "Branch/location is consistent with the demo directory.",
            "is_fictional_demo_data": True,
        }


class CallerVerifier:
    """
    Caller ID is treated strictly as ONE independent signal. Even a caller ID
    that matches the demo directory never upgrades the overall state to
    fully 'verified' identity — it always requires independent verification.
    """

    def verify(
        self, caller_id: Optional[str], org_result: dict[str, Any], branch_result: dict[str, Any]
    ) -> dict[str, Any]:
        if not caller_id:
            return {
                "state": VerificationState.UNKNOWN.value,
                "caller_id_known": False,
                "reason": "No caller ID was provided for this session.",
            }

        org_key = None
        matched_org_name = org_result.get("matched_organization")
        if matched_org_name:
            for key, org in DEMO_ORGANIZATIONS.items():
                if org["display_name"] == matched_org_name:
                    org_key = key
                    break

        caller_id_known = bool(
            org_key and caller_id in DEMO_ORGANIZATIONS[org_key].get("known_caller_ids", [])
        )

        return {
            "state": VerificationState.REQUIRES_INDEPENDENT_VERIFICATION.value,
            "caller_id_known": caller_id_known,
            "reason": (
                "Caller ID matches a number on file for the claimed organization in the demo "
                "directory, but caller ID can be spoofed and is never treated as sole proof of "
                "identity."
                if caller_id_known
                else "Caller ID does not match any number on file for the claimed organization. "
                     "Caller ID alone — even if it matched — would not prove identity."
            ),
        }
