import pytest
from starlette.testclient import TestClient


def test_dashboard_overview(client: TestClient, admin_headers: dict):
    resp = client.get("/api/v1/dashboard/overview", headers=admin_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "total_reports" in data
    assert "pending" in data
    assert "resolved" in data
    assert "critical" in data
    assert "high" in data
    assert "medium" in data
    assert "low" in data
    assert data["total_reports"] >= 1


def test_dashboard_statistics(client: TestClient, admin_headers: dict):
    resp = client.get("/api/v1/dashboard/statistics", headers=admin_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "reports_over_time" in data
    assert "category_distribution" in data
    assert "status_distribution" in data
    assert "priority_distribution" in data
    assert "district_distribution" in data


def test_dashboard_priority_queue(client: TestClient, admin_headers: dict):
    resp = client.get("/api/v1/dashboard/priority", headers=admin_headers)
    assert resp.status_code == 200
    items = resp.json()
    assert isinstance(items, list)
    if len(items) > 1:
        # Verify sorted by descending priority score
        scores = [i["priority_score"] for i in items if i["priority_score"] is not None]
        assert scores == sorted(scores, reverse=True)
