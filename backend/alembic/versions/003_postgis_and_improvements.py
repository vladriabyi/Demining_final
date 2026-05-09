"""003 — PostGIS extension + explosive_type + status_history + spatial index

Revision ID: 003
Revises: 002
Create Date: 2025-05-09
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "003"
down_revision = "002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. Активуємо розширення PostGIS (потребує postgis/postgis Docker-образу)
    op.execute("CREATE EXTENSION IF NOT EXISTS postgis;")

    # 2. Додаємо ENUM для типу ВНП
    explosive_type_enum = postgresql.ENUM(
        "antipersonnel_mine",
        "antitank_mine",
        "cluster_munition",
        "ied",
        "unexploded_ordnance",
        "unknown",
        name="explosivetype",
    )
    explosive_type_enum.create(op.get_bind(), checkfirst=True)

    # 3. Додаємо поле explosive_type до заявок
    op.add_column(
        "demining_requests",
        sa.Column(
            "explosive_type",
            sa.Enum(
                "antipersonnel_mine", "antitank_mine", "cluster_munition",
                "ied", "unexploded_ordnance", "unknown",
                name="explosivetype",
            ),
            nullable=False,
            server_default="unknown",
            comment="Тип ВНП за класифікацією IMAS (підрозділ 1.1.1)",
        ),
    )

    # 4. Додаємо geometry-колонку POINT (WGS-84) до заявок
    op.add_column(
        "demining_requests",
        sa.Column(
            "location",
            sa.NullType(),   # GeoAlchemy2 керує типом через raw DDL
            nullable=True,
            comment="PostGIS POINT у WGS-84. Обчислюється з latitude/longitude.",
        ),
    )
    op.execute(
        "ALTER TABLE demining_requests "
        "ALTER COLUMN location TYPE geometry(Point, 4326) "
        "USING NULL"
    )

    # 5. Заповнюємо location для існуючих рядків
    op.execute("""
        UPDATE demining_requests
        SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
        WHERE latitude IS NOT NULL AND longitude IS NOT NULL
    """)

    # 6. Просторовий індекс GIST на location (для швидкого ST_DWithin)
    op.create_index(
        "idx_requests_location_gist",
        "demining_requests",
        ["location"],
        postgresql_using="gist",
    )

    # 7. Додаємо geometry-колонку до territories
    op.add_column(
        "territories",
        sa.Column("location", sa.NullType(), nullable=True),
    )
    op.execute(
        "ALTER TABLE territories "
        "ALTER COLUMN location TYPE geometry(Point, 4326) "
        "USING NULL"
    )
    op.execute("""
        UPDATE territories
        SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
        WHERE latitude IS NOT NULL AND longitude IS NOT NULL
    """)
    op.create_index(
        "idx_territories_location_gist",
        "territories",
        ["location"],
        postgresql_using="gist",
    )

    # 8. Таблиця журналу змін статусів (audit log)
    op.create_table(
        "request_status_history",
        sa.Column("id",         sa.Integer,     primary_key=True),
        sa.Column("request_id", sa.Integer,     sa.ForeignKey("demining_requests.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("old_status", sa.String(50),  nullable=False),
        sa.Column("new_status", sa.String(50),  nullable=False),
        sa.Column("changed_by", sa.Integer,     sa.ForeignKey("users.id"), nullable=False),
        sa.Column("comment",    sa.String(512), nullable=True),
        sa.Column("changed_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("request_status_history")
    op.drop_index("idx_territories_location_gist", table_name="territories")
    op.drop_column("territories", "location")
    op.drop_index("idx_requests_location_gist", table_name="demining_requests")
    op.drop_column("demining_requests", "location")
    op.drop_column("demining_requests", "explosive_type")
    op.execute("DROP TYPE IF EXISTS explosivetype;")
    op.execute("DROP EXTENSION IF EXISTS postgis;")
