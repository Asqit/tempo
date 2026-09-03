from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi_pagination import Page
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.v1.invoices.invoices_service import InvoiceService
from src.api.v1.invoices.schemas.issued_invoice import (
    IssuedInvoiceCreate,
    IssuedInvoiceRead,
)
from src.api.v1.workspace.models.member_models import WorkspaceMember
from src.api.v1.workspace.schemas.member_schemas import WorkspaceRole
from src.api.v1.workspace.workspace_utils import require_role
from src.core.database import get_db

router = APIRouter(prefix="/invoices", tags=["Invoices"])


@router.get("", response_model=Page[IssuedInvoiceRead])
async def list_invoices(
    db: Annotated[AsyncSession, Depends(get_db)],
    member: Annotated[WorkspaceMember, Depends(require_role(WorkspaceRole.MEMBER))],
):
    return await InvoiceService.list_invoices(db, member)


@router.get("/{invoice_id}", response_model=IssuedInvoiceRead)
async def get_invoice(
    invoice_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    member: Annotated[WorkspaceMember, Depends(require_role(WorkspaceRole.MEMBER))],
):
    return await InvoiceService.get_single_invoice(db, member, invoice_id)


@router.post("", response_model=IssuedInvoiceRead)
async def create_invoice(
    body: IssuedInvoiceCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    member: Annotated[WorkspaceMember, Depends(require_role(WorkspaceRole.ADMIN))],
):
    return await InvoiceService.create_invoice()


@router.put("{invoice_id}", response_model=IssuedInvoiceRead)
async def update_invoice(
    invoice_id: int,
    body: IssuedInvoiceCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    member: Annotated[WorkspaceMember, Depends(require_role(WorkspaceRole.ADMIN))],
):
    return await InvoiceService.update_invoice(db, member, invoice_id, body)
