"""add workspace notification types

Revision ID: 9f2a7c1d4e6b
Revises: 853c9ca54636
Create Date: 2026-08-27 16:30:00.000000
"""

from typing import Sequence, Union

from alembic import op


revision: str = "9f2a7c1d4e6b"
down_revision: Union[str, Sequence[str], None] = "853c9ca54636"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    for value in (
        "WORKSPACE_INVITE_ACCEPTED",
        "WORKSPACE_ROLE_CHANGED",
        "WORKSPACE_LEFT",
    ):
        op.execute(
            f"ALTER TYPE notificationtype ADD VALUE IF NOT EXISTS '{value}'"
        )


def downgrade() -> None:
    # PostgreSQL does not support removing individual enum values safely.
    pass
