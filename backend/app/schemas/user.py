from __future__ import annotations
import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr


class AddressCreate(BaseModel):
    label: str | None = None
    street: str
    city: str
    postal_code: str
    is_default: bool = False


class AddressOut(BaseModel):
    id: uuid.UUID
    label: str | None
    street: str
    city: str
    postal_code: str
    is_default: bool

    model_config = {"from_attributes": True}


class UserOut(BaseModel):
    id: uuid.UUID
    email: EmailStr
    phone: str | None
    full_name: str
    role: str
    is_active: bool
    created_at: datetime
    addresses: list[AddressOut] = []

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    full_name: str | None = None
    phone: str | None = None
