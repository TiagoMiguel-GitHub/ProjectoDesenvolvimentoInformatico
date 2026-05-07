from __future__ import annotations
import asyncio
from app.config import settings
from app.database import AsyncSessionLocal
from app.models.user import User
from app.utils.security import hash_password
from sqlalchemy import select


async def main():
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.email == settings.FIRST_ADMIN_EMAIL))
        existing = result.scalar_one_or_none()
        if existing:
            print(f"Admin already exists: {settings.FIRST_ADMIN_EMAIL}")
            return
        admin = User(
            email=settings.FIRST_ADMIN_EMAIL,
            full_name="Admin AgroWood",
            password_hash=hash_password(settings.FIRST_ADMIN_PASSWORD),
            role="admin",
        )
        db.add(admin)
        await db.commit()
        print(f"✓ Admin created: {settings.FIRST_ADMIN_EMAIL} / {settings.FIRST_ADMIN_PASSWORD}")


asyncio.run(main())
