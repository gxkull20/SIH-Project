from __future__ import annotations

import logging
import time
import uuid

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.logging import configure_logging
from app.core.rate_limit import rate_limit_middleware
from app.api import analyze, verify, research, reports, live, demo, simulate, samples

configure_logging()
logger = logging.getLogger("voiceshield.api")

app = FastAPI(
    title=settings.APP_NAME,
    description="Explainable voice-security and caller-verification platform.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.middleware("http")(rate_limit_middleware)


@app.middleware("http")
async def add_request_id_and_timing(request: Request, call_next):
    request_id = str(uuid.uuid4())
    start = time.perf_counter()
    try:
        response = await call_next(request)
    except Exception:
        logger.exception("Unhandled error", extra={"request_id": request_id, "path": request.url.path})
        return JSONResponse(
            status_code=500,
            content={"detail": "An unexpected error occurred.", "request_id": request_id},
        )
    duration_ms = (time.perf_counter() - start) * 1000
    response.headers["X-Request-ID"] = request_id
    logger.info(
        "request_completed",
        extra={"request_id": request_id, "path": request.url.path, "duration_ms": round(duration_ms, 2)},
    )
    return response


@app.get("/health")
def health():
    return {"status": "ok", "service": settings.APP_NAME, "environment": settings.ENVIRONMENT}


app.include_router(analyze.router)
app.include_router(verify.router)
app.include_router(research.router)
app.include_router(reports.router)
app.include_router(live.router)
app.include_router(demo.router)
app.include_router(simulate.router)
app.include_router(samples.router)
