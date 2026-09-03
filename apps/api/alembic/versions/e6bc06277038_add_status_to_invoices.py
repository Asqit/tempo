"""add status to invoices

Revision ID: e6bc06277038
Revises: a7fbeeb57397
Create Date: 2026-09-01 20:53:26.442347

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "e6bc06277038"
down_revision: str | Sequence[str] | None = "a7fbeeb57397"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

invoice_status = sa.Enum("draft", "issued", "paid", "cancelled", name="invoicestatus")


def upgrade() -> None:
    """Upgrade schema."""
    invoice_status.create(op.get_bind(), checkfirst=True)
    op.add_column(
        "issued_invoices",
        sa.Column(
            "status",
            invoice_status,
            server_default="draft",
            nullable=False,
        ),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("issued_invoices", "status")
    invoice_status.drop(op.get_bind(), checkfirst=True)
