"""add photo_path to demining_requests

Revision ID: 002
Revises: 001
Create Date: 2026-05-05
"""
from alembic import op
import sqlalchemy as sa

revision = "002"
down_revision = "001"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "demining_requests",
        sa.Column("photo_path", sa.String(512), nullable=True),
    )


def downgrade():
    op.drop_column("demining_requests", "photo_path")
