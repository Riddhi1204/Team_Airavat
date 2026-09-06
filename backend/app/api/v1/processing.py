from fastapi import APIRouter, UploadFile, File, Form, status
from app.schemas.processing import TranscriptionResponse, TranslationRequest, TranslationResponse
from app.services.speech_service import SpeechService
from app.services.translation_service import TranslationService
from app.core.errors import AppException

router = APIRouter(prefix="/processing", tags=["Processing"])


@router.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio(audio: UploadFile = File(...)):
    """
    Speech-to-text processing endpoint.
    Accepts audio file upload and returns transcription with detected language and confidence.
    """
    content = await audio.read()
    if not content:
        raise AppException("Uploaded audio file is empty", code="EMPTY_AUDIO_FILE", status_code=400)

    result = await SpeechService.transcribe(audio_bytes=content, filename=audio.filename or "speech.wav")
    return result


@router.post("/translate", response_model=TranslationResponse)
async def translate_text(payload: TranslationRequest):
    """
    Translates description text into English while preserving source metadata.
    """
    result = await TranslationService.translate_to_english(
        text=payload.text,
        source_language=payload.source_language,
        target_language=payload.target_language,
    )
    return result
