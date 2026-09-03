from datetime import datetime

from fastapi import HTTPException, status
from fastapi_pagination.ext.sqlalchemy import paginate
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.v1.invoices.invoices_misc import InvoiceStatus
from src.api.v1.invoices.models.issued_invoice import IssuedInvoice
from src.api.v1.invoices.models.issued_invoice_item import IssuedInvoiceItem
from src.api.v1.invoices.models.number_series import NumberSeries
from src.api.v1.invoices.schemas.issued_invoice import IssuedInvoiceCreate
from src.api.v1.workspace.workspace_members_models import WorkspaceMember


class InvoiceService:
    @staticmethod
    async def __get_next_number(
        db: AsyncSession, series_id: int, issued_date: datetime
    ) -> str:
        result = await db.execute(
            update(NumberSeries)
            .where(NumberSeries.id == series_id)
            .values(counter=NumberSeries.counter + 1)
            .returning(NumberSeries.counter, NumberSeries.format_template)
        )

        counter, format_template = result.one()
        return format_template.format(year=issued_date.year, counter=counter)

    # -------------------------------------------------------------- LIST INVOICES
    @staticmethod
    async def list_invoices(db: AsyncSession, member: WorkspaceMember):
        return await paginate(
            db,
            select(IssuedInvoice).where(
                IssuedInvoice.workspace_id == member.workspace_id
            ),
        )

    # -------------------------------------------------------------- GET SINGLE INVOICE
    @staticmethod
    async def get_single_invoice(
        db: AsyncSession, member: WorkspaceMember, invoice_id: int
    ):
        invoice = await db.get(IssuedInvoice, invoice_id)
        if invoice is None or invoice.workspace_id != member.workspace_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

        return invoice

    # -------------------------------------------------------------- CREATE INVOICE
    @staticmethod
    async def create_invoice(
        db: AsyncSession, member: WorkspaceMember, body: IssuedInvoiceCreate
    ):
        invoice = IssuedInvoice(
            workspace_id=member.workspace_id,
            client_id=body.client_id,
            number_series_id=body.number_series_id,  # | None
            date_issue=body.date_issue,
            date_taxing=body.date_taxing,
            date_maturity=body.date_maturity,
            items=[
                IssuedInvoiceItem(
                    name=item.name,
                    unit_price=item.unit_price,
                    amount=item.amount,
                    vat_rate=item.vat_rate,
                )
                for item in body.items
            ],
        )

        db.add(invoice)
        await db.commit()
        await db.refresh(invoice)
        return invoice

    # -------------------------------------------------------------- UPDATE INVOICE
    @staticmethod
    async def update_invoice(
        db: AsyncSession,
        member: WorkspaceMember,
        invoice_id: int,
        body: IssuedInvoiceCreate,
    ):
        invoice = await InvoiceService.get_single_invoice(db, member, invoice_id)

        if invoice.status != InvoiceStatus.DRAFT:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Vystavenou fakturu nelze upravovat, pouze stornovat.",
            )

        invoice.client_id = body.client_id
        invoice.date_issue = body.date_issue
        invoice.date_taxing = body.date_taxing
        invoice.date_maturity = body.date_maturity

        invoice.items.clear()
        invoice.items.extend(
            IssuedInvoiceItem(
                name=item.name,
                unit_price=item.unit_price,
                amount=item.amount,
                vat_rate=item.vat_rate,
            )
            for item in body.items
        )

        await db.commit()
        await db.refresh(invoice)
        return invoice
