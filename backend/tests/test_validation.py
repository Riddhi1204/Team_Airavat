import pytest
from app.utils.geo import is_valid_coordinate
from app.utils.validation import generate_public_reference, sanitize_text
from app.utils.files import validate_file_upload, detect_mime_type_from_bytes
from app.core.errors import AppException


def test_coordinate_validation():
    assert is_valid_coordinate(28.6139, 77.2090) is True
    assert is_valid_coordinate(-33.8688, 151.2093) is True
    assert is_valid_coordinate(90.0, 180.0) is True
    assert is_valid_coordinate(-90.0, -180.0) is True

    # Invalid coordinates
    assert is_valid_coordinate(91.0, 77.0) is False
    assert is_valid_coordinate(-90.5, 77.0) is False
    assert is_valid_coordinate(28.0, 181.0) is False
    assert is_valid_coordinate(28.0, -180.5) is False


def test_public_reference_generation():
    ref1 = generate_public_reference("CP")
    ref2 = generate_public_reference("CP")
    assert ref1.startswith("CP-")
    assert ref2.startswith("CP-")
    assert len(ref1) >= 7
    assert ref1 != ref2


def test_text_sanitization():
    raw = "   There is  a   broken pipe\n\nwith huge leak.   "
    clean = sanitize_text(raw)
    assert clean == "There is a broken pipe with huge leak."


def test_file_upload_validation_valid():
    # Valid PNG magic bytes
    png_bytes = b"\x89PNG\r\n\x1a\n" + b"\x00" * 100
    mime = validate_file_upload("evidence.png", png_bytes)
    assert mime == "image/png"

    # Valid JPEG magic bytes
    jpg_bytes = b"\xff\xd8\xff\xe0" + b"\x00" * 100
    mime = validate_file_upload("photo.jpg", jpg_bytes)
    assert mime == "image/jpeg"


def test_file_upload_validation_rejected_extension():
    png_bytes = b"\x89PNG\r\n\x1a\n" + b"\x00" * 100
    with pytest.raises(AppException) as exc:
        validate_file_upload("script.exe", png_bytes)
    assert exc.value.code == "INVALID_FILE_EXTENSION"


def test_file_upload_validation_spoofed_content():
    fake_png = b"Not a real png image at all"
    with pytest.raises(AppException) as exc:
        validate_file_upload("test.png", fake_png)
    assert exc.value.code == "INVALID_FILE_CONTENT"


def test_file_upload_validation_oversized():
    huge_bytes = b"\x89PNG\r\n\x1a\n" + b"\x00" * (11 * 1024 * 1024)
    with pytest.raises(AppException) as exc:
        validate_file_upload("huge.png", huge_bytes)
    assert exc.value.code == "FILE_TOO_LARGE"
