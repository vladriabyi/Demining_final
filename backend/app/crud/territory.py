from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.territory import Territory
from app.schemas.territory import TerritoryCreate, TerritoryUpdate
from typing import Optional, List

async def get_all(db: AsyncSession) -> List[Territory]:
    r = await db.execute(select(Territory))
    return list(r.scalars().all())

async def get_by_id(db: AsyncSession, tid: int) -> Optional[Territory]:
    r = await db.execute(select(Territory).where(Territory.id == tid))
    return r.scalar_one_or_none()

async def create(db: AsyncSession, data: TerritoryCreate) -> Territory:
    t = Territory(**data.model_dump())
    db.add(t); await db.commit(); await db.refresh(t)
    return t

async def update(db: AsyncSession, t: Territory, data: TerritoryUpdate) -> Territory:
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(t, k, v)
    await db.commit(); await db.refresh(t)
    return t

async def delete(db: AsyncSession, t: Territory) -> None:
    await db.delete(t); await db.commit()
