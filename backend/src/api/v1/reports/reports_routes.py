from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.v1.reports.reports_service import ReportsService
from src.api.v1.time_entries.time_entries_schemas import TimeEntryRead
from src.api.v1.workspace.workspace_models import Workspace
from src.api.v1.workspace.workspace_utils import get_current_workspace
from src.core.database import get_db

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/", response_model=list[TimeEntryRead])
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
