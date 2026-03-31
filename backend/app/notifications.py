from __future__ import annotations

import asyncio
import logging

import httpx

from .config import settings

logger = logging.getLogger(__name__)

try:
    from twilio.rest import Client as TwilioClient
except Exception:  # pragma: no cover
    TwilioClient = None  # type: ignore[assignment]


async def send_sms(phone: str, body: str) -> None:
    provider = settings.sms_provider.lower().strip()
    if not phone:
        return

    if provider == 'twilio' and settings.twilio_account_sid and settings.twilio_auth_token and settings.twilio_from_number and TwilioClient:
        def _send() -> None:
            client = TwilioClient(settings.twilio_account_sid, settings.twilio_auth_token)
            client.messages.create(body=body, from_=settings.twilio_from_number, to=phone)

        await asyncio.to_thread(_send)
        return

    if provider == 'globalsms' and settings.global_sms_url and settings.global_sms_api_key:
        payload = {'to': phone, 'message': body, 'sender': settings.global_sms_sender}
        headers = {'Authorization': f'Bearer {settings.global_sms_api_key}'}
        async with httpx.AsyncClient(timeout=10) as client:
            await client.post(settings.global_sms_url, json=payload, headers=headers)
        return

    logger.info('Mock SMS -> %s :: %s', phone, body)


async def send_otp_message(identifier: str, code: str) -> None:
    if identifier.startswith('+'):
        await send_sms(identifier, f'PetConnect verification code: {code}')
        return
    logger.info('Mock email OTP -> %s :: %s', identifier, code)


async def send_match_alert(phone: str | None, email: str | None, pet_name: str, score: int, found_city: str) -> None:
    text = f'PetConnect: potential match for {pet_name} ({score}%) reported in {found_city or "your area"}. Log in to review the report.'
    if phone:
        await send_sms(phone, text)
    elif email:
        logger.info('Mock email match alert -> %s :: %s', email, text)


async def send_geofence_alert(phone: str | None, email: str | None, pet_name: str, report_city: str, distance_km: float | None) -> None:
    distance_text = f' within {distance_km:.1f} km' if distance_km is not None else ''
    text = f'PetConnect geofence alert: a new sighting matching {pet_name} was reported{distance_text} in {report_city or "your area"}. Open the app to review.'
    if phone:
        await send_sms(phone, text)
    elif email:
        logger.info('Mock email geofence alert -> %s :: %s', email, text)


async def send_volunteer_alert(phone: str | None, email: str | None, city: str, neighborhood: str, pet_name: str) -> None:
    text = (
        f'PetConnect volunteer alert: {pet_name or "A missing pet"} was reported near '
        f'{neighborhood or city or "your area"}. Please keep an eye out and open the app if you spot the animal.'
    )
    if phone:
        await send_sms(phone, text)
    elif email:
        logger.info('Mock volunteer alert -> %s :: %s', email, text)


async def relay_proxy_message(phone: str | None, email: str | None, body: str) -> None:
    relay_text = f'{settings.relay_sender_label}: {body}'
    if phone:
        await send_sms(phone, relay_text)
    elif email:
        logger.info('Mock email relay -> %s :: %s', email, relay_text)


async def share_missing_report(message: str) -> None:
    if not settings.enable_telegram_broadcasts or not settings.telegram_bot_token or not settings.telegram_chat_id:
        logger.info('Telegram broadcast skipped. Message: %s', message)
        return

    url = f'https://api.telegram.org/bot{settings.telegram_bot_token}/sendMessage'
    payload = {'chat_id': settings.telegram_chat_id, 'text': message}
    async with httpx.AsyncClient(timeout=10) as client:
        await client.post(url, json=payload)
