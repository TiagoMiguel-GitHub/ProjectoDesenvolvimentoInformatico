from __future__ import annotations
import uuid
from datetime import datetime

from pydantic import BaseModel


class CategoryOut(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    description: str | None
    image_url: str | None
    is_active: bool

    model_config = {"from_attributes": True}


class CategoryCreate(BaseModel):
    name: str
    slug: str
    description: str | None = None
    image_url: str | None = None


class ProductOut(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    description: str | None
    unit: str
    price_per_unit: float
    stock_quantity: float
    min_order_quantity: float
    image_url: str | None
    season_start_month: int | None
    season_end_month: int | None
    is_active: bool
    category: CategoryOut

    model_config = {"from_attributes": True}


class ProductCreate(BaseModel):
    category_id: uuid.UUID
    name: str
    slug: str
    description: str | None = None
    unit: str = "kg"
    price_per_unit: float
    stock_quantity: float = 0
    min_order_quantity: float = 1
    image_url: str | None = None
    season_start_month: int | None = None
    season_end_month: int | None = None


class ProductUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    price_per_unit: float | None = None
    stock_quantity: float | None = None
    min_order_quantity: float | None = None
    image_url: str | None = None
    season_start_month: int | None = None
    season_end_month: int | None = None
    is_active: bool | None = None


class StockUpdate(BaseModel):
    stock_quantity: float
