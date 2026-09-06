import random
import string
import time


def generate_public_reference(prefix: str = "CP") -> str:
    """
    Generates a unique public reference code such as CP-849201.
    Uses current timestamp entropy + random digits to ensure uniqueness and readability.
    """
    rand_chars = "".join(random.choices(string.digits, k=4))
    epoch_part = str(int(time.time()))[-4:]
    return f"{prefix}-{epoch_part}{rand_chars}"


def sanitize_text(text: str) -> str:
    """Trim and remove extraneous whitespace or control characters."""
    if not text:
        return ""
    return " ".join(text.strip().split())
