from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.api.v1.invoices.models.issued_invoice_item import IssuedInvoiceItem
from src.core.database import Base


class IssuedInvoice(Base):
    __tablename__ = "issued_invoices"
    __table_args__ = (
        UniqueConstraint(
            "workspace_id",
            "document_number",
            name="uq_issued_invoice_workspace_document_number",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)

    workspace_id: Mapped[int] = mapped_column(
        ForeignKey("workspaces.id", ondelete="CASCADE"),
        unique=True,
    )

    client_id: Mapped[int] = mapped_column(
        ForeignKey("clients.id", ondelete="RESTRICT")
    )

    number_series_id: Mapped[int] = mapped_column(
        ForeignKey("number_series.id", ondelete="RESTRICT")
    )

    document_number: Mapped[str] = mapped_column(String(50))

    date_issue: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    date_taxing: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    date_maturity: Mapped[datetime] = mapped_column(DateTime(timezone=True))

    items: Mapped[IssuedInvoiceItem] = relationship(
        back_populates="invoice", lazy="selectin", passive_deletes=True
    )
