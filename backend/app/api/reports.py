from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.models import db as models
from app.services.report_generator import generate_pdf_report
from app.services.storage import get_storage
from app.api.analyze import _serialize_session_from_db

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.get("/{analysis_id}")
def get_report(analysis_id: str, db: Session = Depends(get_db)):
    session_row = db.query(models.AnalysisSession).filter_by(id=analysis_id).first()
    if not session_row:
        raise HTTPException(status_code=404, detail="Analysis session not found.")
    if session_row.status != "complete":
        raise HTTPException(status_code=409, detail="Analysis is not complete yet.")

    session_data = _serialize_session_from_db(db, session_row)
    session_data["generated_at"] = datetime.now(timezone.utc).isoformat()

    pdf_bytes = generate_pdf_report(session_data)

    store = get_storage()
    # We keep the PDF bytes ephemeral for the prototype response; persistence
    # of report artifacts to storage is wired via Report row for auditability.
    report_row = db.query(models.Report).filter_by(session_id=session_row.id).first()
    if not report_row:
        report_row = models.Report(session_id=session_row.id)
        db.add(report_row)
        db.commit()

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=voiceshield-report-{analysis_id[:8]}.pdf"},
    )
