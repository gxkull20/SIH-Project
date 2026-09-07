from __future__ import annotations

import os
import uuid

from app.core.config import settings


class StorageError(Exception):
    pass


def _safe_join(base: str, filename: str) -> str:
    """Prevents path traversal — filename is stripped to its basename only."""
    safe_name = os.path.basename(filename)
    return os.path.join(base, safe_name)


class LocalStorage:
    def __init__(self, base_path: str = settings.LOCAL_STORAGE_PATH):
        self.base_path = os.path.abspath(base_path)
        os.makedirs(self.base_path, exist_ok=True)

    def save(self, file_bytes: bytes, original_filename: str) -> str:
        ext = original_filename.rsplit(".", 1)[-1] if "." in original_filename else "bin"
        safe_name = f"{uuid.uuid4().hex}.{ext}"
        path = _safe_join(self.base_path, safe_name)
        with open(path, "wb") as f:
            f.write(file_bytes)
        return path

    def read(self, path: str) -> bytes:
        abs_path = os.path.abspath(path)
        try:
            if os.path.commonpath([abs_path, self.base_path]) != self.base_path:
                raise StorageError("Refusing to read a path outside the storage root.")
        except ValueError:
            raise StorageError("Refusing to read a path outside the storage root.")
        with open(abs_path, "rb") as f:
            return f.read()


class S3CompatibleStorage:
    """
    Placeholder implementing the same interface for MinIO/S3. Not wired up
    by default in this prototype — set STORAGE_BACKEND=s3 and the S3_* env
    vars, and install boto3, to use it.
    """
    def __init__(self):
        try:
            import boto3
        except ImportError as exc:
            raise StorageError("boto3 is not installed; cannot use S3-compatible storage.") from exc
        self._client = boto3.client(
            "s3",
            endpoint_url=settings.S3_ENDPOINT_URL,
            aws_access_key_id=settings.S3_ACCESS_KEY,
            aws_secret_access_key=settings.S3_SECRET_KEY,
        )
        self._bucket = settings.S3_BUCKET

    def save(self, file_bytes: bytes, original_filename: str) -> str:
        ext = original_filename.rsplit(".", 1)[-1] if "." in original_filename else "bin"
        key = f"{uuid.uuid4().hex}.{ext}"
        self._client.put_object(Bucket=self._bucket, Key=key, Body=file_bytes)
        return f"s3://{self._bucket}/{key}"

    def read(self, path: str) -> bytes:
        key = path.split("/", 3)[-1]
        obj = self._client.get_object(Bucket=self._bucket, Key=key)
        return obj["Body"].read()


def get_storage():
    if settings.STORAGE_BACKEND == "s3":
        return S3CompatibleStorage()
    return LocalStorage()
