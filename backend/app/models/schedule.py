from __future__ import annotations
import uuid
from datetime import date, datetime, time
from typing import List

from sqlalchemy import Boolean, Date, DateTime, Integer, String, Time, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class TimeSlot(Base):
    __tablename__ = "time_slots"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slot_date: Mapped[date] = mapped_column(Date, nullable=False)
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_time: Mapped[time] = mapped_column(Time, nullable=False)
    max_orders: Mapped[int] = mapped_column(Integer, nullable=False, default=5)
    booked_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    slot_type: Mapped[str] = mapped_column(String(20), nullable=False, default="delivery")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    orders: Mapped[List["Order"]] = relationship("Order", back_populates="time_slot")

    @property
    def is_available(self) -> bool:
        return self.is_active and self.booked_count < self.max_orders
