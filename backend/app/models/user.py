from __future__ import annotations
from typing import List, TYPE_CHECKING
from sqlalchemy import String, Enum as PgEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base
import enum

if TYPE_CHECKING:
    from app.models.request import DeminingRequest

class UserRole(str, enum.Enum):
    civilian    = "civilian"
    operator    = "operator"
    coordinator = "coordinator"
    admin       = "admin"

class User(Base):
    __tablename__ = "users"

    id:              Mapped[int]      = mapped_column(primary_key=True)
    email:           Mapped[str]      = mapped_column(String(255), unique=True, index=True, nullable=False)
    full_name:       Mapped[str]      = mapped_column(String(255), nullable=False)
    hashed_password: Mapped[str]      = mapped_column(String(255), nullable=False)
    role:            Mapped[UserRole] = mapped_column(PgEnum(UserRole), default=UserRole.civilian, nullable=False)
    is_active:       Mapped[bool]     = mapped_column(default=True)

    requests: Mapped[List["DeminingRequest"]] = relationship(
        "DeminingRequest",
        foreign_keys="DeminingRequest.requester_id",
        back_populates="requester",
    )
    assigned: Mapped[List["DeminingRequest"]] = relationship(
        "DeminingRequest",
        foreign_keys="DeminingRequest.assigned_to_id",
        back_populates="assignee",
    )
