from __future__ import annotations
import uuid

from pydantic import BaseModel


class SimulatorConfigOut(BaseModel):
    id: uuid.UUID
    wood_type: str
    price_per_unit: float
    unit: str
    transport_cost_per_km: float
    min_transport_cost: float
    description: str | None

    model_config = {"from_attributes": True}


class SimulatorConfigCreate(BaseModel):
    wood_type: str
    price_per_unit: float
    unit: str = "m3"
    transport_cost_per_km: float = 0
    min_transport_cost: float = 0
    description: str | None = None


class SimulatorRequest(BaseModel):
    wood_type: str
    quantity: float
    distance_km: float = 0
    include_transport: bool = False


class SimulatorResult(BaseModel):
    wood_type: str
    quantity: float
    unit: str
    price_per_unit: float
    wood_cost: float
    transport_cost: float
    total: float
