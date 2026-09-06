from typing import Optional, Dict, Any
from app.core.config import settings
from app.core.logging import logger
from app.schemas.processing import TranscriptionResponse
from app.core.errors import AppException

class SpeechService:
    @classmethod
    async def transcribe(cls, audio_bytes: bytes, filename: str = "audio.wav") -> TranscriptionResponse:
        """
        Transcribes speech audio into text with detected language and confidence.
        Supports configurable providers (mock, sarvam, whisper).
        """
        provider = settings.SPEECH_PROVIDER.lower()

        if provider == "sarvam":
            return await cls._sarvam_transcribe(audio_bytes, filename)
        elif provider == "whisper" and settings.SPEECH_API_KEY:
            try:
                import httpx
                # OpenAI Whisper API or compatible endpoint
                headers = {"Authorization": f"Bearer {settings.SPEECH_API_KEY}"}
                files = {"file": (filename, audio_bytes, "audio/wav")}
                data = {"model": "whisper-1"}
                async with httpx.AsyncClient(timeout=15.0) as client:
                    resp = await client.post("https://api.openai.com/v1/audio/transcriptions", headers=headers, files=files, data=data)
                    if resp.status_code == 200:
                        res = resp.json()
                        return TranscriptionResponse(
                            text=res.get("text", "").strip(),
                            detected_language=res.get("language", "en"),
                            confidence=0.95,
                        )
            except Exception as e:
                logger.warning(f"Remote Whisper transcription error: {e}")

        if provider == "mock":
            return cls._mock_transcribe(audio_bytes, filename)
            
        raise AppException(
            message=f"Speech provider '{provider}' failed or is not configured properly.",
            code="SPEECH_PROVIDER_ERROR",
            status_code=500
        )

    @classmethod
    async def _sarvam_transcribe(cls, audio_bytes: bytes, filename: str) -> TranscriptionResponse:
        if not settings.SPEECH_API_KEY:
            raise AppException(
                message="SARVAM_API_KEY / SPEECH_API_KEY is not configured.",
                code="SPEECH_CONFIG_ERROR",
                status_code=500
            )
            
        try:
            from sarvamai import SarvamAI
            import asyncio
            
            # Use run_in_executor if sarvamai is synchronous. It seems synchronous based on the docs!
            # Wait, from docs: client.speech_to_text.translate() is a normal method.
            client = SarvamAI(api_subscription_key=settings.SPEECH_API_KEY)
            
            def run_sarvam():
                return client.speech_to_text.transcribe(
                    file=(filename, audio_bytes, "audio/webm"),
                    model=settings.SPEECH_MODEL,
                    mode="translate",
                    language_code="unknown"
                )
                
            resp = await asyncio.to_thread(run_sarvam)
            
            return TranscriptionResponse(
                text=resp.transcript.strip(),
                detected_language=resp.language_code,
                confidence=resp.language_probability
            )
        except ImportError:
            raise AppException(
                message="sarvamai package is not installed.",
                code="SPEECH_DEPENDENCY_ERROR",
                status_code=500
            )
        except Exception as e:
            logger.error(f"Sarvam AI transcription error: {str(e)}")
            raise AppException(
                message=f"Speech transcription failed: {str(e)}",
                code="SPEECH_TRANSCRIPTION_FAILED",
                status_code=502
            )

    @classmethod
    def _mock_transcribe(cls, audio_bytes: bytes, filename: str) -> TranscriptionResponse:
        """Mock speech transcription provider for local development."""
        size_kb = len(audio_bytes) / 1024
        sample_transcript = (
            "There is a deep pothole on the main road right near the government hospital entrance. "
            "It is causing severe traffic backup and risk of two-wheeler accidents."
        )
        return TranscriptionResponse(
            text=sample_transcript,
            detected_language="en",
            confidence=0.92,
        )
