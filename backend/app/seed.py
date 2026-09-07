"""
Run with: python -m app.seed
Populates demo (fictional) organizations/branches and model card rows.
Safe to re-run — it's idempotent per unique key.
"""
from __future__ import annotations

from app.core.db import SessionLocal
from app.models import db as models
from ml.verification.demo_directory import DEMO_ORGANIZATIONS
from ml.model_cards.registry import MODEL_CARDS


def run():
    db = SessionLocal()
    try:
        for org_key, org_data in DEMO_ORGANIZATIONS.items():
            org = db.query(models.Organization).filter_by(name=org_data["display_name"]).first()
            if not org:
                org = models.Organization(name=org_data["display_name"], is_fictional_demo_data=True)
                db.add(org)
                db.flush()
            for branch_key, branch_data in org_data["branches"].items():
                existing = db.query(models.Branch).filter_by(
                    organization_id=org.id, name=branch_key
                ).first()
                if existing:
                    continue
                location = models.Location(city=branch_data["city"], state=branch_data.get("state"))
                db.add(location)
                db.flush()
                db.add(models.Branch(organization_id=org.id, name=branch_key, location_id=location.id))

        for model_key, card in MODEL_CARDS.items():
            existing = db.query(models.ModelCard).filter_by(model_key=model_key).first()
            if existing:
                existing.card_data = card
            else:
                db.add(models.ModelCard(model_key=model_key, card_data=card))

        db.commit()
        print("Seed complete.")
    finally:
        db.close()


if __name__ == "__main__":
    run()
