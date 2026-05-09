from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import Optional, List

from app.models.request import DeminingRequest, RequestStatus, Priority
from app.models.user import User, UserRole
from app.models.territory import Territory
from app.schemas.request import RequestCreate, RequestUpdate


def _q():
    return select(DeminingRequest).options(
        selectinload(DeminingRequest.requester),
        selectinload(DeminingRequest.assignee),
    )


async def get_all(
    db: AsyncSession,
    current_user: User,
    limit: Optional[int] = None,
    offset: int = 0,
    status: Optional[RequestStatus] = None,
    priority: Optional[Priority] = None,
) -> List[DeminingRequest]:
    q = _q()
    if current_user.role == UserRole.civilian:
        q = q.where(DeminingRequest.requester_id == current_user.id)

    if status:
        q = q.where(DeminingRequest.status == status)
    if priority:
        q = q.where(DeminingRequest.priority == priority)

    q = q.order_by(DeminingRequest.created_at.desc())

    if limit is not None:
        q = q.limit(limit)
    q = q.offset(offset)

    r = await db.execute(q)
    return list(r.scalars().all())


async def get_by_id(db: AsyncSession, rid: int) -> Optional[DeminingRequest]:
    r = await db.execute(_q().where(DeminingRequest.id == rid))
    return r.scalar_one_or_none()


async def create(db: AsyncSession, data: RequestCreate, requester_id: int) -> DeminingRequest:
    req = DeminingRequest(**data.model_dump(), requester_id=requester_id)
    db.add(req)
    await db.commit()
    await db.refresh(req)
    return await get_by_id(db, req.id)


async def update(
    db: AsyncSession,
    req: DeminingRequest,
    data: RequestUpdate,
) -> DeminingRequest:
    changes = data.model_dump(exclude_unset=True)
    should_notify = "assigned_to_id" in changes or "status" in changes

    for k, v in changes.items():
        setattr(req, k, v)

    await db.commit()
    await db.refresh(req)
    refreshed = await get_by_id(db, req.id)

    if should_notify and refreshed:
        from app.core.telegram import notify_request_updated
        assignee_name = refreshed.assignee.full_name if refreshed.assignee else None
        await notify_request_updated(
            request_id=refreshed.id,
            title=refreshed.title,
            location_name=refreshed.location_name,
            assignee_name=assignee_name,
            status=refreshed.status.value,
        )

    return refreshed


async def set_photo(db: AsyncSession, req: DeminingRequest, photo_path: str) -> DeminingRequest:
    req.photo_path = photo_path
    await db.commit()
    await db.refresh(req)
    return await get_by_id(db, req.id)


async def delete(db: AsyncSession, req: DeminingRequest) -> None:
    await db.delete(req)
    await db.commit()


async def get_dashboard_stats(db: AsyncSession) -> dict:
    total_requests = await db.scalar(select(func.count(DeminingRequest.id))) or 0
    pending_requests = await db.scalar(
        select(func.count(DeminingRequest.id)).where(DeminingRequest.status == RequestStatus.pending)
    ) or 0
    in_progress_requests = await db.scalar(
        select(func.count(DeminingRequest.id)).where(DeminingRequest.status == RequestStatus.in_progress)
    ) or 0
    completed_requests = await db.scalar(
        select(func.count(DeminingRequest.id)).where(DeminingRequest.status == RequestStatus.completed)
    ) or 0
    critical_requests = await db.scalar(
        select(func.count(DeminingRequest.id)).where(DeminingRequest.priority == Priority.critical)
    ) or 0
    total_territories = await db.scalar(select(func.count(Territory.id))) or 0

    return {
        "total_requests": total_requests,
        "pending_requests": pending_requests,
        "in_progress_requests": in_progress_requests,
        "completed_requests": completed_requests,
        "critical_requests": critical_requests,
        "total_territories": total_territories,
    }
