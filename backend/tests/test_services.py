import pytest
from sqlalchemy.orm import Session
from app.services.speech_service import SpeechService
from app.services.translation_service import TranslationService
from app.services.ai_service import AIService
from app.services.weather_service import WeatherService
from app.services.population_service import PopulationService


@pytest.mark.asyncio
async def test_speech_service_transcribe(monkeypatch):
    monkeypatch.setattr("app.core.config.settings.SPEECH_PROVIDER", "mock")
    audio_bytes = b"RIFF....WAVEfmt ...."
    result = await SpeechService.transcribe(audio_bytes=audio_bytes, filename="test.wav")
    assert result.text is not None
    assert len(result.text) > 5
    assert result.detected_language == "en"
    assert result.confidence is not None


@pytest.mark.asyncio
async def test_translation_service_english():
    text = "Road is broken near the bridge"
    result = await TranslationService.translate_to_english(text=text, source_language="en")
    assert result.translated_text == text
    assert result.target_language == "en"


@pytest.mark.asyncio
async def test_translation_service_hindi():
    hindi_text = "सड़क पर बहुत बड़ा गड्ढा है"
    result = await TranslationService.translate_to_english(text=hindi_text, source_language="hi")
    assert "pothole" in result.translated_text.lower() or "road" in result.translated_text.lower()
    assert result.target_language == "en"


@pytest.mark.asyncio
async def test_ai_service_heuristic_analysis():
    pothole_text = "Large crater and deep pothole causing severe hazard on main junction."
    res = await AIService.analyze_text(pothole_text)
    assert res is not None
    assert res.category == "Pothole"
    assert res.severity >= 7
    assert len(res.risk_indicators) >= 1
    assert "pothole" in res.reasoning_summary.lower()


@pytest.mark.asyncio
async def test_weather_service_graceful():
    # Calling with coordinates should never throw exception
    weather = await WeatherService.get_weather(latitude=28.6139, longitude=77.2090)
    assert "weather_available" in weather


def test_population_service_fallback(db_session: Session):
    # Outside any installed grid, should return population_available=False cleanly without fabricating numbers
    pop = PopulationService.estimate_affected_population(
        db=db_session, latitude=0.0, longitude=0.0, radius_meters=500
    )
    assert "population_available" in pop
    assert pop["population_available"] is False
    assert pop["estimated_population"] is None


def test_population_service_installed_grid(db_session: Session):
    # Within installed Delhi grid
    pop = PopulationService.estimate_affected_population(
        db=db_session, latitude=28.6139, longitude=77.2090, radius_meters=1000
    )
    assert pop["population_available"] is True
    assert pop["estimated_population"] > 0
