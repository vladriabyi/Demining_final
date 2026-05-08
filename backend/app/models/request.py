from sqlalchemy import String, Text, Float, ForeignKey, Enum as PgEnum, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.db.database import Base
from datetime import datetime
import enum


class RequestStatus(str, enum.Enum):
    pending      = "pending"
    under_review = "under_review"
    approved     = "approved"
    in_progress  = "in_progress"
    completed    = "completed"
    rejected     = "rejected"


class Priority(str, enum.Enum):
    low      = "low"
    medium   = "medium"
    high     = "high"
    critical = "critical"


class DeminingRequest(Base):
    __tablename__ = "demining_requests"

    id:             Mapped[int]           = mapped_column(primary_key=True)
    title:          Mapped[str]           = mapped_column(String(255), nullable=False)
    description:    Mapped[str | None]    = mapped_column(Text)
    status:         Mapped[RequestStatus] = mapped_column(PgEnum(RequestStatus), default=RequestStatus.pending)
    priority:       Mapped[Priority]      = mapped_column(PgEnum(Priority), default=Priority.medium)
    location_name:  Mapped[str]           = mapped_column(String(255), nullable=False)
    latitude:       Mapped[float]         = mapped_column(Float, nullable=False)
    longitude:      Mapped[float]         = mapped_column(Float, nullable=False)
    photo_path:     Mapped[str | None]    = mapped_column(String(512), nullable=True)
    requester_id:   Mapped[int]           = mapped_column(ForeignKey("users.id"), nullable=False)
    assigned_to_id: Mapped[int | None]    = mapped_column(ForeignKey("users.id"), nullable=True)
    # onupdate uses Python-side callable — works correctly with async SQLAlchemy
    created_at:     Mapped[datetime]      = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at:     Mapped[datetime]      = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=datetime.utcnow)

    requester: Mapped["User"]        = relationship("User", foreign_keys=[requester_id], back_populates="requests")
    assignee:  Mapped["User | None"] = relationship("User", foreign_keys=[assigned_to_id], back_populates="assigned")
