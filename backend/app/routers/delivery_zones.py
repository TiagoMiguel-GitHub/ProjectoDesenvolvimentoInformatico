from __future__ import annotations
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.delivery_zone import DeliveryZone
from app.models.user import User
from app.schemas.delivery_zone import DeliveryCostQuery, DeliveryZoneCreate, DeliveryZoneOut
from app.utils.deps import get_current_admin

router = APIRouter(prefix="/delivery-zones", tags=["delivery-zones"])


@router.get("", response_model=list[DeliveryZoneOut])
async def list_zones(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DeliveryZone).where(DeliveryZone.is_active == True))
    return result.scalars().all()


@router.post("", response_model=DeliveryZoneOut, status_code=201)
async def create_zone(body: DeliveryZoneCreate, _: User = Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    zone = DeliveryZone(**body.model_dump())
    db.add(zone)
    await db.commit()
    await db.refresh(zone)
    return zone


@router.post("/calculate-cost")
async def calculate_cost(body: DeliveryCostQuery, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DeliveryZone).where(DeliveryZone.is_active == True))
    zones = result.scalars().all()
    prefix = body.postal_code.replace("-", "").replace(" ", "")[:4]
    for zone in zones:
        codes = [c.strip() for c in zone.postal_codes.split(",")]
        if any(prefix.startswith(c) for c in codes):
            free = zone.free_delivery_threshold
            cost = 0.0 if (free and body.order_subtotal >= free) else float(zone.delivery_cost)
            return {"zone": zone.name, "delivery_cost": cost, "free_delivery_threshold": free}
    return {"zone": None, "delivery_cost": None, "free_delivery_threshold": None}
