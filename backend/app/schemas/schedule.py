from __future__ import annotations
import uuid
from datetime import date, time, datetime

from pydantic import BaseModel


class TimeSlotOut(BaseModel):
    id: uuid.UUID
    slot_date: date
    start_time: time
    end_time: time
    max_orders: int
    booked_count: int
    slot_type: str
    is_available: bool

    model_config = {"from_attributes": True}


class TimeSlotCreate(BaseModel):
    slot_date: date
    start_time: time
    end_time: time
    max_orders: int = 5
    slot_type: str = "delivery"
