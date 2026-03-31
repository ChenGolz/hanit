from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from sqlalchemy import Boolean, DateTime, ForeignKey, Index, Integer, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import JSON

from .config import settings
from .db import Base

try:
    from pgvector.sqlalchemy import VECTOR
except Exception:  # pragma: no cover
    VECTOR = None


EMBEDDING_TYPE = VECTOR(settings.embedding_dim) if settings.is_postgres and VECTOR else JSON
NOSE_EMBEDDING_TYPE = VECTOR(settings.nose_embedding_dim) if settings.is_postgres and VECTOR else JSON


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )


class User(TimestampMixin, Base):
    __tablename__ = 'users'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    identifier: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    channel: Mapped[str] = mapped_column(String(20))
    display_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    is_active: Mapped[bool] = mapped_column(default=True)

    lost_pets: Mapped[list['LostPet']] = relationship(back_populates='owner')


class OTPChallenge(Base):
    __tablename__ = 'otp_challenges'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    identifier: Mapped[str] = mapped_column(String(255), index=True)
    code_hash: Mapped[str] = mapped_column(String(128))
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    consumed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class LostPet(TimestampMixin, Base):
    __tablename__ = 'lost_pets'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    owner_user_id: Mapped[int | None] = mapped_column(ForeignKey('users.id'), nullable=True, index=True)
    name: Mapped[str] = mapped_column(String(120))
    animal_type: Mapped[str] = mapped_column(String(30), index=True)
    breed: Mapped[str | None] = mapped_column(String(120), nullable=True)
    color: Mapped[str | None] = mapped_column(String(160), nullable=True)
    collar_description: Mapped[str | None] = mapped_column(String(200), nullable=True)
    unique_markings: Mapped[str | None] = mapped_column(Text, nullable=True)
    semantic_tags: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    source_type: Mapped[str | None] = mapped_column(String(40), nullable=True, index=True)
    last_seen_location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    city: Mapped[str | None] = mapped_column(String(120), index=True, nullable=True)
    city_slug: Mapped[str | None] = mapped_column(String(120), index=True, nullable=True)
    neighborhood: Mapped[str | None] = mapped_column(String(120), index=True, nullable=True)
    latitude: Mapped[Decimal | None] = mapped_column(Numeric(9, 6), nullable=True)
    longitude: Mapped[Decimal | None] = mapped_column(Numeric(9, 6), nullable=True)
    contact_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    contact_phone: Mapped[str | None] = mapped_column(String(40), nullable=True, index=True)
    contact_email: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    microchip_number: Mapped[str | None] = mapped_column(String(80), nullable=True, index=True)
    verification_prompt: Mapped[str | None] = mapped_column(String(255), nullable=True)
    verification_answer_hash: Mapped[str | None] = mapped_column(String(128), nullable=True)
    private_marker_prompt: Mapped[str | None] = mapped_column(String(255), nullable=True)
    private_marker_image_storage_key: Mapped[str | None] = mapped_column(String(255), nullable=True)
    private_marker_image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    nose_image_storage_key: Mapped[str | None] = mapped_column(String(255), nullable=True)
    nose_image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    video_storage_key: Mapped[str | None] = mapped_column(String(255), nullable=True)
    video_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    best_frame_score: Mapped[float | None] = mapped_column(Numeric(6, 4), nullable=True)
    best_frame_source: Mapped[str | None] = mapped_column(String(30), nullable=True)
    auto_notify_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    status: Mapped[str] = mapped_column(String(30), default='missing', index=True)
    image_storage_key: Mapped[str] = mapped_column(String(255))
    image_url: Mapped[str] = mapped_column(String(500))
    embedding: Mapped[list[float] | None] = mapped_column(EMBEDDING_TYPE, nullable=True)
    nose_embedding: Mapped[list[float] | None] = mapped_column(NOSE_EMBEDDING_TYPE, nullable=True)

    owner: Mapped[User | None] = relationship(back_populates='lost_pets')

    __table_args__ = (
        Index('ix_lost_pets_status_city', 'status', 'city_slug'),
        Index('ix_lost_pets_status_neighborhood', 'status', 'neighborhood'),
        Index(
            'ix_lost_pets_embedding_hnsw',
            'embedding',
            postgresql_using='hnsw',
            postgresql_with={'m': 16, 'ef_construction': 64},
            postgresql_ops={'embedding': 'vector_cosine_ops'},
        ) if settings.is_postgres and VECTOR else Index('ix_lost_pets_embedding_fallback', 'status'),
        Index(
            'ix_lost_pets_nose_embedding_hnsw',
            'nose_embedding',
            postgresql_using='hnsw',
            postgresql_with={'m': 16, 'ef_construction': 64},
            postgresql_ops={'nose_embedding': 'vector_cosine_ops'},
        ) if settings.is_postgres and VECTOR else Index('ix_lost_pets_microchip', 'microchip_number'),
    )


class FoundReport(TimestampMixin, Base):
    __tablename__ = 'found_reports'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    animal_type: Mapped[str] = mapped_column(String(30), index=True)
    breed: Mapped[str | None] = mapped_column(String(120), nullable=True)
    color: Mapped[str | None] = mapped_column(String(160), nullable=True)
    collar_description: Mapped[str | None] = mapped_column(String(200), nullable=True)
    semantic_tags: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    seen_location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    city: Mapped[str | None] = mapped_column(String(120), index=True, nullable=True)
    city_slug: Mapped[str | None] = mapped_column(String(120), index=True, nullable=True)
    neighborhood: Mapped[str | None] = mapped_column(String(120), index=True, nullable=True)
    latitude: Mapped[Decimal | None] = mapped_column(Numeric(9, 6), nullable=True)
    longitude: Mapped[Decimal | None] = mapped_column(Numeric(9, 6), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    finder_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    finder_phone: Mapped[str | None] = mapped_column(String(40), nullable=True)
    finder_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    microchip_number: Mapped[str | None] = mapped_column(String(80), nullable=True, index=True)
    nose_image_storage_key: Mapped[str | None] = mapped_column(String(255), nullable=True)
    nose_image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    video_storage_key: Mapped[str | None] = mapped_column(String(255), nullable=True)
    video_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    best_frame_score: Mapped[float | None] = mapped_column(Numeric(6, 4), nullable=True)
    best_frame_source: Mapped[str | None] = mapped_column(String(30), nullable=True)
    source_type: Mapped[str | None] = mapped_column(String(40), nullable=True, index=True)
    source_platform: Mapped[str | None] = mapped_column(String(40), nullable=True, index=True)
    source_reference_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    source_post_id: Mapped[str | None] = mapped_column(String(120), nullable=True)
    municipality_106_sent: Mapped[bool] = mapped_column(Boolean, default=False)
    image_storage_key: Mapped[str] = mapped_column(String(255))
    image_url: Mapped[str] = mapped_column(String(500))
    embedding: Mapped[list[float] | None] = mapped_column(EMBEDDING_TYPE, nullable=True)
    nose_embedding: Mapped[list[float] | None] = mapped_column(NOSE_EMBEDDING_TYPE, nullable=True)

    __table_args__ = (
        Index('ix_found_reports_city_type', 'city_slug', 'animal_type'),
        Index('ix_found_reports_source_platform', 'source_platform', 'source_type'),
        Index(
            'ix_found_reports_embedding_hnsw',
            'embedding',
            postgresql_using='hnsw',
            postgresql_with={'m': 16, 'ef_construction': 64},
            postgresql_ops={'embedding': 'vector_cosine_ops'},
        ) if settings.is_postgres and VECTOR else Index('ix_found_reports_embedding_fallback', 'animal_type'),
        Index(
            'ix_found_reports_nose_embedding_hnsw',
            'nose_embedding',
            postgresql_using='hnsw',
            postgresql_with={'m': 16, 'ef_construction': 64},
            postgresql_ops={'nose_embedding': 'vector_cosine_ops'},
        ) if settings.is_postgres and VECTOR else Index('ix_found_reports_microchip', 'microchip_number'),
    )


class VolunteerResponder(TimestampMixin, Base):
    __tablename__ = 'volunteer_responders'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(40), nullable=True, index=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    city: Mapped[str | None] = mapped_column(String(120), nullable=True)
    city_slug: Mapped[str | None] = mapped_column(String(120), nullable=True, index=True)
    neighborhood: Mapped[str | None] = mapped_column(String(120), nullable=True, index=True)
    latitude: Mapped[Decimal | None] = mapped_column(Numeric(9, 6), nullable=True)
    longitude: Mapped[Decimal | None] = mapped_column(Numeric(9, 6), nullable=True)
    radius_km: Mapped[float] = mapped_column(Numeric(6, 2), default=2.5)
    channels: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class ProxyConversation(TimestampMixin, Base):
    __tablename__ = 'proxy_conversations'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    public_token: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    lost_pet_id: Mapped[int] = mapped_column(ForeignKey('lost_pets.id'), index=True)
    found_report_id: Mapped[int] = mapped_column(ForeignKey('found_reports.id'), index=True)
    owner_phone: Mapped[str | None] = mapped_column(String(40), nullable=True)
    owner_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    finder_phone: Mapped[str | None] = mapped_column(String(40), nullable=True)
    finder_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    claim_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    status: Mapped[str] = mapped_column(String(30), default='active', index=True)


class ProxyMessage(Base):
    __tablename__ = 'proxy_messages'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    conversation_id: Mapped[int] = mapped_column(ForeignKey('proxy_conversations.id'), index=True)
    sender_role: Mapped[str] = mapped_column(String(20))
    body: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
