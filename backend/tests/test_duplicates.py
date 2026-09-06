import pytest
from starlette.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.report import Report


import time

def test_duplicate_detection_nearby(client: TestClient, db_session: Session):
    unique_offset = (time.time() % 1000) * 0.001
    lat = 22.5000 + unique_offset
    lng = 88.3000 + unique_offset

    # First report
    rep1 = client.post(
        "/api/v1/reports",
        json={
            "category": "Pothole",
            "original_description": "Dangerous pothole near the highway entrance",
            "latitude": lat,
            "longitude": lng,
        },
    ).json()

    # Second report very close by (approx 50m away) with same category
    rep2 = client.post(
        "/api/v1/reports",
        json={
            "category": "Pothole",
            "original_description": "Large pothole right near the highway entrance ramp",
            "latitude": lat + 0.0003,
            "longitude": lng + 0.0003,
        },
    ).json()

    # Query db to inspect duplicate flags
    report2_db = db_session.query(Report).filter(Report.id == rep2["id"]).first()
    assert report2_db.is_duplicate is True
    assert report2_db.duplicate_of_id == rep1["id"]
