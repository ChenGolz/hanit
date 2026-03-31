from __future__ import annotations

import logging

from .config import settings

logger = logging.getLogger(__name__)


def build_match_comment(site_base_url: str, lost_pet_id: int, pet_name: str, score: int) -> str:
    return (
        f'PetConnect detected a possible match for {pet_name} ({score}%). '
        f'Review the case: {site_base_url.rstrip("/")}/matches?pet={lost_pet_id}'
    )


async def maybe_publish_external_comment(platform: str, reference_url: str, body: str) -> dict:
    platform = (platform or '').strip().lower()
    if not settings.social_auto_reply_enabled:
        return {'published': False, 'reason': 'social auto reply disabled', 'body': body}

    if platform == 'facebook' and not settings.facebook_approved_api_token:
        return {'published': False, 'reason': 'facebook approved api token missing', 'body': body}

    logger.info('External comment stub -> %s :: %s :: %s', platform, reference_url, body)
    return {'published': True, 'reason': 'stubbed connector', 'body': body}
