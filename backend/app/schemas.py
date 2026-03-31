from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field


class OTPRequestIn(BaseModel):
    identifier: str


class OTPVerifyIn(BaseModel):
    identifier: str
    code: str = Field(min_length=4, max_length=8)


class ClaimVerificationIn(BaseModel):
    report_id: int
    answer: str = Field(min_length=1, max_length=255)
    intro_message: str = Field(default='I may have found your pet.', max_length=500)
    physical_marker_confirmed: bool = False


class RelayMessageIn(BaseModel):
    body: str = Field(min_length=1, max_length=1000)
    sender_role: str = Field(default='finder')


class VolunteerSignupIn(BaseModel):
    name: str = ''
    phone: str = ''
    email: str = ''
    city: str = ''
    neighborhood: str = ''
    latitude: float | None = None
    longitude: float | None = None
    radius_km: float = Field(default=2.5, ge=0.5, le=20)
    channels: List[str] = Field(default_factory=lambda: ['sms'])


class SocialIngestIn(BaseModel):
    animal_type: str = 'dog'
    city: str = ''
    neighborhood: str = ''
    notes: str = ''
    source_platform: str = 'manual'
    source_reference_url: str = ''
    source_post_id: str = ''
    image_url: str = ''


class UserOut(BaseModel):
    id: int
    identifier: str
    channel: str


class LostPetOut(BaseModel):
    id: int
    name: str
    animal_type: str
    breed: Optional[str] = ''
    color: Optional[str] = ''
    collar_description: Optional[str] = ''
    unique_markings: Optional[str] = ''
    semantic_tags: List[str] = Field(default_factory=list)
    last_seen_location: Optional[str] = ''
    city: Optional[str] = ''
    city_slug: Optional[str] = ''
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    contact_name: Optional[str] = ''
    contact_phone_masked: Optional[str] = ''
    contact_email_masked: Optional[str] = ''
    microchip_number_masked: Optional[str] = ''
    private_marker_prompt: Optional[str] = ''
    status: str
    image_url: str
    created_at: str


class MatchOut(BaseModel):
    lost_pet_id: int
    name: str
    animal_type: str
    city: str
    image_url: str
    score: int
    reason: str
    vector_similarity: float
    nose_similarity: float = 0.0
    tag_overlap: List[str] = Field(default_factory=list)
    microchip_exact: bool = False
    verification_required: bool = False
    verification_prompt: str = ''
    private_marker_prompt: str = ''


class MunicipalDraftOut(BaseModel):
    city_slug: str
    recipient: str = ''
    subject: str
    body: str
    mailto: str = ''


class HeatmapPointOut(BaseModel):
    lat: float
    lng: float
    count: int = 1
    label: str = ''
    report_id: int
    created_at: str


class FoundReportResponse(BaseModel):
    saved: bool
    report_id: int
    matches: List[MatchOut]
    municipal_draft: MunicipalDraftOut | None = None
    offline_safe: bool = True
    geofence_alerts_sent: int = 0
    best_frame: dict | None = None


class AdminOverview(BaseModel):
    lost_count: int
    found_count: int
    active_missing_count: int
    volunteer_count: int = 0
    shelter_scan_count: int = 0
    social_ingest_count: int = 0
    latest_matches: List[MatchOut]
