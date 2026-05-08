from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.request import RequestStatus, Priority
from app.schemas.user import UserOut


class RequestCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: Priority = Priority.medium
    location_name: str
    latitude: float
    longitude: float


class RequestUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[RequestStatus] = None
    priority: Optional[Priority] = None
    assigned_to_id: Optional[int] = None


class RequestOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    status: RequestStatus
    priority: Priority
    location_name: str
    latitude: float
    longitude: float
    photo_path: Optional[str] = None
    requester_id: int
    assigned_to_id: Optional[int]
    created_at: datetime
    updated_at: datetime
    requester: Optional[UserOut] = None
    assignee: Optional[UserOut] = None

    model_config = {"from_attributes": True}


class DashboardStatsOut(BaseModel):
    total_requests: int
    pending_requests: int
    in_progress_requests: int
    completed_requests: int
    critical_requests: int
    total_territories: int
