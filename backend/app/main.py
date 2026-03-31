from __future__ import annotations

import tempfile
import uuid
from contextlib import asynccontextmanager
from pathlib import Path
from urllib.parse import quote

import httpx
from fastapi import Depends, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from .auth import get_current_user, get_or_create_user, normalize_identifier, request_otp, verify_otp
from .config import settings
from .db import get_db, init_db
from .embeddings import embed_image
from .matching import cosine_similarity, find_matches
from .models import FoundReport, LostPet, ProxyConversation, ProxyMessage, User, VolunteerResponder
from .notifications import (
    relay_proxy_message,
    send_geofence_alert,
    send_match_alert,
    send_volunteer_alert,
    share_missing_report,
)
from .privacy import blur_sensitive_background
from .schemas import (
    AdminOverview,
    ClaimVerificationIn,
    FoundReportResponse,
    OTPRequestIn,
    OTPVerifyIn,
    RelayMessageIn,
    SocialIngestIn,
    VolunteerSignupIn,
)
from .semantic import extract_semantic_tags
from .social_ingest import build_match_comment, maybe_publish_external_comment
from .storage import save_generated_file, save_upload
from .utils import (
    decimal_or_none,
    ensure_file_removed,
    hash_secret_value,
    km_distance,
    mask_email,
    mask_phone,
    matches_secret_value,
    municipality_recipient,
    new_public_token,
    normalize_microchip,
    normalize_phone,
    slugify_city,
)
from .video import extract_best_frame


@asynccontextmanager
async def lifespan(_: FastAPI):
    await init_db()
    yield


app = FastAPI(title=settings.app_name, lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

if not settings.uses_s3:
    app.mount('/uploads', StaticFiles(directory=str(settings.upload_dir)), name='uploads')


@app.get('/')
async def root():
    return {'ok': True, 'name': settings.app_name, 'storage': settings.storage_backend}


@app.get('/health')
async def health():
    return {
        'status': 'healthy',
        'embedding_model': settings.embedding_model,
        'embedding_margin_loss': settings.embedding_margin_loss,
        'nose_embedding_model': settings.nose_embedding_model,
        'semantic_model_name': settings.semantic_model_name,
        'vector_db': settings.is_postgres,
        'privacy_blur_enabled': settings.privacy_blur_enabled,
        'shabbat_automation_enabled': settings.shabbat_automation_enabled,
    }


@app.post('/api/auth/request-otp')
async def auth_request_otp(payload: OTPRequestIn, db: AsyncSession = Depends(get_db)):
    return await request_otp(db, payload.identifier)


@app.post('/api/auth/verify-otp')
async def auth_verify_otp(payload: OTPVerifyIn, db: AsyncSession = Depends(get_db)):
    return await verify_otp(db, payload.identifier, payload.code)


async def _download_remote_file(url: str, prefix: str, suffix: str = '.jpg') -> Path:
    async with httpx.AsyncClient(timeout=20, follow_redirects=True) as client:
        response = await client.get(url)
        response.raise_for_status()
    temp_path = Path(tempfile.gettempdir()) / f'{prefix}_{uuid.uuid4().hex[:10]}{suffix}'
    temp_path.write_bytes(response.content)
    return temp_path


async def _store_best_frame(video_saved, prefix: str):
    temp_frame = Path(tempfile.gettempdir()) / f'{prefix}_{uuid.uuid4().hex[:10]}.jpg'
    selection = await extract_best_frame(video_saved.local_path, temp_frame)
    saved = await save_generated_file(temp_frame, f'{prefix}_frame', extension='.jpg', content_type='image/jpeg')
    ensure_file_removed(temp_frame)
    return saved, selection


async def _prepare_primary_media(
    image: UploadFile | None,
    video: UploadFile | None,
    prefix: str,
    encoder_type: str = 'primary',
    text_fields: tuple[str, ...] = (),
):
    if image is None and (video is None or not getattr(video, 'filename', '')):
        raise HTTPException(status_code=400, detail='Please upload an image or a short video')

    image_saved = None
    video_saved = None
    selection = {'source': 'image', 'score': 1.0}

    if video is not None and getattr(video, 'filename', ''):
        video_saved = await save_upload(video, f'{prefix}_video')
        image_saved, selection = await _store_best_frame(video_saved, prefix)
    elif image is not None:
        image_saved = await save_upload(image, prefix)
    else:
        raise HTTPException(status_code=400, detail='Media upload is required')

    privacy = blur_sensitive_background(image_saved.local_path)
    embedding = await embed_image(image_saved.local_path, encoder_type=encoder_type)
    tags = extract_semantic_tags(image_saved.local_path, *text_fields)
    return image_saved, video_saved, privacy, embedding, tags, selection


async def _prepare_optional_image(upload: UploadFile | None, prefix: str, encoder_type: str = 'primary'):
    if upload is None or not getattr(upload, 'filename', ''):
        return None, {'enabled': settings.privacy_blur_enabled, 'faces': 0, 'plates': 0, 'applied': False}, None, []
    saved = await save_upload(upload, prefix)
    privacy = blur_sensitive_background(saved.local_path)
    embedding = await embed_image(saved.local_path, encoder_type=encoder_type)
    tags = extract_semantic_tags(saved.local_path)
    return saved, privacy, embedding, tags


async def _prepare_optional_reference_image(upload: UploadFile | None, prefix: str):
    if upload is None or not getattr(upload, 'filename', ''):
        return None
    saved = await save_upload(upload, prefix)
    blur_sensitive_background(saved.local_path)
    return saved


async def _prepare_social_image(image_url: str, prefix: str, animal_type: str, city: str, notes: str):
    suffix = Path(image_url).suffix or '.jpg'
    temp_path = await _download_remote_file(image_url, prefix, suffix=suffix)
    saved = await save_generated_file(temp_path, prefix, extension=suffix, content_type='image/jpeg')
    ensure_file_removed(temp_path)
    privacy = blur_sensitive_background(saved.local_path)
    embedding = await embed_image(saved.local_path, encoder_type='primary')
    tags = extract_semantic_tags(saved.local_path, animal_type, city, notes)
    return saved, privacy, embedding, tags


async def _send_geofence_owner_alerts(db: AsyncSession, report: FoundReport) -> int:
    if not settings.auto_geofence_alerts:
        return 0
    pets = list((await db.scalars(select(LostPet).where(LostPet.status == 'missing').where(LostPet.auto_notify_enabled.is_(True)))).all())
    sent = 0
    for pet in pets:
        distance_km = km_distance(
            float(report.latitude) if report.latitude is not None else None,
            float(report.longitude) if report.longitude is not None else None,
            float(pet.latitude) if pet.latitude is not None else None,
            float(pet.longitude) if pet.longitude is not None else None,
        )
        if distance_km is None or distance_km > settings.geofence_alert_radius_km:
            continue
        await send_geofence_alert(pet.contact_phone, pet.contact_email, pet.name, report.city or '', distance_km)
        sent += 1
    return sent


async def _send_volunteer_alerts_for_missing_pet(db: AsyncSession, pet: LostPet) -> int:
    volunteers = list((await db.scalars(select(VolunteerResponder).where(VolunteerResponder.is_active.is_(True)))).all())
    sent = 0
    for volunteer in volunteers:
        distance = km_distance(
            float(pet.latitude) if pet.latitude is not None else None,
            float(pet.longitude) if pet.longitude is not None else None,
            float(volunteer.latitude) if volunteer.latitude is not None else None,
            float(volunteer.longitude) if volunteer.longitude is not None else None,
        )
        limit = float(volunteer.radius_km) if volunteer.radius_km is not None else settings.volunteer_alert_radius_km
        if distance is not None and distance > limit:
            continue
        if pet.city_slug and volunteer.city_slug and pet.city_slug != volunteer.city_slug and distance is None:
            continue
        await send_volunteer_alert(volunteer.phone, volunteer.email, pet.city or '', pet.neighborhood or '', pet.name)
        sent += 1
    return sent


async def _create_found_report_record(
    db: AsyncSession,
    *,
    animal_type: str,
    breed: str,
    color: str,
    collar_description: str,
    seen_location: str,
    city: str,
    neighborhood: str,
    latitude: str,
    longitude: str,
    notes: str,
    finder_name: str,
    finder_phone: str,
    finder_email: str,
    microchip_number: str,
    image: UploadFile | None,
    video: UploadFile | None,
    nose_image: UploadFile | None,
    source_type: str = 'citizen',
    source_platform: str = '',
    source_reference_url: str = '',
    source_post_id: str = '',
):
    saved, video_saved, privacy, embedding, tags, selection = await _prepare_primary_media(
        image,
        video,
        'found',
        encoder_type='primary',
        text_fields=(animal_type, breed, color, collar_description, seen_location, city, neighborhood, notes),
    )
    nose_saved, nose_privacy, nose_embedding, nose_tags = await _prepare_optional_image(nose_image, 'found_nose', encoder_type='nose')
    normalized_phone = normalize_phone(finder_phone) if finder_phone else ''

    report = FoundReport(
        animal_type=animal_type,
        breed=breed or None,
        color=color or None,
        collar_description=collar_description or None,
        semantic_tags=sorted(set(tags + nose_tags)),
        seen_location=seen_location or None,
        city=city or None,
        city_slug=slugify_city(city),
        neighborhood=neighborhood or None,
        latitude=decimal_or_none(latitude),
        longitude=decimal_or_none(longitude),
        notes=notes or None,
        finder_name=finder_name or None,
        finder_phone=normalized_phone or None,
        finder_email=finder_email or None,
        microchip_number=normalize_microchip(microchip_number) or None,
        nose_image_storage_key=nose_saved.storage_key if nose_saved else None,
        nose_image_url=nose_saved.public_url if nose_saved else None,
        video_storage_key=video_saved.storage_key if video_saved else None,
        video_url=video_saved.public_url if video_saved else None,
        best_frame_score=selection.get('score'),
        best_frame_source=selection.get('source'),
        source_type=source_type or None,
        source_platform=source_platform or None,
        source_reference_url=source_reference_url or None,
        source_post_id=source_post_id or None,
        municipality_106_sent=False,
        image_storage_key=saved.storage_key,
        image_url=saved.public_url,
        embedding=embedding,
        nose_embedding=nose_embedding,
    )
    db.add(report)
    await db.flush()

    matches = await find_matches(db, report)
    geofence_alerts_sent = await _send_geofence_owner_alerts(db, report)

    for match in matches:
        if match['score'] >= settings.high_probability_threshold:
            await send_match_alert(match.get('contact_phone'), match.get('contact_email'), match['name'], match['score'], city or '')
        match.pop('contact_phone', None)
        match.pop('contact_email', None)

    municipal_draft = _municipal_draft_from_report(report)
    await db.commit()
    await db.refresh(report)
    return report, matches, municipal_draft, geofence_alerts_sent, {'primary': privacy, 'nose': nose_privacy}, selection



def _municipal_draft_from_report(report: FoundReport) -> dict | None:
    city_slug = report.city_slug or ''
    subject = f'Stray animal report — {report.city or "Israel"}'
    body = (
        'Hello municipal hotline\n\n'
        'A stray animal was reported via PetConnect.\n\n'
        f'City: {report.city or ""}\n'
        f'Neighborhood: {report.neighborhood or ""}\n'
        f'Location: {report.seen_location or ""}\n'
        f'Coordinates: {report.latitude or ""}, {report.longitude or ""}\n'
        f'Animal type: {report.animal_type}\n'
        f'Breed: {report.breed or ""}\n'
        f'Color: {report.color or ""}\n'
        f'Tags: {", ".join(report.semantic_tags or [])}\n'
        f'Notes: {report.notes or ""}\n'
        f'Photo: {report.image_url}\n\n'
        'Please review and dispatch if needed.\n'
    )
    recipient = municipality_recipient(city_slug) or ''
    mailto = f'mailto:{recipient}?subject={quote(subject)}&body={quote(body)}' if recipient else ''
    return {'city_slug': city_slug, 'recipient': recipient, 'subject': subject, 'body': body, 'mailto': mailto}


@app.post('/api/lost-pets')
async def create_lost_pet(
    name: str = Form(...),
    animal_type: str = Form(...),
    breed: str = Form(''),
    color: str = Form(''),
    collar_description: str = Form(''),
    unique_markings: str = Form(''),
    last_seen_location: str = Form(''),
    city: str = Form(''),
    neighborhood: str = Form(''),
    latitude: str = Form(''),
    longitude: str = Form(''),
    contact_name: str = Form(''),
    contact_phone: str = Form(''),
    contact_email: str = Form(''),
    microchip_number: str = Form(''),
    verification_prompt: str = Form(''),
    verification_answer: str = Form(''),
    private_marker_prompt: str = Form(''),
    image: UploadFile | None = File(default=None),
    video: UploadFile | None = File(default=None),
    nose_image: UploadFile | None = File(default=None),
    private_marker_image: UploadFile | None = File(default=None),
    db: AsyncSession = Depends(get_db),
):
    saved, video_saved, privacy, embedding, tags, selection = await _prepare_primary_media(
        image,
        video,
        'lost',
        encoder_type='primary',
        text_fields=(name, animal_type, breed, color, collar_description, unique_markings, last_seen_location, city, neighborhood),
    )
    nose_saved, nose_privacy, nose_embedding, nose_tags = await _prepare_optional_image(nose_image, 'lost_nose', encoder_type='nose')
    private_marker_saved = await _prepare_optional_reference_image(private_marker_image, 'lost_private_marker')

    owner_identifier = contact_phone or contact_email
    owner: User | None = None
    if owner_identifier:
        normalized_identifier, channel = normalize_identifier(owner_identifier)
        owner = await get_or_create_user(db, normalized_identifier, channel, contact_name or None)
        if channel == 'phone':
            contact_phone = normalized_identifier
        else:
            contact_email = normalized_identifier

    pet = LostPet(
        owner_user_id=owner.id if owner else None,
        name=name,
        animal_type=animal_type,
        breed=breed or None,
        color=color or None,
        collar_description=collar_description or None,
        unique_markings=unique_markings or None,
        semantic_tags=sorted(set(tags + nose_tags)),
        source_type='citizen',
        last_seen_location=last_seen_location or None,
        city=city or None,
        city_slug=slugify_city(city),
        neighborhood=neighborhood or None,
        latitude=decimal_or_none(latitude),
        longitude=decimal_or_none(longitude),
        contact_name=contact_name or None,
        contact_phone=contact_phone or None,
        contact_email=contact_email or None,
        microchip_number=normalize_microchip(microchip_number) or None,
        verification_prompt=verification_prompt or None,
        verification_answer_hash=hash_secret_value(verification_answer) if verification_answer else None,
        private_marker_prompt=private_marker_prompt or None,
        private_marker_image_storage_key=private_marker_saved.storage_key if private_marker_saved else None,
        private_marker_image_url=private_marker_saved.public_url if private_marker_saved else None,
        nose_image_storage_key=nose_saved.storage_key if nose_saved else None,
        nose_image_url=nose_saved.public_url if nose_saved else None,
        video_storage_key=video_saved.storage_key if video_saved else None,
        video_url=video_saved.public_url if video_saved else None,
        best_frame_score=selection.get('score'),
        best_frame_source=selection.get('source'),
        auto_notify_enabled=True,
        status='missing',
        image_storage_key=saved.storage_key,
        image_url=saved.public_url,
        embedding=embedding,
        nose_embedding=nose_embedding,
    )
    db.add(pet)
    await db.commit()
    await db.refresh(pet)

    await share_missing_report(
        f'🐾 Missing {animal_type}: {name} in {city or "Israel"}\n'
        f'Color: {color or "n/a"}\n'
        f'Tags: {", ".join(pet.semantic_tags or []) or "n/a"}\n'
        f'Contact: {contact_phone or contact_email or "via app"}'
    )
    volunteer_alerts_sent = await _send_volunteer_alerts_for_missing_pet(db, pet)

    return {
        'saved': True,
        'id': pet.id,
        'manage_hint': 'Use OTP login with the same phone/email to edit or resolve this post.',
        'privacy_blur': {'primary': privacy, 'nose': nose_privacy},
        'recognition': {
            'primary_model': settings.embedding_model,
            'nose_model': settings.nose_embedding_model,
            'margin_loss': settings.embedding_margin_loss,
            'semantic_tags': pet.semantic_tags or [],
            'best_frame': selection,
        },
        'volunteer_alerts_sent': volunteer_alerts_sent,
    }


@app.post('/api/found-reports', response_model=FoundReportResponse)
async def create_found_report(
    animal_type: str = Form(...),
    breed: str = Form(''),
    color: str = Form(''),
    collar_description: str = Form(''),
    seen_location: str = Form(''),
    city: str = Form(''),
    neighborhood: str = Form(''),
    latitude: str = Form(''),
    longitude: str = Form(''),
    notes: str = Form(''),
    finder_name: str = Form(''),
    finder_phone: str = Form(''),
    finder_email: str = Form(''),
    microchip_number: str = Form(''),
    image: UploadFile | None = File(default=None),
    video: UploadFile | None = File(default=None),
    nose_image: UploadFile | None = File(default=None),
    db: AsyncSession = Depends(get_db),
):
    report, matches, municipal_draft, geofence_alerts_sent, _privacy, selection = await _create_found_report_record(
        db,
        animal_type=animal_type,
        breed=breed,
        color=color,
        collar_description=collar_description,
        seen_location=seen_location,
        city=city,
        neighborhood=neighborhood,
        latitude=latitude,
        longitude=longitude,
        notes=notes,
        finder_name=finder_name,
        finder_phone=finder_phone,
        finder_email=finder_email,
        microchip_number=microchip_number,
        image=image,
        video=video,
        nose_image=nose_image,
    )
    return {
        'saved': True,
        'report_id': report.id,
        'matches': matches,
        'municipal_draft': municipal_draft,
        'offline_safe': True,
        'geofence_alerts_sent': geofence_alerts_sent,
        'best_frame': selection,
    }


@app.post('/api/shelter/intake-scan', response_model=FoundReportResponse)
async def shelter_intake_scan(
    shelter_name: str = Form(...),
    animal_type: str = Form(...),
    breed: str = Form(''),
    color: str = Form(''),
    city: str = Form(''),
    neighborhood: str = Form(''),
    latitude: str = Form(''),
    longitude: str = Form(''),
    notes: str = Form(''),
    microchip_number: str = Form(''),
    image: UploadFile | None = File(default=None),
    video: UploadFile | None = File(default=None),
    nose_image: UploadFile | None = File(default=None),
    db: AsyncSession = Depends(get_db),
):
    report, matches, municipal_draft, geofence_alerts_sent, _privacy, selection = await _create_found_report_record(
        db,
        animal_type=animal_type,
        breed=breed,
        color=color,
        collar_description='',
        seen_location=f'Shelter intake: {shelter_name}',
        city=city,
        neighborhood=neighborhood,
        latitude=latitude,
        longitude=longitude,
        notes=notes or shelter_name,
        finder_name=shelter_name,
        finder_phone='',
        finder_email='',
        microchip_number=microchip_number,
        image=image,
        video=video,
        nose_image=nose_image,
        source_type='shelter',
        source_platform='municipal_shelter',
        source_reference_url='',
        source_post_id='',
    )
    return {
        'saved': True,
        'report_id': report.id,
        'matches': matches,
        'municipal_draft': municipal_draft,
        'offline_safe': True,
        'geofence_alerts_sent': geofence_alerts_sent,
        'best_frame': selection,
    }


@app.post('/api/volunteers')
async def create_volunteer(payload: VolunteerSignupIn, db: AsyncSession = Depends(get_db)):
    volunteer = VolunteerResponder(
        name=payload.name or None,
        phone=normalize_phone(payload.phone) or None,
        email=payload.email or None,
        city=payload.city or None,
        city_slug=slugify_city(payload.city),
        neighborhood=payload.neighborhood or None,
        latitude=decimal_or_none(payload.latitude),
        longitude=decimal_or_none(payload.longitude),
        radius_km=payload.radius_km,
        channels=payload.channels or ['sms'],
        is_active=True,
    )
    db.add(volunteer)
    await db.commit()
    await db.refresh(volunteer)
    return {'saved': True, 'id': volunteer.id, 'city_slug': volunteer.city_slug or '', 'radius_km': float(volunteer.radius_km)}


@app.get('/api/volunteers')
async def list_volunteers(city: str | None = None, db: AsyncSession = Depends(get_db)):
    stmt = select(VolunteerResponder).where(VolunteerResponder.is_active.is_(True)).order_by(VolunteerResponder.id.desc())
    if city:
        stmt = stmt.where(VolunteerResponder.city_slug == slugify_city(city))
    rows = list((await db.scalars(stmt)).all())
    return [
        {
            'id': row.id,
            'name': row.name or '',
            'city': row.city or '',
            'neighborhood': row.neighborhood or '',
            'radius_km': float(row.radius_km) if row.radius_km is not None else settings.volunteer_alert_radius_km,
        }
        for row in rows
    ]


@app.post('/api/social-ingest/manual')
async def social_ingest_manual(payload: SocialIngestIn, db: AsyncSession = Depends(get_db)):
    if not payload.image_url:
        raise HTTPException(status_code=400, detail='image_url is required for manual social ingest')

    saved, _privacy, embedding, tags = await _prepare_social_image(
        payload.image_url,
        'social_ingest',
        payload.animal_type,
        payload.city,
        payload.notes,
    )
    report = FoundReport(
        animal_type=payload.animal_type,
        semantic_tags=tags,
        seen_location=payload.neighborhood or payload.city or None,
        city=payload.city or None,
        city_slug=slugify_city(payload.city),
        neighborhood=payload.neighborhood or None,
        notes=payload.notes or None,
        source_type='social',
        source_platform=payload.source_platform or 'manual',
        source_reference_url=payload.source_reference_url or None,
        source_post_id=payload.source_post_id or None,
        municipality_106_sent=False,
        image_storage_key=saved.storage_key,
        image_url=saved.public_url,
        embedding=embedding,
    )
    db.add(report)
    await db.flush()
    matches = await find_matches(db, report)
    comment_results = []
    for match in matches:
        body = build_match_comment(settings.public_base_url.replace(':8001', ':3000'), match['lost_pet_id'], match['name'], match['score'])
        comment_results.append(await maybe_publish_external_comment(payload.source_platform, payload.source_reference_url, body))
        match.pop('contact_phone', None)
        match.pop('contact_email', None)
    await db.commit()
    await db.refresh(report)
    return {'saved': True, 'report_id': report.id, 'matches': matches, 'comment_results': comment_results}


@app.get('/api/lost-pets')
async def list_lost_pets(city: str | None = None, db: AsyncSession = Depends(get_db)):
    stmt = select(LostPet).order_by(LostPet.id.desc())
    if city:
        stmt = stmt.where(LostPet.city_slug == slugify_city(city))
    rows = list((await db.scalars(stmt)).all())
    return [
        {
            'id': pet.id,
            'name': pet.name,
            'animal_type': pet.animal_type,
            'breed': pet.breed or '',
            'color': pet.color or '',
            'collar_description': pet.collar_description or '',
            'unique_markings': pet.unique_markings or '',
            'semantic_tags': pet.semantic_tags or [],
            'last_seen_location': pet.last_seen_location or '',
            'city': pet.city or '',
            'city_slug': pet.city_slug or '',
            'latitude': float(pet.latitude) if pet.latitude is not None else None,
            'longitude': float(pet.longitude) if pet.longitude is not None else None,
            'contact_name': pet.contact_name or '',
            'contact_phone_masked': mask_phone(pet.contact_phone),
            'contact_email_masked': mask_email(pet.contact_email),
            'microchip_number_masked': ('***' + pet.microchip_number[-4:]) if pet.microchip_number else '',
            'private_marker_prompt': pet.private_marker_prompt or '',
            'status': pet.status,
            'image_url': pet.image_url,
            'created_at': pet.created_at.isoformat(),
            'verification_required': bool(pet.verification_prompt),
        }
        for pet in rows
    ]


@app.get('/api/lost-pets/{pet_id}/sightings-heatmap')
async def lost_pet_sightings_heatmap(pet_id: int, db: AsyncSession = Depends(get_db)):
    pet = await db.get(LostPet, pet_id)
    if not pet:
        raise HTTPException(status_code=404, detail='Lost pet not found')

    reports = list((await db.scalars(select(FoundReport).order_by(FoundReport.id.desc()).limit(250))).all())
    points = []
    for report in reports:
        if report.latitude is None or report.longitude is None:
            continue
        similarity = cosine_similarity(pet.embedding, report.embedding)
        exact_chip = bool(pet.microchip_number and report.microchip_number and pet.microchip_number == report.microchip_number)
        if similarity < 0.58 and not exact_chip:
            continue
        distance_km = km_distance(
            float(pet.latitude) if pet.latitude is not None else None,
            float(pet.longitude) if pet.longitude is not None else None,
            float(report.latitude),
            float(report.longitude),
        )
        if distance_km is not None and distance_km > settings.heatmap_radius_km:
            continue
        points.append(
            {
                'lat': float(report.latitude),
                'lng': float(report.longitude),
                'count': 1,
                'label': report.city or report.seen_location or 'Sighting',
                'report_id': report.id,
                'created_at': report.created_at.isoformat(),
            }
        )
    return {'pet_id': pet.id, 'pet_name': pet.name, 'radius_km': settings.heatmap_radius_km, 'points': points}


@app.get('/api/found-reports/{report_id}/municipal-draft')
async def municipal_draft(report_id: int, db: AsyncSession = Depends(get_db)):
    report = await db.get(FoundReport, report_id)
    if not report:
        raise HTTPException(status_code=404, detail='Found report not found')
    draft = _municipal_draft_from_report(report)
    if draft is None:
        raise HTTPException(status_code=404, detail='No municipal draft available')
    return draft


@app.get('/api/chip/{microchip_number}')
async def chip_lookup(microchip_number: str, db: AsyncSession = Depends(get_db)):
    normalized = normalize_microchip(microchip_number)
    if not normalized:
        raise HTTPException(status_code=400, detail='Microchip number is required')
    pet = await db.scalar(select(LostPet).where(LostPet.microchip_number == normalized).where(LostPet.status == 'missing'))
    if not pet:
        raise HTTPException(status_code=404, detail='No missing pet found for this microchip')
    return {
        'found': True,
        'lost_pet_id': pet.id,
        'name': pet.name,
        'city': pet.city or '',
        'image_url': pet.image_url,
        'contact_phone_masked': mask_phone(pet.contact_phone),
        'contact_email_masked': mask_email(pet.contact_email),
    }


@app.post('/api/matches/{lost_pet_id}/verify')
async def verify_match_claim(lost_pet_id: int, payload: ClaimVerificationIn, db: AsyncSession = Depends(get_db)):
    pet = await db.get(LostPet, lost_pet_id)
    report = await db.get(FoundReport, payload.report_id)
    if not pet or pet.status != 'missing':
        raise HTTPException(status_code=404, detail='Lost pet not found')
    if not report:
        raise HTTPException(status_code=404, detail='Found report not found')
    if not pet.verification_prompt or not pet.verification_answer_hash:
        raise HTTPException(status_code=400, detail='This pet does not require a verification quiz')
    if not matches_secret_value(payload.answer, pet.verification_answer_hash):
        raise HTTPException(status_code=400, detail='Verification answer did not match')
    if pet.private_marker_prompt and not payload.physical_marker_confirmed:
        raise HTTPException(status_code=400, detail='Please confirm the owner-only physical marker before opening contact relay')

    conversation = await db.scalar(
        select(ProxyConversation)
        .where(ProxyConversation.lost_pet_id == pet.id)
        .where(ProxyConversation.found_report_id == report.id)
    )
    if not conversation:
        conversation = ProxyConversation(
            public_token=new_public_token('relay'),
            lost_pet_id=pet.id,
            found_report_id=report.id,
            owner_phone=pet.contact_phone,
            owner_email=pet.contact_email,
            finder_phone=report.finder_phone,
            finder_email=report.finder_email,
            claim_verified=True,
            status='active',
        )
        db.add(conversation)
        await db.flush()
    else:
        conversation.claim_verified = True
        conversation.status = 'active'

    db.add(ProxyMessage(conversation_id=conversation.id, sender_role='finder', body=payload.intro_message))
    await relay_proxy_message(pet.contact_phone, pet.contact_email, payload.intro_message)
    await db.commit()

    return {
        'verified': True,
        'thread_token': conversation.public_token,
        'message': 'Claim verified. The owner received your masked relay message.',
    }


@app.post('/api/proxy/{thread_token}/messages')
async def send_proxy_message(thread_token: str, payload: RelayMessageIn, db: AsyncSession = Depends(get_db)):
    conversation = await db.scalar(select(ProxyConversation).where(ProxyConversation.public_token == thread_token))
    if not conversation or conversation.status != 'active':
        raise HTTPException(status_code=404, detail='Conversation not found')

    db.add(ProxyMessage(conversation_id=conversation.id, sender_role=payload.sender_role, body=payload.body))
    if payload.sender_role == 'finder':
        await relay_proxy_message(conversation.owner_phone, conversation.owner_email, payload.body)
    else:
        await relay_proxy_message(conversation.finder_phone, conversation.finder_email, payload.body)
    await db.commit()
    return {'sent': True, 'thread_token': thread_token}


@app.post('/api/lost-pets/{pet_id}/resolve')
async def resolve_lost_pet(
    pet_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    pet = await db.get(LostPet, pet_id)
    if not pet:
        raise HTTPException(status_code=404, detail='Lost pet not found')
    if pet.owner_user_id != current_user.id:
        raise HTTPException(status_code=403, detail='Not allowed to manage this post')
    pet.status = 'resolved'
    await db.commit()
    return {'updated': True, 'id': pet.id, 'status': pet.status}


@app.delete('/api/lost-pets/{pet_id}')
async def delete_lost_pet(
    pet_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    pet = await db.get(LostPet, pet_id)
    if not pet:
        raise HTTPException(status_code=404, detail='Lost pet not found')
    if pet.owner_user_id != current_user.id:
        raise HTTPException(status_code=403, detail='Not allowed to delete this post')
    await db.delete(pet)
    await db.commit()
    ensure_file_removed(settings.upload_dir / pet.image_storage_key)
    ensure_file_removed(settings.upload_dir / pet.nose_image_storage_key if pet.nose_image_storage_key else None)
    ensure_file_removed(settings.upload_dir / pet.video_storage_key if pet.video_storage_key else None)
    ensure_file_removed(settings.upload_dir / pet.private_marker_image_storage_key if pet.private_marker_image_storage_key else None)
    return {'deleted': True, 'id': pet_id}


@app.get('/api/admin/overview', response_model=AdminOverview)
async def admin_overview(db: AsyncSession = Depends(get_db)):
    lost_count = int((await db.scalar(select(func.count()).select_from(LostPet))) or 0)
    found_count = int((await db.scalar(select(func.count()).select_from(FoundReport))) or 0)
    active_missing_count = int((await db.scalar(select(func.count()).select_from(LostPet).where(LostPet.status == 'missing'))) or 0)
    volunteer_count = int((await db.scalar(select(func.count()).select_from(VolunteerResponder).where(VolunteerResponder.is_active.is_(True)))) or 0)
    shelter_scan_count = int((await db.scalar(select(func.count()).select_from(FoundReport).where(FoundReport.source_type == 'shelter'))) or 0)
    social_ingest_count = int((await db.scalar(select(func.count()).select_from(FoundReport).where(FoundReport.source_type == 'social'))) or 0)

    latest_lost = list((await db.scalars(select(LostPet).order_by(LostPet.id.desc()).limit(5))).all())
    latest_matches = [
        {
            'lost_pet_id': pet.id,
            'name': pet.name,
            'animal_type': pet.animal_type,
            'city': pet.city or '',
            'image_url': pet.image_url,
            'score': 0,
            'reason': 'Active missing report',
            'vector_similarity': 0.0,
            'nose_similarity': 0.0,
            'tag_overlap': pet.semantic_tags or [],
            'microchip_exact': False,
            'verification_required': bool(pet.verification_prompt),
            'verification_prompt': pet.verification_prompt or '',
            'private_marker_prompt': pet.private_marker_prompt or '',
        }
        for pet in latest_lost
    ]

    return {
        'lost_count': lost_count,
        'found_count': found_count,
        'active_missing_count': active_missing_count,
        'volunteer_count': volunteer_count,
        'shelter_scan_count': shelter_scan_count,
        'social_ingest_count': social_ingest_count,
        'latest_matches': latest_matches,
    }
