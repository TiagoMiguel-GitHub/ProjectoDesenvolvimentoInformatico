from __future__ import annotations
import uuid
from datetime import datetime

from pydantic import BaseModel

from app.schemas.product import ProductOut
from app.schemas.user import AddressOut


class OrderItemCreate(BaseModel):
    product_id: uuid.UUID
    quantity: float


class OrderItemOut(BaseModel):
    id: uuid.UUID
    product: ProductOut
    quantity: float
    unit_price: float
    total_price: float

    model_config = {"from_attributes": True}


class OrderStatusHistoryOut(BaseModel):
    status: str
    note: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class OrderCreate(BaseModel):
    address_id: uuid.UUID | None = None
    time_slot_id: uuid.UUID | None = None
    fulfillment_type: str = "delivery"
    payment_method: str = "cash_on_delivery"
    items: list[OrderItemCreate]
    notes: str | None = None


class OrderOut(BaseModel):
    id: uuid.UUID
    status: str
    fulfillment_type: str
    payment_method: str
    payment_status: str
    subtotal: float
    delivery_cost: float
    total: float
    multibanco_entity: str | None
    multibanco_reference: str | None
    notes: str | None
    created_at: datetime
    address: AddressOut | None
    items: list[OrderItemOut]
    status_history: list[OrderStatusHistoryOut]

    model_config = {"from_attributes": True}


class OrderStatusUpdate(BaseModel):
    status: str
    note: str | None = None
