import os
import uuid
from typing import Tuple, Optional
from app.core.config import settings
from app.core.errors import AppException

MAGIC_NUMBERS = {
    b"\xff\xd8\xff": "image/jpeg",
    b"\x89PNG\r\n\x1a\n": "image/png",
    b"GIF87a": "image/gif",
    b"GIF89a": "image/gif",
}


def detect_mime_type_from_bytes(data: bytes) -> Optional[str]:
    """Inspect magic numbers of bytes to detect actual image mime type."""
    if len(data) >= 8:
        for magic, mime in MAGIC_NUMBERS.items():
            if data.startswith(magic):
                return mime
    if len(data) >= 12 and data.startswith(b"RIFF") and data[8:12] == b"WEBP":
        return "image/webp"
    return None


def validate_file_upload(filename: str, content: bytes) -> str:
    """
    Validates file extension, size, and magic bytes.
    Returns the verified MIME type.
    """
    if len(content) > settings.MAX_UPLOAD_SIZE_BYTES:
        raise AppException(
            f"File size exceeds maximum permitted limit of {settings.MAX_UPLOAD_SIZE_BYTES // (1024*1024)}MB",
            code="FILE_TOO_LARGE",
            status_code=413,
        )

    ext = os.path.splitext(filename)[1].lower()
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise AppException(
            f"File extension '{ext}' is not allowed. Allowed extensions: {', '.join(settings.ALLOWED_EXTENSIONS)}",
            code="INVALID_FILE_EXTENSION",
            status_code=400,
        )

    detected_mime = detect_mime_type_from_bytes(content)
    if not detected_mime or detected_mime not in settings.ALLOWED_MEDIA_TYPES:
        raise AppException(
            "File content does not match a valid supported image format (JPEG, PNG, WebP, GIF)",
            code="INVALID_FILE_CONTENT",
            status_code=400,
        )

    return detected_mime


def save_upload_file(content: bytes, original_filename: str) -> Tuple[str, str]:
    """
    Saves binary content with a collision-free UUID filename inside UPLOAD_DIRECTORY.
    Returns (relative_file_path, secure_filename).
    """
    upload_dir = settings.UPLOAD_DIRECTORY
    if not os.path.isabs(upload_dir):
        # Resolve relative to backend directory
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
        upload_dir = os.path.join(base_dir, upload_dir)

    os.makedirs(upload_dir, exist_ok=True)

    ext = os.path.splitext(original_filename)[1].lower()
    secure_name = f"{uuid.uuid4().hex}{ext}"
    full_path = os.path.join(upload_dir, secure_name)

    with open(full_path, "wb") as f:
        f.write(content)

    relative_path = f"uploads/{secure_name}"
    return relative_path, secure_name
