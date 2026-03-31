from __future__ import annotations

import math
from typing import Iterable

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .config import settings
from .models import FoundReport, LostPet
from .utils import km_distance



def cosine_similarity(a: Iterable[float] | None, b: Iterable[float] | None) -> float:
    if not a or not b:
        return 0.0
    a_list = list(a)
    b_list = list(b)
    if len(a_list) != len(b_list):
        limit = min(len(a_list), len(b_list))
        a_list = a_list[:limit]
        b_list = b_list[:limit]
    dot = sum(x * y for x, y in zip(a_list, b_list))
    norm_a = math.sqrt(sum(x * x for x in a_list)) or 1.0
    norm_b = math.sqrt(sum(y * y for y in b_list)) or 1.0
    return max(0.0, min(1.0, dot / (norm_a * norm_b)))



def semantic_overlap(found_tags: list[str] | None, lost_tags: list[str] | None) -> tuple[int, list[str]]:
    found_set = {item.strip().lower() for item in (found_tags or []) if item}
    lost_set = {item.strip().lower() for item in (lost_tags or []) if item}
    overlap = sorted(found_set & lost_set)
    if not overlap:
        return 0, []
    bonus = min(12, 4 + len(overlap) * 2)
    return bonus, overlap[:6]



def metadata_bonus(found: FoundReport, lost: LostPet) -> tuple[int, list[str], list[str]]:
    bonus = 0
    reasons: list[str] = []

    if found.animal_type == lost.animal_type:
        bonus += 8
        reasons.append('same animal type')

    if found.city_slug and lost.city_slug and found.city_slug == lost.city_slug:
        bonus += 8
        reasons.append('same city')

    if found.neighborhood and lost.neighborhood and found.neighborhood.strip().lower() == lost.neighborhood.strip().lower():
        bonus += 8
        reasons.append('same neighborhood')

    if found.color and lost.color and found.color.strip().lower() in lost.color.lower():
        bonus += 8
        reasons.append('similar color')

    if found.collar_description and lost.collar_description:
        f = found.collar_description.strip().lower()
        l = lost.collar_description.strip().lower()
        if f and l and (f in l or l in f):
            bonus += 7
            reasons.append('similar collar details')

    tag_bonus, overlap = semantic_overlap(found.semantic_tags, lost.semantic_tags)
    if tag_bonus:
        bonus += tag_bonus
        reasons.append('semantic attributes overlap')

    if found.latitude is not None and found.longitude is not None and lost.latitude is not None and lost.longitude is not None:
        distance_km = km_distance(float(found.latitude), float(found.longitude), float(lost.latitude), float(lost.longitude))
        if distance_km is not None and distance_km <= 2:
            bonus += 12
            reasons.append('reported within 2 km')
        elif distance_km is not None and distance_km <= settings.geofence_alert_radius_km:
            bonus += 8
            reasons.append(f'reported within {int(settings.geofence_alert_radius_km)} km')
        elif distance_km is not None and distance_km <= settings.heatmap_radius_km:
            bonus += 4
            reasons.append('reported nearby')

    return bonus, reasons, overlap



def final_score(primary_similarity: float, nose_similarity: float, bonus: int, exact_microchip: bool) -> int:
    score = primary_similarity * 66 + nose_similarity * 15 + bonus
    if exact_microchip:
        score += 22
    return min(99, max(0, int(round(score))))


async def find_matches(db: AsyncSession, found_report: FoundReport, limit: int = 8) -> list[dict]:
    stmt = select(LostPet).where(LostPet.status == 'missing')
    if found_report.animal_type and found_report.animal_type != 'other':
        stmt = stmt.where(LostPet.animal_type == found_report.animal_type)

    if settings.is_postgres and found_report.embedding:
        stmt = stmt.where(LostPet.embedding.is_not(None)).order_by(LostPet.embedding.cosine_distance(found_report.embedding)).limit(60)
    else:
        stmt = stmt.limit(200)
    candidates = list((await db.scalars(stmt)).all())

    results: list[dict] = []
    for pet in candidates:
        primary_similarity = cosine_similarity(found_report.embedding, pet.embedding)
        nose_similarity = cosine_similarity(found_report.nose_embedding, pet.nose_embedding)
        exact_microchip = bool(found_report.microchip_number and pet.microchip_number and found_report.microchip_number == pet.microchip_number)
        bonus, reasons, overlap = metadata_bonus(found_report, pet)
        if exact_microchip:
            reasons.append('exact microchip match')
        if nose_similarity >= 0.82:
            reasons.append('nose-print similarity')
        score = final_score(primary_similarity, nose_similarity, bonus, exact_microchip)
        if score < settings.match_threshold:
            continue
        if not reasons:
            reasons = ['visual embedding similarity']
        results.append(
            {
                'lost_pet_id': pet.id,
                'name': pet.name,
                'animal_type': pet.animal_type,
                'city': pet.city or '',
                'image_url': pet.image_url,
                'score': score,
                'reason': ' • '.join(reasons),
                'vector_similarity': round(primary_similarity, 3),
                'nose_similarity': round(nose_similarity, 3),
                'tag_overlap': overlap,
                'microchip_exact': exact_microchip,
                'verification_required': bool(pet.verification_prompt),
                'verification_prompt': pet.verification_prompt or '',
                'private_marker_prompt': pet.private_marker_prompt or '',
                'contact_phone': pet.contact_phone,
                'contact_email': pet.contact_email,
            }
        )

    results.sort(key=lambda item: item['score'], reverse=True)
    return results[:limit]
