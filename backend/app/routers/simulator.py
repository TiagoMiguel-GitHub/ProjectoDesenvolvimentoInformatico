from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.simulator import SimulatorConfig
from app.models.user import User
from app.schemas.simulator import SimulatorConfigCreate, SimulatorConfigOut, SimulatorRequest, SimulatorResult
from app.utils.deps import get_current_admin

router = APIRouter(prefix="/simulator", tags=["simulator"])


@router.get("/configs", response_model=list[SimulatorConfigOut])
async def list_configs(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SimulatorConfig).where(SimulatorConfig.is_active == True))
    return result.scalars().all()


@router.post("/configs", response_model=SimulatorConfigOut, status_code=201)
async def create_config(body: SimulatorConfigCreate, _: User = Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    config = SimulatorConfig(**body.model_dump())
    db.add(config)
    await db.commit()
    await db.refresh(config)
    return config


@router.post("/calculate", response_model=SimulatorResult)
async def calculate(body: SimulatorRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(SimulatorConfig).where(
            SimulatorConfig.wood_type == body.wood_type,
            SimulatorConfig.is_active == True,
        )
    )
    config = result.scalar_one_or_none()
    if not config:
        raise HTTPException(status_code=404, detail="Wood type not found")

    wood_cost = float(config.price_per_unit) * body.quantity
    transport_cost = 0.0
    if body.include_transport and body.distance_km > 0:
        transport_cost = max(
            float(config.min_transport_cost),
            float(config.transport_cost_per_km) * body.distance_km,
        )

    return SimulatorResult(
        wood_type=body.wood_type,
        quantity=body.quantity,
        unit=config.unit,
        price_per_unit=float(config.price_per_unit),
        wood_cost=wood_cost,
        transport_cost=transport_cost,
        total=wood_cost + transport_cost,
    )
