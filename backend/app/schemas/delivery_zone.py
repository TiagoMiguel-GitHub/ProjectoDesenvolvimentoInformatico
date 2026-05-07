from __future__ import annotations
import uuid

from pydantic import BaseModel


class DeliveryZoneOut(BaseModel):
    id: uuid.UUID
    name: str
    postal_codes: str
    delivery_cost: float
    free_delivery_threshold: float | None

    model_config = {"from_attributes": True}


class DeliveryZoneCreate(BaseModel):
    name: str
    postal_codes: str
    delivery_cost: float
    free_delivery_threshold: float | None = None


class DeliveryCostQuery(BaseModel):
    postal_code: str
    order_subtotal: float
