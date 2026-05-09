import asyncio
import random
from faker import Faker
from sqlalchemy.ext.asyncio import AsyncSession
from passlib.context import CryptContext

# Import required models
from app.db.database import AsyncSessionLocal as SessionLocal, engine, Base
from app.models.user import User, UserRole
from app.models.territory import Territory, TerritoryStatus
from app.models.request import DeminingRequest, RequestStatus, Priority, ExplosiveType, RequestStatusHistory

# Init Faker (with Ukrainian locale for realistic data)
fake = Faker("uk_UA")

# Password hashing setup (to match standard bcrypt setup)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

# Define bounds for Ukrainian coordinates (approximate bounding box)
UKRAINE_LAT_MIN = 44.38
UKRAINE_LAT_MAX = 52.37
UKRAINE_LON_MIN = 22.13
UKRAINE_LON_MAX = 40.22

def generate_ukraine_coords():
    """Generate random coordinates within Ukraine."""
    lat = random.uniform(UKRAINE_LAT_MIN, UKRAINE_LAT_MAX)
    lon = random.uniform(UKRAINE_LON_MIN, UKRAINE_LON_MAX)
    return lat, lon

async def clear_database(db: AsyncSession):
    """Drops all tables and recreates them to ensure a clean slate."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

async def seed_data():
    async with SessionLocal() as db:
        print("Clearing and recreating database schema...")
        await clear_database(db)

        print("Seeding Users...")
        # Create standard accounts to log in with
        users_to_create = [
            User(
                email="civilian@example.com",
                full_name="Іван Громадянин",
                hashed_password=hash_password("password123"),
                role=UserRole.civilian,
                is_active=True
            ),
            User(
                email="operator@example.com",
                full_name="Олена Оператор",
                hashed_password=hash_password("password123"),
                role=UserRole.operator,
                is_active=True
            ),
            User(
                email="coordinator@example.com",
                full_name="Петро Координатор",
                hashed_password=hash_password("password123"),
                role=UserRole.coordinator,
                is_active=True
            ),
            User(
                email="admin@example.com",
                full_name="Анна Адмін",
                hashed_password=hash_password("password123"),
                role=UserRole.admin,
                is_active=True
            )
        ]

        # Add random civilians
        for _ in range(15):
            users_to_create.append(
                User(
                    email=fake.unique.email(),
                    full_name=fake.name(),
                    hashed_password=hash_password("password123"),
                    role=UserRole.civilian,
                    is_active=True
                )
            )

        # Add random operators
        for _ in range(5):
            users_to_create.append(
                User(
                    email=fake.unique.email(),
                    full_name=fake.name(),
                    hashed_password=hash_password("password123"),
                    role=UserRole.operator,
                    is_active=True
                )
            )

        db.add_all(users_to_create)
        await db.commit()

        # Fetch users back to get IDs
        from sqlalchemy import select
        all_users = (await db.execute(select(User))).scalars().all()
        civilians = [u for u in all_users if u.role == UserRole.civilian]
        staff = [u for u in all_users if u.role in (UserRole.operator, UserRole.coordinator, UserRole.admin)]

        print("Seeding Territories...")
        territory_statuses = list(TerritoryStatus)
        for _ in range(30):
            lat, lon = generate_ukraine_coords()
            t = Territory(
                name=f"Зона {fake.city()}",
                description=fake.text(max_nb_chars=200),
                status=random.choice(territory_statuses),
                latitude=lat,
                longitude=lon,
                area_km2=round(random.uniform(1.0, 50.0), 2),
                location=f"SRID=4326;POINT({lon} {lat})"
            )
            db.add(t)
        await db.commit()

        print("Seeding Demining Requests...")
        request_statuses = list(RequestStatus)
        priorities = list(Priority)
        explosive_types = list(ExplosiveType)

        for _ in range(150):
            lat, lon = generate_ukraine_coords()
            requester = random.choice(civilians)
            status = random.choice(request_statuses)

            # If status is not pending, it might be assigned
            assignee = None
            if status != RequestStatus.pending and random.random() > 0.3:
                assignee = random.choice(staff)

            req = DeminingRequest(
                title=fake.sentence(nb_words=5),
                description=fake.text(max_nb_chars=300),
                status=status,
                priority=random.choice(priorities),
                explosive_type=random.choice(explosive_types),
                location_name=fake.address(),
                latitude=lat,
                longitude=lon,
                location=f"SRID=4326;POINT({lon} {lat})",
                requester_id=requester.id,
                assigned_to_id=assignee.id if assignee else None
            )
            db.add(req)

        await db.commit()
        print("Database seeding completed successfully!")
        print("You can log in using any of the following accounts with password: 'password123'")
        print(" - civilian@example.com")
        print(" - operator@example.com")
        print(" - coordinator@example.com")
        print(" - admin@example.com")

if __name__ == "__main__":
    asyncio.run(seed_data())
