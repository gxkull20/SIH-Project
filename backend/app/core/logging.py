from __future__ import annotations

import logging
import sys
from pythonjsonlogger import jsonlogger

from app.core.config import settings

# Fields that must never appear in a log line, even accidentally.
_REDACTED_KEYS = {"otp", "otp_code", "password", "credential", "cvv", "pin", "card_number"}


class RedactingFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        if hasattr(record, "msg") and isinstance(record.msg, dict):
            for key in list(record.msg.keys()):
                if key.lower() in _REDACTED_KEYS:
                    record.msg[key] = "[REDACTED]"
        return True


def configure_logging() -> None:
    handler = logging.StreamHandler(sys.stdout)
    formatter = jsonlogger.JsonFormatter(
        "%(asctime)s %(levelname)s %(name)s %(message)s",
        rename_fields={"asctime": "timestamp", "levelname": "level"},
    )
    handler.setFormatter(formatter)
    handler.addFilter(RedactingFilter())

    root = logging.getLogger()
    root.handlers = [handler]
    root.setLevel(settings.LOG_LEVEL)


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)
