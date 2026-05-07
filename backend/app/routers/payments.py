from __future__ import annotations
import hashlib
import hmac

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models.order import Order, OrderStatusHistory
from app.models.user import User
from app.utils.notifications import notify_order_confirmed

router = APIRouter(prefix="/payments", tags=["payments"])


def _verify_easypay_signature(payload: bytes, signature: str) -> bool:
    secret = settings.EASYPAY_WEBHOOK_SECRET.encode()
    expected = hmac.new(secret, payload, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)


@router.post("/webhook/easypay")
async def easypay_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    body = await request.body()
    sig = request.headers.get("x-easypay-signature", "")

    if settings.EASYPAY_WEBHOOK_SECRET and not _verify_easypay_signature(body, sig):
        raise HTTPException(status_code=400, detail="Invalid signature")

    payload = await request.json()
    event_type = payload.get("type")
    ep_id = payload.get("id")

    if event_type == "payment" and payload.get("status") == "success":
        result = await db.execute(select(Order).where(Order.easypay_id == ep_id))
        order = result.scalar_one_or_none()
        if order and order.payment_status != "paid":
            order.payment_status = "paid"
            order.status = "confirmed"
            db.add(OrderStatusHistory(order_id=order.id, status="confirmed", note="Pagamento recebido"))
            await db.commit()

            user_result = await db.execute(select(User).where(User.id == order.user_id))
            customer = user_result.scalar_one_or_none()
            if customer and customer.expo_push_token:
                notify_order_confirmed(customer.expo_push_token, str(order.id))

    return {"received": True}
