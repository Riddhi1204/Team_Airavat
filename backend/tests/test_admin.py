import pytest
from starlette.testclient import TestClient
from app.core.config import settings
from app.models.report import ReportStatus


def test_admin_login_success(client: TestClient):
    resp = client.post(
        "/api/v1/auth/login",
        json={"email": settings.ADMIN_DEFAULT_EMAIL, "password": settings.ADMIN_DEFAULT_PASSWORD},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == settings.ADMIN_DEFAULT_EMAIL


def test_admin_login_failure(client: TestClient):
    resp = client.post(
        "/api/v1/auth/login",
        json={"email": settings.ADMIN_DEFAULT_EMAIL, "password": "WrongPassword123!"},
    )
    assert resp.status_code == 401
    assert resp.json()["error"]["code"] == "INVALID_CREDENTIALS"


def test_admin_reports_unauthorized(client: TestClient):
    resp = client.get("/api/v1/admin/reports")
    assert resp.status_code == 401


def test_admin_reports_authorized_viewer(client: TestClient, viewer_token: str):
    headers = {"Authorization": f"Bearer {viewer_token}"}
    resp = client.get("/api/v1/admin/reports", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "items" in data
    assert "total" in data


def test_admin_status_update_forbidden_for_viewer(client: TestClient, viewer_token: str):
    headers = {"Authorization": f"Bearer {viewer_token}"}
    resp = client.patch(
        "/api/v1/admin/reports/1/status",
        headers=headers,
        json={"status": "IN_PROGRESS"},
    )
    assert resp.status_code == 403


def test_admin_status_update_allowed_for_operator(client: TestClient, operator_token: str):
    # First create a report
    rep = client.post(
        "/api/v1/reports",
        json={
            "category": "Garbage",
            "original_description": "Garbage pile blocking sidewalk",
            "latitude": 13.0827,
            "longitude": 80.2707,
        },
    ).json()

    headers = {"Authorization": f"Bearer {operator_token}"}
    resp = client.patch(
        f"/api/v1/admin/reports/{rep['id']}/status",
        headers=headers,
        json={"status": "IN_PROGRESS", "note": "Assigned team deployed for cleanup."},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "IN_PROGRESS"


def test_admin_assign_report(client: TestClient, operator_token: str, admin_headers: dict):
    # Create report
    rep = client.post(
        "/api/v1/reports",
        json={
            "category": "Water Leakage",
            "original_description": "Water leaking from main line valve",
            "latitude": 17.3850,
            "longitude": 78.4867,
        },
    ).json()

    headers = {"Authorization": f"Bearer {operator_token}"}
    assign_payload = {
        "department": "Public Works & Water Board",
        "assigned_to": "Engineer Ramesh Kumar",
        "note": "Urgent inspection needed.",
    }
    resp = client.post(
        f"/api/v1/admin/reports/{rep['id']}/assign",
        headers=headers,
        json=assign_payload,
    )
    assert resp.status_code == 201
    assigned = resp.json()
    assert assigned["department"] == "Public Works & Water Board"
    assert assigned["assigned_to"] == "Engineer Ramesh Kumar"

    # Verify admin detail reflects assignment and updated status
    detail_resp = client.get(f"/api/v1/admin/reports/{rep['id']}", headers=admin_headers)
    assert detail_resp.status_code == 200
    detail = detail_resp.json()
    assert len(detail["assignments"]) >= 1
    assert detail["status"] == "ASSIGNED"
