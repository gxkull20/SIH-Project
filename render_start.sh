#!/usr/bin/env bash
# Render startup script for VoiceShield-AI backend.
# Called from repo root. Runs DB migrations then starts the API server.
set -e

export PYTHONPATH="${PYTHONPATH}:$(pwd):$(pwd)/backend"

echo "==> Running Alembic migrations..."
cd backend
alembic upgrade head
cd ..

echo "==> Starting VoiceShield-AI backend..."
exec uvicorn backend.app.main:app --host 0.0.0.0 --port "${PORT:-10000}"
