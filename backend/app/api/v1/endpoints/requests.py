import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.db.database import get_db
from app.schemas.request import (
    RequestCreate,
    RequestUpdate,
    RequestOut,
    DashboardStatsOut,
)
from app.crud import request as crud
from app.api.v1.dependencies import get_current_user
from app.models.user import User, UserRole

router = APIRouter(prefix="/requests", tags=["requests"])

UPLOAD_DIR = "/app/uploads"
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


def _is_staff(user: User) -> bool:
    return user.role in (UserRole.coordinator, UserRole.admin, UserRole.operator)


@router.get("/", response_model=List[RequestOut])
async def list_requests(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await crud.get_all(db, current_user)


@router.get("/stats", response_model=DashboardStatsOut)
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return await crud.get_dashboard_stats(db)


@router.get("/{rid}", response_model=RequestOut)
async def get_request(
    rid: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    req = await crud.get_by_id(db, rid)
    if not req:
        raise HTTPException(404, "Not found")
    if not _is_staff(current_user) and req.requester_id != current_user.id:
        raise HTTPException(403, "Forbidden")
    return req


@router.post("/", response_model=RequestOut, status_code=201)
async def create_request(
    data: RequestCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await crud.create(db, data, current_user.id)


@router.patch("/{rid}", response_model=RequestOut)
async def update_request(
    rid: int,
    data: RequestUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    req = await crud.get_by_id(db, rid)
    if not req:
        raise HTTPException(404, "Not found")
    if not _is_staff(current_user) and req.requester_id != current_user.id:
        raise HTTPException(403, "Forbidden")
    if not _is_staff(current_user) and req.status.value != "pending":
        raise HTTPException(403, "Cannot edit non-pending request")
    return await crud.update(db, req, data)


@router.post("/{rid}/photo", response_model=RequestOut)
async def upload_photo(
    rid: int,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    req = await crud.get_by_id(db, rid)
    if not req:
        raise HTTPException(404, "Not found")
    if not _is_staff(current_user) and req.requester_id != current_user.id:
        raise HTTPException(403, "Forbidden")

    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(400, "Only JPEG and PNG images are allowed")

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(400, "File too large. Maximum size is 5 MB")

    ext = "jpg" if file.content_type == "image/jpeg" else "png"
    filename = f"{uuid.uuid4().hex}.{ext}"

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(UPLOAD_DIR, filename)
    with open(file_path, "wb") as f:
        f.write(contents)

    return await crud.set_photo(db, req, filename)


@router.delete("/{rid}", status_code=204)
async def delete_request(
    rid: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    req = await crud.get_by_id(db, rid)
    if not req:
        raise HTTPException(404, "Not found")
    if not _is_staff(current_user) and req.requester_id != current_user.id:
        raise HTTPException(403, "Forbidden")
    await crud.delete(db, req)
