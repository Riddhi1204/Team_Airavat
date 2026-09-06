import io
import pytest
from starlette.testclient import TestClient


def test_create_public_report_success(client: TestClient):
    payload = {
        "category": "Pothole",
        "original_description": "Severe pothole near city junction causing damage to vehicles.",
        "original_language": "en",
        "latitude": 28.6139,
        "longitude": 77.2090,
    }
    response = client.post("/api/v1/reports", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert "public_reference" in data
    assert data["public_reference"].startswith("CP-")
    assert data["status"] in ["SUBMITTED", "PRIORITIZED"]


def test_create_public_report_invalid_coordinates(client: TestClient):
    payload = {
        "category": "Pothole",
        "original_description": "Coordinates out of bounds test",
        "original_language": "en",
        "latitude": 95.0,  # Invalid > 90
        "longitude": 77.2090,
    }
    response = client.post("/api/v1/reports", json=payload)
    assert response.status_code == 422 or response.status_code == 400


def test_get_public_report(client: TestClient):
    # First create
    create_payload = {
        "category": "Broken Streetlight",
        "original_description": "Streetlight pole broken and dark at night on 5th Avenue.",
        "original_language": "en",
        "latitude": 19.0760,
        "longitude": 72.8777,
    }
    create_resp = client.post("/api/v1/reports", json=create_payload)
    assert create_resp.status_code == 201
    created = create_resp.json()
    report_id = created["id"]
    public_ref = created["public_reference"]

    # Retrieve by ID
    get_resp = client.get(f"/api/v1/reports/{report_id}")
    assert get_resp.status_code == 200
    data = get_resp.json()
    assert data["id"] == report_id
    assert data["public_reference"] == public_ref
    assert data["category"] == "Broken Streetlight"
    assert "Streetlight pole broken" in data["english_description"]

    # Retrieve by Public Reference
    ref_resp = client.get(f"/api/v1/reports/{public_ref}")
    assert ref_resp.status_code == 200
    assert ref_resp.json()["id"] == report_id


def test_upload_report_media(client: TestClient):
    # Create report
    create_resp = client.post(
        "/api/v1/reports",
        json={
            "category": "Flooding",
            "original_description": "Flooding on main road after heavy rain.",
            "latitude": 12.9716,
            "longitude": 77.5946,
        },
    )
    report_id = create_resp.json()["id"]

    # Create dummy valid PNG image bytes
    valid_png = (
        b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
        b"\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
    )

    files = {"file": ("flood.png", io.BytesIO(valid_png), "image/png")}
    upload_resp = client.post(f"/api/v1/reports/{report_id}/media", files=files)
    assert upload_resp.status_code == 201
    media_data = upload_resp.json()
    assert media_data["report_id"] == report_id
    assert media_data["original_filename"] == "flood.png"
    assert media_data["mime_type"] == "image/png"
