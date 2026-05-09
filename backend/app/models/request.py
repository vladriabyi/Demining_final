from __future__ import annotations
from sqlalchemy import String, Text, Float, ForeignKey, Enum as PgEnum, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from geoalchemy2 import Geometry
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


class ExplosiveType(str, enum.Enum):
    """
    Тип вибухонебезпечного предмету.
    Відповідає класифікації IMAS (International Mine Action Standards).
    Описано у підрозділі 1.1.1 пояснювальної записки.
    """
    antipersonnel_mine  = "antipersonnel_mine"
    antitank_mine       = "antitank_mine"
    cluster_munition    = "cluster_munition"
    ied                 = "ied"
    unexploded_ordnance = "unexploded_ordnance"
    unknown             = "unknown"


# Дозволені переходи між статусами — реалізація 6-етапного
# життєвого циклу заявки (підрозділ 1.1.2 пояснювальної записки)
VALID_TRANSITIONS: dict[RequestStatus, set[RequestStatus]] = {
    RequestStatus.pending:      {RequestStatus.under_review, RequestStatus.rejected},
    RequestStatus.under_review: {RequestStatus.approved,     RequestStatus.rejected},
    RequestStatus.approved:     {RequestStatus.in_progress,  RequestStatus.rejected},
    RequestStatus.in_progress:  {RequestStatus.completed,    RequestStatus.rejected},
    RequestStatus.completed:    set(),
    RequestStatus.rejected:     set(),
}


class DeminingRequest(Base):
    __tablename__ = "demining_requests"

    id:             Mapped[int]           = mapped_column(primary_key=True)
    title:          Mapped[str]           = mapped_column(String(255), nullable=False)
    description:    Mapped[str | None]    = mapped_column(Text)
    status:         Mapped[RequestStatus] = mapped_column(PgEnum(RequestStatus), default=RequestStatus.pending)
    priority:       Mapped[Priority]      = mapped_column(PgEnum(Priority), default=Priority.medium)
    explosive_type: Mapped[ExplosiveType] = mapped_column(PgEnum(ExplosiveType), default=ExplosiveType.unknown)
    location_name:  Mapped[str]           = mapped_column(String(255), nullable=False)

    # Числові координати — основний інтерфейс для Leaflet та API
    latitude:       Mapped[float]         = mapped_column(Float, nullable=False)
    longitude:      Mapped[float]         = mapped_column(Float, nullable=False)

    # PostGIS geometry — для просторових запитів
    # SRID 4326 = WGS-84, стандарт GPS-координат
    location:       Mapped[object | None] = mapped_column(
        Geometry(geometry_type="POINT", srid=4326),
        nullable=True,
        comment="PostGIS POINT у WGS-84. Автоматично обчислюється з latitude/longitude."
    )

    photo_path:     Mapped[str | None]    = mapped_column(String(512), nullable=True)
    requester_id:   Mapped[int]           = mapped_column(ForeignKey("users.id"), nullable=False)
    assigned_to_id: Mapped[int | None]    = mapped_column(ForeignKey("users.id"), nullable=True)
    created_at:     Mapped[datetime]      = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at:     Mapped[datetime]      = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=datetime.utcnow)

    requester:      Mapped["User"]        = relationship("User", foreign_keys=[requester_id],   back_populates="requests")
    assignee:       Mapped["User | None"] = relationship("User", foreign_keys=[assigned_to_id], back_populates="assigned")
    status_history: Mapped[list["RequestStatusHistory"]] = relationship(
        "RequestStatusHistory", back_populates="request",
        order_by="RequestStatusHistory.changed_at"
    )


class RequestStatusHistory(Base):
    """
    Журнал змін статусів заявки (audit log).
    Забезпечує повну трасованість процесу обробки заявки —
    відповідає вимогам підрозділу 1.1.2 пояснювальної записки.
    """
    __tablename__ = "request_status_history"

    id:         Mapped[int]      = mapped_column(primary_key=True)
    request_id: Mapped[int]      = mapped_column(ForeignKey("demining_requests.id", ondelete="CASCADE"), nullable=False, index=True)
    old_status: Mapped[str]      = mapped_column(String(50), nullable=False)
    new_status: Mapped[str]      = mapped_column(String(50), nullable=False)
    changed_by: Mapped[int]      = mapped_column(ForeignKey("users.id"), nullable=False)
    comment:    Mapped[str|None] = mapped_column(String(512), nullable=True)
    changed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    request:         Mapped["DeminingRequest"] = relationship("DeminingRequest", back_populates="status_history")
    changed_by_user: Mapped["User"]            = relationship("User", foreign_keys=[changed_by])
