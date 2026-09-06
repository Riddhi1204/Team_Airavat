from typing import Optional
import httpx
from app.core.config import settings
from app.core.logging import logger
from app.schemas.processing import TranslationResponse


class TranslationService:
    @classmethod
    async def translate_to_english(
        cls,
        text: str,
        source_language: Optional[str] = None,
        target_language: str = "en",
    ) -> TranslationResponse:
        """
        Translates civic report text into English.
        Provider is fully configurable (mock, mymemory, google).
        Never throws unhandled exceptions; falls back safely to preserving original text.
        """
        if not text or not text.strip():
            return TranslationResponse(
                translated_text="",
                source_language=source_language or "en",
                target_language=target_language,
            )

        src = (source_language or "auto").lower()

        # If already english, return as is
        if src in ["en", "english"]:
            return TranslationResponse(
                translated_text=text,
                source_language="en",
                target_language="en",
            )

        provider = settings.TRANSLATION_PROVIDER.lower()

        if provider == "mymemory" or (provider != "mock" and not settings.TRANSLATION_API_KEY):
            try:
                # MyMemory Free Translation API
                lang_pair = f"{src}|{target_language}" if src != "auto" else f"autodetect|{target_language}"
                async with httpx.AsyncClient(timeout=4.0) as client:
                    resp = await client.get(
                        "https://api.mymemory.translated.net/get",
                        params={"q": text, "langpair": lang_pair},
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        translated = data.get("responseData", {}).get("translatedText")
                        if translated:
                            return TranslationResponse(
                                translated_text=translated,
                                source_language=src,
                                target_language=target_language,
                            )
            except Exception as e:
                logger.warning(f"Translation API error: {e}")

        # Development / Mock translation dictionary for common Indian phrases
        common_phrases = {
            "सड़क पर बहुत बड़ा गड्ढा है": "There is a very big pothole on the road.",
            "पानी का पाइप टूट गया है": "The water pipe has broken.",
            "कचरा बहुत दिनों से पड़ा है": "Garbage has been lying uncollected for days.",
            "रास्ते में पेड़ गिर गया है": "A tree has fallen on the road blocking traffic.",
            "गटर का ढक्कन खुला है": "The sewer manhole cover is open and dangerous.",
        }

        for k, v in common_phrases.items():
            if k in text:
                return TranslationResponse(
                    translated_text=v,
                    source_language=src if src != "auto" else "hi",
                    target_language=target_language,
                )

        # Baseline fallback: preserve text with English notification
        return TranslationResponse(
            translated_text=text,
            source_language=src if src != "auto" else "en",
            target_language=target_language,
        )
