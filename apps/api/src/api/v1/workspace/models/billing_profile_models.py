from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.core.database import Base

if TYPE_CHECKING:
    from .workspace_models import Workspace


class WorkspaceBillingProfile(Base):
    __tablename__ = "workspace_billing_profiles"

    id: Mapped[int] = mapped_column(primary_key=True)
    workspace_id: Mapped[int] = mapped_column(
        ForeignKey("workspaces.id", ondelete="CASCADE"), unique=True
    )

    legal_name: Mapped[str] = mapped_column(String(255))
    street: Mapped[str | None] = mapped_column(String(255), nullable=True)
    city: Mapped[str | None] = mapped_column(String(100), nullable=True)
    postal_code: Mapped[str | None] = mapped_column(String(10), nullable=True)
    country: Mapped[str] = mapped_column(String(2), default="CZ", server_default="CZ")
    ico: Mapped[str | None] = mapped_column(String(20), nullable=True)
    dic: Mapped[str | None] = mapped_column(String(20), nullable=True)
    vat_payer: Mapped[bool] = mapped_column(
        Boolean, default=False, server_default="false"
    )
    bank_account: Mapped[str | None] = mapped_column(String(34), nullable=True)
    iban: Mapped[str | None] = mapped_column(String(34), nullable=True)
    currency: Mapped[str] = mapped_column(
        String(3), default="CZK", server_default="CZK"
    )

    workspace: Mapped[Workspace] = relationship(
        back_populates="billing_profile", lazy="selectin"
    )
