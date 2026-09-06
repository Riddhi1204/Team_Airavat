import pytest
from starlette.testclient import TestClient
from sqlalchemy.orm import Session
from sqlalchemy import text


def test_reverse_geocode_endpoint(client: TestClient):
    payload = {"latitude": 28.6139, "longitude": 77.2090}
    response = client.post("/api/v1/location/reverse-geocode", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "address" in data
    assert "country" in data


def test_map_reports_bounding_box(client: TestClient):
    # Insert report in Delhi area
    client.post(
        "/api/v1/reports",
        json={
            "category": "Pothole",
            "original_description": "Delhi central road damage",
            "latitude": 28.6139,
            "longitude": 77.2090,
        },
    )

    # Query bounding box covering Delhi
    params = {
        "min_lat": 28.0,
        "max_lat": 29.0,
        "min_lng": 76.5,
        "max_lng": 78.0,
    }
    resp = client.get("/api/v1/map/reports", params=params)
    assert resp.status_code == 200
    markers = resp.json()
    assert len(markers) >= 1
    # Check lightweight marker structure
    first = markers[0]
    assert "latitude" in first
    assert "longitude" in first
    assert "category" in first
    assert "status" in first


def test_map_reports_bounding_box_outside(client: TestClient):
    # Query bounding box in a completely different location (e.g. Pacific ocean)
    params = {
        "min_lat": -50.0,
        "max_lat": -40.0,
        "min_lng": -150.0,
        "max_lng": -140.0,
    }
    resp = client.get("/api/v1/map/reports", params=params)
    assert resp.status_code == 200
    assert len(resp.json()) == 0


def test_postgis_direct_spatial_query(db_session: Session):
    # Ensure PostGIS functions work properly in db
    res = db_session.execute(
        text("SELECT ST_Distance(ST_Point(0,0)::geography, ST_Point(1,1)::geography);")
    ).scalar()
    assert res > 0.0
