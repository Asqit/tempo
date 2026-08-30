from __future__ import annotations

from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from src.api.v1.invoices.models.issued_invoice import IssuedInvoice
from src.core.database import Base


class IssuedInvoiceItem(Base):
    __tablename__ = "issued_invoice_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    invoice_id: Mapped[int] = mapped_column(
        ForeignKey("issued_invoices.id", ondelete="CASCADE")
    )

    name: Mapped[str] = mapped_column(String(255))
    unit_price: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=1)
    vat_rate: Mapped[Decimal] = mapped_column(Numeric(4, 2), default=21)
    invoice: Mapped[IssuedInvoice] = relationship(
        back_populates="items", lazy="selectin"
    )
