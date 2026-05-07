from __future__ import annotations
import uuid
from datetime import datetime
from typing import List, Optional

from sqlalchemy import DateTime, Enum, ForeignKey, Numeric, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

ORDER_STATUSES = ("pending", "confirmed", "preparing", "out_for_delivery", "completed", "cancelled")
PAYMENT_METHODS = ("cash_on_delivery", "mbway", "multibanco")
PAYMENT_STATUSES = ("pending", "paid", "failed", "refunded")
FULFILLMENT_TYPES = ("delivery", "pickup")


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    address_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("addresses.id"))
    time_slot_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("time_slots.id"))
    delivery_zone_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("delivery_zones.id"))

    status: Mapped[str] = mapped_column(
        Enum(*ORDER_STATUSES, name="order_status"), nullable=False, default="pending"
    )
    fulfillment_type: Mapped[str] = mapped_column(
        Enum(*FULFILLMENT_TYPES, name="fulfillment_type"), nullable=False, default="delivery"
    )
    payment_method: Mapped[str] = mapped_column(
        Enum(*PAYMENT_METHODS, name="payment_method"), nullable=False, default="cash_on_delivery"
    )
    payment_status: Mapped[str] = mapped_column(
        Enum(*PAYMENT_STATUSES, name="payment_status"), nullable=False, default="pending"
    )

    subtotal: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    delivery_cost: Mapped[float] = mapped_column(Numeric(8, 2), nullable=False, default=0)
    total: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)

    easypay_id: Mapped[Optional[str]] = mapped_column(String(100))
    multibanco_entity: Mapped[Optional[str]] = mapped_column(String(10))
    multibanco_reference: Mapped[Optional[str]] = mapped_column(String(20))

    notes: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user: Mapped["User"] = relationship("User", back_populates="orders")
    address: Mapped[Optional["Address"]] = relationship("Address", back_populates="orders")
    time_slot: Mapped[Optional["TimeSlot"]] = relationship("TimeSlot", back_populates="orders")
    delivery_zone: Mapped[Optional["DeliveryZone"]] = relationship("DeliveryZone", back_populates="orders")
    items: Mapped[List["OrderItem"]] = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    status_history: Mapped[List["OrderStatusHistory"]] = relationship(
        "OrderStatusHistory", back_populates="order", cascade="all, delete-orphan", order_by="OrderStatusHistory.created_at"
    )


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    product_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False)
    quantity: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    unit_price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    total_price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)

    order: Mapped["Order"] = relationship("Order", back_populates="items")
    product: Mapped["Product"] = relationship("Product", back_populates="order_items")


class OrderStatusHistory(Base):
    __tablename__ = "order_status_history"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    status: Mapped[str] = mapped_column(Enum(*ORDER_STATUSES, name="order_status"), nullable=False)
    note: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    order: Mapped["Order"] = relationship("Order", back_populates="status_history")
