from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.db.database import get_db
from app.schemas.territory import TerritoryCreate, TerritoryUpdate, TerritoryOut
from app.crud import territory as crud
from app.api.v1.dependencies import get_current_user, require_coordinator
from app.models.user import User

router = APIRouter(prefix="/territories", tags=["territories"])

@router.get("/", response_model=List[TerritoryOut])
async def list_territories(db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    return await crud.get_all(db)

@router.post("/", response_model=TerritoryOut, status_code=201)
async def create_territory(data: TerritoryCreate, db: AsyncSession = Depends(get_db), _: User = Depends(require_coordinator)):
    return await crud.create(db, data)

@router.patch("/{tid}", response_model=TerritoryOut)
async def update_territory(tid: int, data: TerritoryUpdate, db: AsyncSession = Depends(get_db), _: User = Depends(require_coordinator)):
    t = await crud.get_by_id(db, tid)
    if not t: raise HTTPException(404, "Not found")
    return await crud.update(db, t, data)

@router.delete("/{tid}", status_code=204)
async def delete_territory(tid: int, db: AsyncSession = Depends(get_db), _: User = Depends(require_coordinator)):
    t = await crud.get_by_id(db, tid)
    if not t: raise HTTPException(404, "Not found")
    await crud.delete(db, t)
