from __future__ import annotations

import time
from collections import defaultdict, deque

from fastapi import Request
from starlette.responses import JSONResponse

from app.core.config import settings


class InMemoryRateLimiter:
    """
    A minimal sliding-window rate limiter keyed by client IP.

    This is intentionally simple (in-process, not distributed) — correct
    for a single-instance student deployment. A real multi-instance
    deployment should replace this with a Redis-backed limiter; that swap
    only touches this file.
    """

    def __init__(self, requests_per_minute: int):
        self.limit = requests_per_minute
        self.window_seconds = 60.0
        self._hits: dict[str, deque] = defaultdict(deque)

    def allow(self, key: str) -> bool:
        now = time.monotonic()
        bucket = self._hits[key]
        while bucket and now - bucket[0] > self.window_seconds:
            bucket.popleft()
        if len(bucket) >= self.limit:
            return False
        bucket.append(now)
        return True


_limiter = InMemoryRateLimiter(settings.RATE_LIMIT_PER_MINUTE)


async def rate_limit_middleware(request: Request, call_next):
    # Health checks and WebSocket upgrades are exempt.
    if request.url.path == "/health" or request.url.path.startswith("/api/live"):
        return await call_next(request)

    client_ip = request.client.host if request.client else "unknown"
    if not _limiter.allow(client_ip):
        return JSONResponse(
            status_code=429,
            content={"detail": "Rate limit exceeded. Please slow down."},
        )
    return await call_next(request)
