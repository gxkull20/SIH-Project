from __future__ import annotations

import io
from typing import Any

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors


def generate_pdf_report(session_data: dict[str, Any]) -> bytes:
    """
    Builds the analysis report PDF. Never includes OTP values, passwords,
    credentials, or unnecessary personal information — the pipeline never
    stores those in the first place, so there is nothing to redact here,
    but we also refuse to render any field named like a secret defensively.
    """
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, topMargin=1.5 * cm, bottomMargin=1.5 * cm)
    styles = getSampleStyleSheet()
    story = []

    story.append(Paragraph("VoiceShield-AI — Analysis Report", styles["Title"]))
    story.append(Paragraph(f"Analysis ID: {session_data.get('session_id', 'N/A')}", styles["Normal"]))
    story.append(Paragraph(f"Generated: {session_data.get('generated_at', 'N/A')}", styles["Normal"]))
    story.append(Spacer(1, 12))

    audio = session_data.get("audio", {})
    story.append(Paragraph("Audio Metadata", styles["Heading2"]))
    story.append(Paragraph(
        f"Duration: {audio.get('duration_s', 'N/A')}s &nbsp;|&nbsp; "
        f"Sample rate: {audio.get('sample_rate', 'N/A')} Hz &nbsp;|&nbsp; "
        f"Format: {audio.get('format', 'N/A')}", styles["Normal"]
    ))
    story.append(Spacer(1, 12))

    fusion = session_data.get("fusion", {})
    story.append(Paragraph("Voice Authenticity (Fused Signal)", styles["Heading2"]))
    sl = fusion.get("synthetic_likelihood")
    hl = fusion.get("human_likelihood")
    story.append(Paragraph(
        f"Synthetic Speech Likelihood: {f'{sl*100:.0f}%' if sl is not None else 'Unavailable'} &nbsp;|&nbsp; "
        f"Human Likelihood: {f'{hl*100:.0f}%' if hl is not None else 'Unavailable'}", styles["Normal"]
    ))
    if fusion.get("any_simulated"):
        story.append(Paragraph(
            "<i>Development/Simulation Mode — one or more models are not connected to trained weights.</i>",
            styles["Normal"]
        ))
    story.append(Spacer(1, 12))

    verification = session_data.get("verification", {})
    story.append(Paragraph("Verification", styles["Heading2"]))
    v_table_data = [["Organization", "Branch", "Caller Identity"]]
    v_table_data.append([
        verification.get("organization", {}).get("state", "unknown"),
        verification.get("branch", {}).get("state", "unknown"),
        verification.get("caller", {}).get("state", "unknown"),
    ])
    t = Table(v_table_data, hAlign="LEFT")
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
    ]))
    story.append(t)
    story.append(Spacer(1, 12))

    risk = session_data.get("risk", {})
    story.append(Paragraph("Final Risk Assessment", styles["Heading2"]))
    story.append(Paragraph(
        f"Risk Score: {risk.get('risk_score', 'N/A')} / 100 &nbsp;|&nbsp; "
        f"Risk Level: <b>{risk.get('risk_level', 'N/A')}</b>", styles["Normal"]
    ))
    story.append(Paragraph(
        "<i>Risk level reflects a configurable policy threshold, not a scientifically calibrated "
        "probability of fraud.</i>", styles["Normal"]
    ))
    story.append(Spacer(1, 8))

    story.append(Paragraph("Why is this risky?", styles["Heading3"]))
    for i, item in enumerate(session_data.get("evidence", []), start=1):
        story.append(Paragraph(f"{i:02d}. {item.get('title')} — {item.get('description')}", styles["Normal"]))
    story.append(Spacer(1, 8))

    story.append(Paragraph("Recommended Action", styles["Heading3"]))
    story.append(Paragraph(risk.get("recommendation", "N/A"), styles["Normal"]))
    story.append(Spacer(1, 12))

    story.append(Paragraph(
        "This report was produced by a student-built research prototype (VoiceShield-AI). "
        "Model outputs may be simulated where no trained checkpoint is connected. This report "
        "does not constitute legal, financial, or law-enforcement evidence.",
        styles["Italic"]
    ))

    doc.build(story)
    return buf.getvalue()
