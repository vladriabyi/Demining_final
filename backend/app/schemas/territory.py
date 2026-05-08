from pydantic import BaseModel
from typing import Optional
from app.models.territory import TerritoryStatus

class TerritoryCreate(BaseModel):
    name: str
    description: Optional[str] = None
    status: TerritoryStatus = TerritoryStatus.contaminated
    latitude: float
    longitude: float
    area_km2: Optional[float] = None

class TerritoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TerritoryStatus] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    area_km2: Optional[float] = None

class TerritoryOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    status: TerritoryStatus
    latitude: float
    longitude: float
    area_km2: Optional[float]
    model_config = {"from_attributes": True}
