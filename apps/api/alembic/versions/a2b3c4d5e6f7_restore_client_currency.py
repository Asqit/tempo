"""restore client currency for hourly rates

Revision ID: a2b3c4d5e6f7
Revises: 9a1f2c3d4e5f
Create Date: 2026-09-17

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "a2b3c4d5e6f7"
down_revision: str | Sequence[str] | None = "9a1f2c3d4e5f"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "clients",
        sa.Column(
            "currency", sa.String(length=3), server_default="CZK", nullable=False
        ),
    )
    op.alter_column("clients", "currency", server_default=None)


def downgrade() -> None:
    op.drop_column("clients", "currency")
