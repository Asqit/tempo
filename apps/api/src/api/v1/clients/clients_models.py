from __future__ import annotations

from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Numeric, String, UniqueConstraint
from sqlalchemy.orm import mapped_column, relationship
from sqlalchemy.orm.base import Mapped

if TYPE_CHECKING:
    from src.api.v1.projects.projects_models import Project
    from src.api.v1.time_entries.time_entires_models import TimeEntry
    from src.api.v1.workspace.workspace_models import Workspace

from src.core.database import Base


class Client(Base):
    __tablename__ = "clients"
    __table_args__ = (UniqueConstraint("workspace_id", "name"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    is_company: Mapped[bool] = mapped_column(default=True, server_default="true")

    # Adresa
    street: Mapped[str | None] = mapped_column(String(255), nullable=True)
    city: Mapped[str | None] = mapped_column(String(100), nullable=True)
    postal_code: Mapped[str | None] = mapped_column(String(10), nullable=True)
    country: Mapped[str | None] = mapped_column(
        String(2), nullable=True
    )  # ISO 3166-1 alpha-2

    # IČO, DIČ
    ico: Mapped[str | None] = mapped_column(String(20), nullable=True)
    dic: Mapped[str | None] = mapped_column(String(20), nullable=True)
    vat_payer: Mapped[bool] = mapped_column(default=False, server_default="false")

    # Banka + měna
    bank_account: Mapped[str | None] = mapped_column(String(34), nullable=True)
    iban: Mapped[str | None] = mapped_column(String(34), nullable=True)
    currency: Mapped[str] = mapped_column(
        String(3), default="CZK", server_default="CZK"
    )

    # Sleva
    discount_percentage: Mapped[Decimal | None] = mapped_column(
        Numeric(4, 2), nullable=True
    )

    hourly_rate: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)

    # belong to a workspace (DB-level ON DELETE CASCADE)
    workspace_id: Mapped[int] = mapped_column(
        ForeignKey("workspaces.id", ondelete="CASCADE")
    )
    workspace: Mapped[Workspace] = relationship(
        back_populates="clients", lazy="selectin"
    )

    # project-not-assigned entries (think temporary)
    time_entries: Mapped[list[TimeEntry]] = relationship(
        back_populates="client",
        lazy="selectin",
        passive_deletes=True,
    )
    projects: Mapped[list[Project]] = relationship(
        back_populates="client",
        lazy="selectin",
        # DB-level ON DELETE CASCADE is used on Project.client_id; keep passive_deletes
        passive_deletes=True,
    )
