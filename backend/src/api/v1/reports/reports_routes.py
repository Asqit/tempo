from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi_pagination import Page
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.status import HTTP_204_NO_CONTENT

from src.api.v1.reports.reports_schemas import CreateReport, ReportRead
from src.api.v1.reports.reports_service import ReportsService
from src.api.v1.time_entries.time_entries_schemas import TimeEntryRead
from src.api.v1.workspace.workspace_models import Workspace
from src.api.v1.workspace.workspace_utils import get_current_workspace
from src.core.database import get_db

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/", response_model=Page[ReportRead])
async def get_static_reports(
    db: Annotated[AsyncSession, Depends(get_db)],
    workspace: Annotated[Workspace, Depends(get_current_workspace)],
    client_id: int | None = None,
    project_id: int | None = None,
    query: str | None = None,
):
    return await ReportsService.get_static_reports(
        db, workspace, client_id, project_id, query
    )


@router.get("/live", response_model=list[TimeEntryRead])
async def get_live_report(
    period_start: datetime,
    period_end: datetime,
    db: Annotated[AsyncSession, Depends(get_db)],
    workspace: Annotated[Workspace, Depends(get_current_workspace)],
    client_id: int | None = None,
    project_id: int | None = None,
    billable: bool | None = None,
):
    return await ReportsService.get_live_report(
        db, workspace, period_start, period_end, client_id, project_id, billable
    )


@router.get("/{id}", response_model=ReportRead)
async def get_single_static_report(
    id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    workspace: Annotated[Workspace, Depends(get_current_workspace)],
):
    return await ReportsService.get_single_static_report(db, workspace, id)


@router.post("/")
async def save_live_report(
    body: CreateReport,
    db: Annotated[AsyncSession, Depends(get_db)],
    workspace: Annotated[Workspace, Depends(get_current_workspace)],
):
    return await ReportsService.save_live_report(db, workspace, body)


@router.put("/{id}/share", response_model=ReportRead)
async def share_static_report(
    id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    workspace: Annotated[Workspace, Depends(get_current_workspace)],
):
    return await ReportsService.share_static_report(db, workspace, id)


@router.delete("/{id}", status_code=HTTP_204_NO_CONTENT)
async def delete_static_report(
    id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    workspace: Annotated[Workspace, Depends(get_current_workspace)],
):
    _ = await ReportsService.delete_static_report(db, workspace, id)
