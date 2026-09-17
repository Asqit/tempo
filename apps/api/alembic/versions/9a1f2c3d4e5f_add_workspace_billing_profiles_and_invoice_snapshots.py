"""add workspace billing profiles and invoice snapshots

Revision ID: 9a1f2c3d4e5f
Revises: e6bc06277038
Create Date: 2026-09-17

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "9a1f2c3d4e5f"
down_revision: str | Sequence[str] | None = "e6bc06277038"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "workspace_billing_profiles",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("workspace_id", sa.Integer(), nullable=False),
        sa.Column("legal_name", sa.String(length=255), nullable=False),
        sa.Column("street", sa.String(length=255), nullable=True),
        sa.Column("city", sa.String(length=100), nullable=True),
        sa.Column("postal_code", sa.String(length=10), nullable=True),
        sa.Column("country", sa.String(length=2), server_default="CZ", nullable=False),
        sa.Column("ico", sa.String(length=20), nullable=True),
        sa.Column("dic", sa.String(length=20), nullable=True),
        sa.Column("vat_payer", sa.Boolean(), server_default=sa.false(), nullable=False),
        sa.Column("bank_account", sa.String(length=34), nullable=True),
        sa.Column("iban", sa.String(length=34), nullable=True),
        sa.Column(
            "currency", sa.String(length=3), server_default="CZK", nullable=False
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["workspace_id"], ["workspaces.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("workspace_id"),
    )

    op.drop_column("clients", "bank_account")
    op.drop_column("clients", "iban")

    op.add_column(
        "issued_invoices", sa.Column("issuer_snapshot", sa.JSON(), nullable=True)
    )
    op.add_column(
        "issued_invoices", sa.Column("client_snapshot", sa.JSON(), nullable=True)
    )
    op.add_column(
        "issued_invoices", sa.Column("payment_snapshot", sa.JSON(), nullable=True)
    )


def downgrade() -> None:
    op.drop_column("issued_invoices", "payment_snapshot")
    op.drop_column("issued_invoices", "client_snapshot")
    op.drop_column("issued_invoices", "issuer_snapshot")

    op.add_column("clients", sa.Column("iban", sa.String(length=34), nullable=True))
    op.add_column(
        "clients", sa.Column("bank_account", sa.String(length=34), nullable=True)
    )

    op.drop_table("workspace_billing_profiles")
