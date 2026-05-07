from __future__ import annotations
import asyncio
import uuid
from pathlib import Path

import cloudinary
import cloudinary.uploader

from app.config import settings

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
)

_USE_CLOUDINARY = bool(settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY and settings.CLOUDINARY_API_SECRET)

LOCAL_UPLOADS_DIR = Path(__file__).resolve().parents[3] / "uploads"
LOCAL_UPLOADS_DIR.mkdir(exist_ok=True)


async def upload_image(file_bytes: bytes, folder: str = "agrowood") -> str:
    if _USE_CLOUDINARY:
        result = await asyncio.to_thread(
            cloudinary.uploader.upload, file_bytes, folder=folder
        )
        return result["secure_url"]

    # Local fallback: save to disk and return a static URL
    filename = f"{uuid.uuid4().hex}.jpg"
    dest = LOCAL_UPLOADS_DIR / filename
    await asyncio.to_thread(dest.write_bytes, file_bytes)
    return f"{settings.PUBLIC_BASE_URL}/uploads/{filename}"


async def delete_image(public_id: str) -> None:
    if _USE_CLOUDINARY:
        await asyncio.to_thread(cloudinary.uploader.destroy, public_id)
