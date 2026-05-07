from __future__ import annotations
import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, Header
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.delivery_zone import DeliveryZone
from app.models.order import Order, OrderItem, OrderStatusHistory
from app.models.product import Product
from app.models.schedule import TimeSlot
from app.models.user import Address, User
from app.schemas.order import OrderCreate, OrderOut, OrderStatusUpdate
from app.utils.deps import get_current_admin, get_current_user
from app.utils.notifications import (
    notify_order_completed,
    notify_order_confirmed,
    notify_order_out_for_delivery,
)

router = APIRouter(prefix="/orders", tags=["orders"])

_ORDER_LOAD = [
    selectinload(Order.items).selectinload(OrderItem.product).selectinload(Product.category),
    selectinload(Order.address),
    selectinload(Order.status_history),
]


async def _load_order(order_id: uuid.UUID, db: AsyncSession) -> Order:
    result = await db.execute(select(Order).options(*_ORDER_LOAD).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.post("", response_model=OrderOut, status_code=201)
async def create_order(body: OrderCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if not body.items:
        raise HTTPException(status_code=400, detail="Order must have at least one item")

    # validate + reserve products
    order_items = []
    subtotal = 0.0
    for item_in in body.items:
        result = await db.execute(select(Product).where(Product.id == item_in.product_id, Product.is_active == True))
        product = result.scalar_one_or_none()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item_in.product_id} not found")
        if float(product.stock_quantity) < item_in.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for {product.name}")
        product.stock_quantity = float(product.stock_quantity) - item_in.quantity
        total_price = float(product.price_per_unit) * item_in.quantity
        subtotal += total_price
        order_items.append(OrderItem(product_id=product.id, quantity=item_in.quantity, unit_price=float(product.price_per_unit), total_price=total_price))

    # delivery cost
    delivery_cost = 0.0
    delivery_zone_id = None
    if body.fulfillment_type == "delivery" and body.address_id:
        addr_result = await db.execute(select(Address).where(Address.id == body.address_id, Address.user_id == user.id))
        address = addr_result.scalar_one_or_none()
        if not address:
            raise HTTPException(status_code=404, detail="Address not found")
        zone_result = await db.execute(select(DeliveryZone).where(DeliveryZone.is_active == True))
        for zone in zone_result.scalars().all():
            codes = [c.strip() for c in zone.postal_codes.split(",")]
            prefix = address.postal_code.replace("-", "").replace(" ", "")[:4]
            if any(prefix.startswith(c) for c in codes):
                delivery_zone_id = zone.id
                free = zone.free_delivery_threshold
                delivery_cost = 0.0 if (free and subtotal >= free) else float(zone.delivery_cost)
                break

    # book time slot
    if body.time_slot_id:
        slot_result = await db.execute(select(TimeSlot).where(TimeSlot.id == body.time_slot_id, TimeSlot.is_active == True))
        slot = slot_result.scalar_one_or_none()
        if not slot or not slot.is_available:
            raise HTTPException(status_code=400, detail="Time slot not available")
        slot.booked_count += 1

    order = Order(
        user_id=user.id,
        address_id=body.address_id,
        time_slot_id=body.time_slot_id,
        delivery_zone_id=delivery_zone_id,
        fulfillment_type=body.fulfillment_type,
        payment_method=body.payment_method,
        subtotal=subtotal,
        delivery_cost=delivery_cost,
        total=subtotal + delivery_cost,
        notes=body.notes,
    )
    db.add(order)
    await db.flush()

    for oi in order_items:
        oi.order_id = order.id
        db.add(oi)

    history = OrderStatusHistory(order_id=order.id, status="pending")
    db.add(history)

    await db.commit()
    return await _load_order(order.id, db)


@router.get("/my", response_model=list[OrderOut])
async def my_orders(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Order).options(*_ORDER_LOAD).where(Order.user_id == user.id).order_by(Order.created_at.desc())
    )
    return result.scalars().all()


@router.get("/my/{order_id}", response_model=OrderOut)
async def my_order_detail(order_id: uuid.UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    order = await _load_order(order_id, db)
    if order.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not your order")
    return order


# --- Admin endpoints ---

@router.get("", response_model=list[OrderOut])
async def list_all_orders(status: str | None = None, _: User = Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    q = select(Order).options(*_ORDER_LOAD).order_by(Order.created_at.desc())
    if status:
        q = q.where(Order.status == status)
    result = await db.execute(q)
    return result.scalars().all()


@router.patch("/{order_id}/status", response_model=OrderOut)
async def update_order_status(order_id: uuid.UUID, body: OrderStatusUpdate, admin: User = Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    order = await _load_order(order_id, db)

    valid_statuses = ("pending", "confirmed", "preparing", "out_for_delivery", "completed", "cancelled")
    if body.status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid status")

    order.status = body.status
    db.add(OrderStatusHistory(order_id=order.id, status=body.status, note=body.note))
    await db.commit()

    # push notification
    user_result = await db.execute(select(User).where(User.id == order.user_id))
    customer = user_result.scalar_one_or_none()
    if customer and customer.expo_push_token:
        token = customer.expo_push_token
        oid = str(order.id)
        if body.status == "confirmed":
            notify_order_confirmed(token, oid)
        elif body.status == "out_for_delivery":
            notify_order_out_for_delivery(token, oid)
        elif body.status == "completed":
            notify_order_completed(token, oid)

    return await _load_order(order.id, db)
