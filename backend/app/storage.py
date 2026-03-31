from __future__ import annotations

import asyncio
import shutil
import uuid
from dataclasses import dataclass
from pathlib import Path

import aiofiles
import boto3
from fastapi import UploadFile

from .config import settings
from .utils import safe_filename


@dataclass(slots=True)
class SavedUpload:
    storage_key: str
    public_url: str
    local_path: Path


async def _write_local(upload: UploadFile, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    await upload.seek(0)
    async with aiofiles.open(destination, 'wb') as out:
        while True:
            chunk = await upload.read(1024 * 1024)
            if not chunk:
                break
            await out.write(chunk)
    await upload.seek(0)


async def _upload_to_s3(local_path: Path, key: str, content_type: str) -> str:
    session = boto3.session.Session(
        aws_access_key_id=settings.s3_access_key_id or None,
        aws_secret_access_key=settings.s3_secret_access_key or None,
        region_name=settings.s3_region or None,
    )
    client = session.client('s3', endpoint_url=settings.s3_endpoint_url or None)
    await asyncio.to_thread(
        client.upload_file,
        str(local_path),
        settings.s3_bucket,
        key,
        ExtraArgs={'ContentType': content_type},
    )
    if settings.s3_public_base_url:
        return f"{settings.s3_public_base_url.rstrip('/')}/{key}"
    return f'https://{settings.s3_bucket}.s3.{settings.s3_region}.amazonaws.com/{key}'


async def save_generated_file(source_path: Path, prefix: str, extension: str = '.jpg', content_type: str = 'image/jpeg') -> SavedUpload:
    extension = extension if extension.startswith('.') else f'.{extension}'
    filename = f'{prefix}_{uuid.uuid4().hex[:12]}{extension}'
    local_path = settings.upload_dir / filename
    local_path.parent.mkdir(parents=True, exist_ok=True)
    await asyncio.to_thread(shutil.copyfile, source_path, local_path)

    if not settings.uses_s3:
        return SavedUpload(storage_key=filename, public_url=f"{settings.public_base_url.rstrip('/')}/uploads/{filename}", local_path=local_path)

    key = f'uploads/{filename}'
    url = await _upload_to_s3(local_path, key, content_type)
    return SavedUpload(storage_key=key, public_url=url, local_path=local_path)


async def save_upload(upload: UploadFile, prefix: str) -> SavedUpload:
    extension = Path(upload.filename or 'upload.bin').suffix or '.bin'
    filename = f"{prefix}_{uuid.uuid4().hex[:12]}_{safe_filename(Path(upload.filename or 'upload').stem)}{extension}"
    local_path = settings.upload_dir / filename
    await _write_local(upload, local_path)

    if not settings.uses_s3:
        return SavedUpload(
            storage_key=filename,
            public_url=f"{settings.public_base_url.rstrip('/')}/uploads/{filename}",
            local_path=local_path,
        )

    key = f'uploads/{filename}'
    url = await _upload_to_s3(local_path, key, upload.content_type or 'application/octet-stream')
    return SavedUpload(storage_key=key, public_url=url, local_path=local_path)
