from typing import Optional
from pydantic import BaseModel, Field


class TranscriptionResponse(BaseModel):
    text: str
    detected_language: Optional[str] = None
    confidence: Optional[float] = None


class TranslationRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=10000)
    source_language: Optional[str] = None
    target_language: str = "en"


class TranslationResponse(BaseModel):
    translated_text: str
    source_language: str
    target_language: str
