
"""add persistent XP and achievements

Revision ID: feab81c6b4a4
Revises: 735bffc5d58f
Create Date: 2026-11-19 15:52:13.106093
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "feab81c6b4a4"
down_revision: Union[str, Sequence[str], None] = "735bffc5d58f"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "user_achievements",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("achievement_key", sa.String(length=100), nullable=False),
        sa.Column(
            "unlocked_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "user_id",
            "achievement_key",
            name="uq_user_achievement",
        ),
    )

    op.create_index(
        op.f("ix_user_achievements_id"),
        "user_achievements",
        ["id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_user_achievements_user_id"),
        "user_achievements",
        ["user_id"],
        unique=False,
    )

    op.add_column(
        "simulation_sessions",
        sa.Column(
            "xp_awarded",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )

    op.add_column(
        "users",
        sa.Column(
            "total_xp",
            sa.Integer(),
            nullable=False,
            server_default="0",
        ),
    )

    # Keep defaults for existing records, but let the application
    # control values for newly created records.
    op.alter_column(
        "simulation_sessions",
        "xp_awarded",
        server_default=None,
    )

    op.alter_column(
        "users",
        "total_xp",
        server_default=None,
    )


def downgrade() -> None:
    op.drop_column("users", "total_xp")
    op.drop_column("simulation_sessions", "xp_awarded")

    op.drop_index(
        op.f("ix_user_achievements_user_id"),
        table_name="user_achievements",
    )

    op.drop_index(
        op.f("ix_user_achievements_id"),
        table_name="user_achievements",
    )

    op.drop_table("user_achievements")
