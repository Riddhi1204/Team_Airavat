import pytest
import json
import httpx
from unittest.mock import AsyncMock
from app.services.ai_service import AIService
from app.schemas.ai import AIEvaluationResult
from app.core.config import settings

@pytest.fixture
def mock_gemini_client(monkeypatch):
    async def mock_post(url, json=None, headers=None, **kwargs):
        class MockResponse:
            status_code = 200
            text = "Mocked Response"
            def __init__(self, raw_text):
                self.raw_text = raw_text
                
            def json(self):
                return {
                    "candidates": [
                        {
                            "content": {
                                "parts": [{"text": self.raw_text}]
                            }
                        }
                    ]
                }
                
        req_text = json["contents"][0]["parts"][0]["text"]
        complaint = req_text.split("Complaint: ")[-1].lower()
        if "fire" in complaint:
            mock_json = '{"category": "Fire", "severity": 10, "priority": "CRITICAL", "immediate_danger": true, "confidence": 0.99, "risk_indicators": ["Burns"], "reasoning_summary": "Fire detected", "recommended_action": "Fire dept"}'
        elif "collapse" in complaint:
            mock_json = '{"category": "Building Collapse", "severity": 10, "priority": "CRITICAL", "immediate_danger": true, "confidence": 0.95, "risk_indicators": ["Trapped"], "reasoning_summary": "Collapse", "recommended_action": "Rescue"}'
        elif "gas" in complaint:
            mock_json = '{"category": "Gas Leak", "severity": 10, "priority": "CRITICAL", "immediate_danger": true, "confidence": 0.98, "risk_indicators": ["Explosion"], "reasoning_summary": "Gas leak", "recommended_action": "Evacuate"}'
        elif "pothole" in complaint:
            mock_json = '{"category": "Pothole", "severity": 6, "priority": "MEDIUM", "immediate_danger": false, "confidence": 0.90, "risk_indicators": ["Damage"], "reasoning_summary": "Pothole", "recommended_action": "Repair"}'
        else:
            mock_json = '{"category": "Other", "severity": 5, "priority": "LOW", "immediate_danger": false, "confidence": 0.8, "risk_indicators": [], "reasoning_summary": "Other", "recommended_action": "Review"}'
            
        return MockResponse(mock_json)

    mock_client = AsyncMock()
    mock_client.post = mock_post
    
    # We patch httpx.AsyncClient.__aenter__ to return our mock
    async def mock_aenter(self):
        return mock_client
        
    async def mock_aexit(self, exc_type, exc_val, exc_tb):
        pass
        
    monkeypatch.setattr(httpx.AsyncClient, "__aenter__", mock_aenter)
    monkeypatch.setattr(httpx.AsyncClient, "__aexit__", mock_aexit)
    monkeypatch.setattr("app.core.config.settings.AI_PROVIDER", "gemini")
    monkeypatch.setattr("app.core.config.settings.GEMINI_API_KEY", "dummy_key")

@pytest.mark.asyncio
async def test_gemini_fire(mock_gemini_client):
    res = await AIService.analyze_text("A house is on fire")
    assert res is not None
    assert res.priority == "CRITICAL"
    assert res.immediate_danger is True

@pytest.mark.asyncio
async def test_gemini_collapse(mock_gemini_client):
    res = await AIService.analyze_text("Building collapsed and people may be trapped")
    assert res is not None
    assert res.priority == "CRITICAL"

@pytest.mark.asyncio
async def test_gemini_gas(mock_gemini_client):
    res = await AIService.analyze_text("Gas leak near residential building")
    assert res is not None
    assert res.priority == "CRITICAL"

@pytest.mark.asyncio
async def test_gemini_pothole(mock_gemini_client):
    res = await AIService.analyze_text("Large pothole damaging vehicles")
    assert res is not None
    assert res.priority == "MEDIUM"

@pytest.mark.asyncio
async def test_gemini_failure_fallback(monkeypatch):
    monkeypatch.setattr("app.core.config.settings.AI_PROVIDER", "gemini")
    monkeypatch.setattr("app.core.config.settings.GEMINI_API_KEY", "dummy_key")
    
    async def mock_aenter_fail(self):
        class FailingMock:
            async def post(self, *args, **kwargs):
                raise Exception("API Timeout")
        return FailingMock()
        
    monkeypatch.setattr(httpx.AsyncClient, "__aenter__", mock_aenter_fail)
    
    # Should fallback to heuristic returning None? No, analyze_text routes to gemini. If gemini fails, it returns None. Wait! Let's check analyze_text.
