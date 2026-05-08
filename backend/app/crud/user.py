from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
from app.schemas.user import UserCreate
from app.core.security import hash_password
from typing import Optional, List

async def get_by_email(db: AsyncSession, email: str) -> Optional[User]:
    r = await db.execute(select(User).where(User.email == email))
    return r.scalar_one_or_none()

async def get_by_id(db: AsyncSession, user_id: int) -> Optional[User]:
    r = await db.execute(select(User).where(User.id == user_id))
    return r.scalar_one_or_none()

async def get_all(db: AsyncSession) -> List[User]:
    r = await db.execute(select(User).where(User.is_active == True))
    return list(r.scalars().all())

async def create(db: AsyncSession, data: UserCreate) -> User:
    user = User(email=data.email, full_name=data.full_name,
                hashed_password=hash_password(data.password), role=data.role)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user
