from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException, status
from jose import JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User, Address
from app.schemas.auth import LoginRequest, RefreshRequest, RegisterRequest, TokenResponse, UpdatePushTokenRequest
from app.schemas.user import AddressCreate, AddressOut, UserOut, UserUpdate
from app.utils.deps import get_current_user
from app.utils.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where(User.email == body.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Email already registered")
    user = User(
        email=body.email,
        full_name=body.full_name,
        phone=body.phone,
        password_hash=hash_password(body.password),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return TokenResponse(
        access_token=create_access_token(str(user.id)),
        refresh_token=create_refresh_token(str(user.id)),
    )


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account disabled")
    return TokenResponse(
        access_token=create_access_token(str(user.id)),
        refresh_token=create_refresh_token(str(user.id)),
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh(body: RefreshRequest, db: AsyncSession = Depends(get_db)):
    try:
        payload = decode_token(body.refresh_token)
        if payload.get("type") != "refresh":
            raise ValueError
        user_id = payload["sub"]
    except (JWTError, ValueError, KeyError):
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    return TokenResponse(
        access_token=create_access_token(user_id),
        refresh_token=create_refresh_token(user_id),
    )


@router.get("/me", response_model=UserOut)
async def me(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await db.refresh(user, ["addresses"])
    return user


@router.patch("/me", response_model=UserOut)
async def update_me(body: UserUpdate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if body.full_name is not None:
        user.full_name = body.full_name
    if body.phone is not None:
        user.phone = body.phone
    await db.commit()
    await db.refresh(user, ["addresses"])
    return user


@router.post("/me/push-token")
async def update_push_token(body: UpdatePushTokenRequest, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    user.expo_push_token = body.expo_push_token
    await db.commit()
    return {"ok": True}


@router.get("/me/addresses", response_model=list[AddressOut])
async def list_addresses(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await db.refresh(user, ["addresses"])
    return user.addresses


@router.post("/me/addresses", response_model=AddressOut, status_code=201)
async def add_address(body: AddressCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if body.is_default:
        await db.refresh(user, ["addresses"])
        for addr in user.addresses:
            addr.is_default = False
    address = Address(user_id=user.id, **body.model_dump())
    db.add(address)
    await db.commit()
    await db.refresh(address)
    return address


@router.delete("/me/addresses/{address_id}", status_code=204)
async def delete_address(address_id: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    import uuid as _uuid
    result = await db.execute(
        select(Address).where(Address.id == _uuid.UUID(address_id), Address.user_id == user.id)
    )
    address = result.scalar_one_or_none()
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")
    await db.delete(address)
    await db.commit()
