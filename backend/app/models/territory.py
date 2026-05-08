from sqlalchemy import String, Text, Float, Enum as PgEnum
from sqlalchemy.orm import Mapped, mapped_column
from app.db.database import Base
import enum

class TerritoryStatus(str, enum.Enum):
    contaminated      = "contaminated"
    under_survey      = "under_survey"
    partially_cleared = "partially_cleared"
    cleared           = "cleared"

class Territory(Base):
    __tablename__ = "territories"
    id:          Mapped[int]             = mapped_column(primary_key=True)
    name:        Mapped[str]             = mapped_column(String(255), nullable=False)
    description: Mapped[str | None]      = mapped_column(Text)
    status:      Mapped[TerritoryStatus] = mapped_column(PgEnum(TerritoryStatus), default=TerritoryStatus.contaminated)
    latitude:    Mapped[float]           = mapped_column(Float, nullable=False)
    longitude:   Mapped[float]           = mapped_column(Float, nullable=False)
    area_km2:    Mapped[float | None]    = mapped_column(Float)
