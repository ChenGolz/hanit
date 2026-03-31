from __future__ import annotations

import hashlib
import hmac
import random
from datetime import timedelta

import jwt
from fastapi import Depends, Header, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .config import settings
from .db import get_db
from .models import OTPChallenge, User
from .notifications import send_otp_message
from .utils import normalize_email, normalize_phone, utcnow


def normalize_identifier(identifier: str) -> tuple[str, str]:
    identifier = (identifier or "").strip()
    if "@" in identifier:
        return normalize_email(identifier), "email"
    return normalize_phone(identifier), "phone"


def hash_code(identifier: str, code: str) -> str:
    digest = hashlib.sha256()
    digest.update(settings.jwt_secret.encode("utf-8"))
    digest.update(identifier.encode("utf-8"))
    digest.update(code.encode("utf-8"))
    return digest.hexdigest()


async def get_or_create_user(db: AsyncSession, identifier: str, channel: str, display_name: str | None = None) -> User:
    existing = await db.scalar(select(User).where(User.identifier == identifier))
    if existing:
        if display_name and not existing.display_name:
            existing.display_name = display_name
        return existing
    user = User(identifier=identifier, channel=channel, display_name=display_name)
    db.add(user)
    await db.flush()
    return user


async def request_otp(db: AsyncSession, identifier: str) -> dict:
    normalized, channel = normalize_identifier(identifier)
    if not normalized:
        raise HTTPException(status_code=400, detail="Valid phone or email is required")

    await get_or_create_user(db, normalized, channel)

    code = f"{random.randint(0, 999999):06d}"
    challenge = OTPChallenge(
        identifier=normalized,
        code_hash=hash_code(normalized, code),
        expires_at=utcnow() + timedelta(minutes=settings.otp_ttl_minutes),
    )
    db.add(challenge)
    await db.commit()
    await send_otp_message(normalized, code)

    response = {"sent": True, "channel": channel}
    if settings.app_env != "production" and settings.enable_dev_otp_echo:
        response["dev_code"] = code
    return response


async def verify_otp(db: AsyncSession, identifier: str, code: str) -> dict:
    normalized, channel = normalize_identifier(identifier)
    challenge = await db.scalar(
        select(OTPChallenge)
        .where(OTPChallenge.identifier == normalized)
        .where(OTPChallenge.consumed_at.is_(None))
        .order_by(OTPChallenge.id.desc())
    )
    if not challenge or challenge.expires_at < utcnow():
        raise HTTPException(status_code=400, detail="OTP expired or missing")

    expected = hash_code(normalized, code)
    if not hmac.compare_digest(challenge.code_hash, expected):
        raise HTTPException(status_code=400, detail="Incorrect verification code")

    challenge.consumed_at = utcnow()
    user = await get_or_create_user(db, normalized, channel)
    await db.commit()

    payload = {
        "sub": str(user.id),
        "identifier": normalized,
        "channel": channel,
        "exp": utcnow() + timedelta(hours=settings.jwt_exp_hours),
    }
    token = jwt.encode(payload, settings.jwt_secret, algorithm="HS256")
    return {"verified": True, "token": token, "user": {"id": user.id, "identifier": normalized, "channel": channel}}


async def get_current_user(
    authorization: str | None = Header(default=None),
    db: AsyncSession = Depends(get_db),
) -> User:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    token = authorization.split(" ", 1)[1].strip()
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
    except jwt.PyJWTError as exc:  # type: ignore[attr-defined]
        raise HTTPException(status_code=401, detail="Invalid token") from exc

    user_id = int(payload.get("sub", 0))
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user
