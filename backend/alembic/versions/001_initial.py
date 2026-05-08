"""initial schema

Revision ID: 001
Revises:
Create Date: 2026-01-01
"""
from alembic import op
import sqlalchemy as sa

revision = "001"
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.execute("CREATE TYPE userrole AS ENUM ('civilian','operator','coordinator','admin')")
    op.execute("CREATE TYPE territorystatus AS ENUM ('contaminated','under_survey','partially_cleared','cleared')")
    op.execute("CREATE TYPE requeststatus AS ENUM ('pending','under_review','approved','in_progress','completed','rejected')")
    op.execute("CREATE TYPE priority AS ENUM ('low','medium','high','critical')")
    op.create_table("users",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("email", sa.String(255), unique=True, nullable=False),
        sa.Column("full_name", sa.String(255), nullable=False),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("role", sa.Enum("civilian","operator","coordinator","admin", name="userrole"), nullable=False, server_default="civilian"),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default="true"),
    )
    op.create_table("territories",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("description", sa.Text),
        sa.Column("status", sa.Enum("contaminated","under_survey","partially_cleared","cleared", name="territorystatus"), nullable=False, server_default="contaminated"),
        sa.Column("latitude", sa.Float, nullable=False),
        sa.Column("longitude", sa.Float, nullable=False),
        sa.Column("area_km2", sa.Float),
    )
    op.create_table("demining_requests",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.Text),
        sa.Column("status", sa.Enum("pending","under_review","approved","in_progress","completed","rejected", name="requeststatus"), nullable=False, server_default="pending"),
        sa.Column("priority", sa.Enum("low","medium","high","critical", name="priority"), nullable=False, server_default="medium"),
        sa.Column("location_name", sa.String(255), nullable=False),
        sa.Column("latitude", sa.Float, nullable=False),
        sa.Column("longitude", sa.Float, nullable=False),
        sa.Column("requester_id", sa.Integer, sa.ForeignKey("users.id"), nullable=False),
        sa.Column("assigned_to_id", sa.Integer, sa.ForeignKey("users.id")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

def downgrade():
    op.drop_table("demining_requests")
    op.drop_table("territories")
    op.drop_table("users")
    for t in ("priority","requeststatus","territorystatus","userrole"):
        op.execute(f"DROP TYPE IF EXISTS {t}")
