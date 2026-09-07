# Shared Schemas

This directory is reserved for schema definitions shared between the
Python backend and the TypeScript frontend (e.g. generated OpenAPI types,
or hand-maintained JSON Schema for the DetectorPrediction / EvidenceItem /
RiskResult contracts defined in `ml/base.py`).

For this prototype, the frontend types in `frontend/types/` are hand-written
to mirror the backend Pydantic schemas in `backend/app/schemas/schemas.py`.
A natural next step for a contributing student would be to generate
`frontend/types/api.ts` directly from the FastAPI OpenAPI spec
(`openapi-typescript` works well for this) and remove the duplication.
