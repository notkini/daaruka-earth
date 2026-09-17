"""create initial database schema

Revision ID: d26be819fa65
Revises:
Create Date: 2026-09-17
"""

from collections.abc import Sequence

import geoalchemy2
import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "d26be819fa65"
down_revision: str | Sequence[str] | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Create the initial application database schema."""

    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        "ix_users_email",
        "users",
        ["email"],
        unique=True,
    )

    op.create_table(
        "projects",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("owner_id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["owner_id"],
            ["users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "sites",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("project_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column(
            "geometry",
            geoalchemy2.types.Geometry(
                geometry_type="POLYGON",
                srid=4326,
                dimension=2,
                spatial_index=False,
            ),
            nullable=False,
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["project_id"],
            ["projects.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        "ix_sites_project_id",
        "sites",
        ["project_id"],
        unique=False,
    )

    op.create_table(
        "site_analytics",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("site_id", sa.Integer(), nullable=False),
        sa.Column("recorded_date", sa.Date(), nullable=False),
        sa.Column("carbon_sequestration", sa.Float(), nullable=False),
        sa.Column("biodiversity_index", sa.Float(), nullable=False),
        sa.Column("species_count", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["site_id"],
            ["sites.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        "ix_site_analytics_site_id",
        "site_analytics",
        ["site_id"],
        unique=False,
    )


def downgrade() -> None:
    """Drop the initial application database schema."""

    op.drop_index(
        "ix_site_analytics_site_id",
        table_name="site_analytics",
    )

    op.drop_table("site_analytics")

    op.drop_index(
        "ix_sites_project_id",
        table_name="sites",
    )

    op.drop_table("sites")

    op.drop_table("projects")

    op.drop_index(
        "ix_users_email",
        table_name="users",
    )

    op.drop_table("users")
