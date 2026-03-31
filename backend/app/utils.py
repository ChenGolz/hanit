from __future__ import annotations

import hashlib
import math
import re
import unicodedata
import uuid
from datetime import UTC, datetime
from decimal import Decimal, InvalidOperation
from pathlib import Path

from .config import settings


def safe_filename(name: str) -> str:
    name = re.sub(r"[^A-Za-z0-9._-]+", "_", name)
    return name[:120] or "upload.jpg"


def timestamp_now() -> str:
    return datetime.now(UTC).isoformat()


def utcnow() -> datetime:
    return datetime.now(UTC)


def mask_phone(value: str | None) -> str:
    if not value:
        return ""
    v = value.strip()
    if len(v) <= 4:
        return "*" * len(v)
    return v[:2] + "*" * max(0, len(v) - 4) + v[-2:]


def mask_email(value: str | None) -> str:
    if not value or "@" not in value:
        return ""
    name, domain = value.split("@", 1)
    if len(name) <= 2:
        hidden = "*" * len(name)
    else:
        hidden = name[:1] + "*" * (len(name) - 2) + name[-1:]
    return hidden + "@" + domain


def slugify_city(value: str | None) -> str:
    if not value:
        return ""
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii") or value
    value = value.lower().strip()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-")[:80]


def normalize_phone(value: str | None) -> str:
    if not value:
        return ""
    digits = re.sub(r"\D+", "", value)
    if digits.startswith("972"):
        return "+" + digits
    if digits.startswith("0"):
        return "+972" + digits[1:]
    if digits:
        return "+" + digits
    return ""


def normalize_email(value: str | None) -> str:
    return (value or "").strip().lower()


def normalize_microchip(value: str | None) -> str:
    if not value:
        return ""
    return re.sub(r"\s+", "", value).strip()


def km_distance(lat1: float | None, lon1: float | None, lat2: float | None, lon2: float | None) -> float | None:
    if None in {lat1, lon1, lat2, lon2}:
        return None
    radius = 6371.0
    p1 = math.radians(lat1)
    p2 = math.radians(lat2)
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = math.sin(d_lat / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(d_lon / 2) ** 2
    return radius * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def ensure_file_removed(path: Path | None) -> None:
    if path and path.exists():
        path.unlink(missing_ok=True)


def hash_secret_value(value: str) -> str:
    digest = hashlib.sha256()
    digest.update(settings.jwt_secret.encode("utf-8"))
    digest.update((value or "").strip().lower().encode("utf-8"))
    return digest.hexdigest()


def matches_secret_value(value: str | None, hashed: str | None) -> bool:
    if not value or not hashed:
        return False
    return hash_secret_value(value) == hashed


def decimal_or_none(value: str | float | Decimal | None) -> Decimal | None:
    if value in {None, ""}:
        return None
    try:
        return Decimal(str(value))
    except (InvalidOperation, ValueError):
        return None


def new_public_token(prefix: str = "pc") -> str:
    return f"{prefix}_{uuid.uuid4().hex}"


def municipality_recipient(city_slug: str | None) -> str | None:
    if not city_slug:
        return None
    return settings.municipality_106_recipients.get(city_slug)
