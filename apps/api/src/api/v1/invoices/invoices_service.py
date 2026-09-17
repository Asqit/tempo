from datetime import datetime

from fastapi import HTTPException, status
from fastapi_pagination.ext.sqlalchemy import paginate
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.v1.clients.clients_models import Client
from src.api.v1.invoices.invoices_misc import InvoiceStatus
from src.api.v1.invoices.models.issued_invoice import IssuedInvoice
from src.api.v1.invoices.models.issued_invoice_item import IssuedInvoiceItem
from src.api.v1.invoices.models.number_series import NumberSeries
from src.api.v1.invoices.schemas.issued_invoice import IssuedInvoiceCreate
from src.api.v1.workspace.models.member_models import WorkspaceMember
from src.api.v1.workspace.models.workspace_models import Workspace


class InvoiceService:
    @staticmethod
    async def __get_next_number(
        db: AsyncSession,
        series_id: int,
        workspace_id: int,
        issued_date: datetime,
    ) -> str:
        result = await db.execute(
            update(NumberSeries)
            .where(
                NumberSeries.id == series_id,
                NumberSeries.workspace_id == workspace_id,
            )
            .values(counter=NumberSeries.counter + 1)
            .returning(NumberSeries.counter, NumberSeries.format_template)
        )

        row = result.one_or_none()
        if row is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Číselná řada nebyla nalezena v tomto workspace.",
            )

        counter, format_template = row
        return format_template.format(year=issued_date.year, counter=counter)

    @staticmethod
    async def __get_or_create_default_series(
        db: AsyncSession, workspace_id: int
    ) -> NumberSeries:
        series = await db.scalar(
            select(NumberSeries)
            .where(NumberSeries.workspace_id == workspace_id)
            .order_by(NumberSeries.id)
        )
        if series is not None:
            return series

        series = NumberSeries(workspace_id=workspace_id)
        db.add(series)
        await db.flush()
        return series

    @staticmethod
    async def get_next_number_preview(
        db: AsyncSession, member: WorkspaceMember, issued_date: datetime
    ) -> dict[str, int | str | None | bool]:
        series = await db.scalar(
            select(NumberSeries)
            .where(NumberSeries.workspace_id == member.workspace_id)
            .order_by(NumberSeries.id)
        )
        if series is None:
            return {
                "number_series_id": None,
                "document_number": f"TEMPO-{issued_date.year}-0001",
                "reserved": False,
            }

        return {
            "number_series_id": series.id,
            "document_number": series.format_template.format(
                year=issued_date.year,
                counter=series.counter + 1,
            ),
            "reserved": False,
        }

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
        series = (
            await db.get(NumberSeries, body.number_series_id)
            if body.number_series_id is not None
            else await InvoiceService.__get_or_create_default_series(
                db, member.workspace_id
            )
        )
        if series is None or series.workspace_id != member.workspace_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Číselná řada nebyla nalezena v tomto workspace.",
            )

        document_number = await InvoiceService.__get_next_number(
            db, series.id, member.workspace_id, body.date_issue
        )

        client = await db.scalar(
            select(Client).where(
                Client.id == body.client_id,
                Client.workspace_id == member.workspace_id,
            )
        )
        workspace = await db.get(Workspace, member.workspace_id)
        if client is None or workspace is None or workspace.billing_profile is None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Workspace musí mít fakturační profil a klient musí patřit do workspace.",
            )

        billing = workspace.billing_profile

        invoice = IssuedInvoice(
            workspace_id=member.workspace_id,
            client_id=body.client_id,
            number_series_id=series.id,
            document_number=document_number,
            date_issue=body.date_issue,
            date_taxing=body.date_taxing,
            date_maturity=body.date_maturity,
            issuer_snapshot={
                "legal_name": billing.legal_name,
                "street": billing.street,
                "city": billing.city,
                "postal_code": billing.postal_code,
                "country": billing.country,
                "ico": billing.ico,
                "dic": billing.dic,
                "vat_payer": billing.vat_payer,
            },
            client_snapshot={
                "name": client.name,
                "is_company": client.is_company,
                "street": client.street,
                "city": client.city,
                "postal_code": client.postal_code,
                "country": client.country,
                "ico": client.ico,
                "dic": client.dic,
                "vat_payer": client.vat_payer,
            },
            payment_snapshot={
                "bank_account": billing.bank_account,
                "iban": billing.iban,
                "currency": billing.currency,
            },
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
