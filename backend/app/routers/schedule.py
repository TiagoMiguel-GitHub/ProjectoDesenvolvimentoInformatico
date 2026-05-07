from __future__ import annotations
from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.schedule import TimeSlot
from app.models.user import User
from app.schemas.schedule import TimeSlotCreate, TimeSlotOut
from app.utils.deps import get_current_admin

router = APIRouter(prefix="/schedule", tags=["schedule"])


@router.get("/slots", response_model=list[TimeSlotOut])
async def list_available_slots(
    from_date: date = Query(...),
    to_date: date = Query(...),
    slot_type: str = Query("delivery"),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(TimeSlot).where(
            TimeSlot.slot_date >= from_date,
            TimeSlot.slot_date <= to_date,
            TimeSlot.slot_type == slot_type,
            TimeSlot.is_active == True,
        ).order_by(TimeSlot.slot_date, TimeSlot.start_time)
    )
    return result.scalars().all()


@router.post("/slots", response_model=TimeSlotOut, status_code=201)
async def create_slot(body: TimeSlotCreate, _: User = Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    slot = TimeSlot(**body.model_dump())
    db.add(slot)
    await db.commit()
    await db.refresh(slot)
    return slot


@router.delete("/slots/{slot_id}", status_code=204)
async def delete_slot(slot_id: str, _: User = Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    import uuid
    result = await db.execute(select(TimeSlot).where(TimeSlot.id == uuid.UUID(slot_id)))
    slot = result.scalar_one_or_none()
    if slot:
        slot.is_active = False
        await db.commit()
