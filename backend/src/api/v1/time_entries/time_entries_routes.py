from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, status
from fastapi_pagination import Page
from sqlalchemy.ext.asyncio.session import AsyncSession

from src.api.v1.time_entries.time_entries_schemas import (
    TimeEntryBulkDelete,
    TimeEntryCreate,
    TimeEntryRead,
    TimeEntrySummary,
    TimeEntryUpdate,
)
from src.api.v1.time_entries.time_entries_service import TimeEntryService
from src.api.v1.workspace.workspace_members_helpers import require_role
from src.api.v1.workspace.workspace_members_models import WorkspaceMember
from src.api.v1.workspace.workspace_members_schemas import WorkspaceRole
from src.api.v1.workspace.workspace_models import Workspace
from src.api.v1.workspace.workspace_utils import get_current_workspace
from src.core.database import get_db

router = APIRouter(prefix="/time-entries", tags=["TimeEntries"])


@router.get("/", response_model=Page[TimeEntryRead], tags=["mcp"])
async def get_all_time_entries(
    db: Annotated[AsyncSession, Depends(get_db)],
    workspace: Annotated[Workspace, Depends(get_current_workspace)],
    _role: Annotated[WorkspaceMember, Depends(require_role(WorkspaceRole.MEMBER))],
    project_id: int | None = None,
    start_time: datetime | None = None,
    end_time: datetime | None = None,
    billable: bool | None = None,
):
    return await TimeEntryService.get_all_time_entries(
        db, workspace, project_id, start_time, end_time, billable
    )


@router.get("/calendar", response_model=list[TimeEntrySummary], tags=["mcp"])
async def get_calendar_entries(
    start_time: datetime,
    end_time: datetime,
    db: Annotated[AsyncSession, Depends(get_db)],
    _role: Annotated[WorkspaceMember, Depends(require_role(WorkspaceRole.MEMBER))],
    workspace: Annotated[Workspace, Depends(get_current_workspace)],
):
    return await TimeEntryService.get_calendar_entries(
        db, workspace, start_time, end_time
    )


@router.get("/last", response_model=TimeEntryRead, tags=["mcp"])
async def get_last_entry(
    db: Annotated[AsyncSession, Depends(get_db)],
    _role: Annotated[WorkspaceMember, Depends(require_role(WorkspaceRole.MEMBER))],
    workspace: Annotated[Workspace, Depends(get_current_workspace)],
):
    return await TimeEntryService.get_last_entry(db, workspace)


@router.get("/{id}", response_model=TimeEntryRead, tags=["mcp"])
async def get_time_entry(
    id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    _role: Annotated[WorkspaceMember, Depends(require_role(WorkspaceRole.MEMBER))],
    workspace: Annotated[Workspace, Depends(get_current_workspace)],
):
    return await TimeEntryService.get_time_entry(db, workspace, id)


@router.post(
    "/", status_code=status.HTTP_201_CREATED, response_model=TimeEntryRead, tags=["mcp"]
)
async def create_time_entry(
    payload: TimeEntryCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    _role: Annotated[WorkspaceMember, Depends(require_role(WorkspaceRole.MEMBER))],
    workspace: Annotated[Workspace, Depends(get_current_workspace)],
):
    return await TimeEntryService.create_time_entry(db, workspace, payload)


@router.put("/{id}", response_model=TimeEntryRead, tags=["mcp"])
async def update_time_entry(
    id: int,
    payload: TimeEntryUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    _role: Annotated[WorkspaceMember, Depends(require_role(WorkspaceRole.MEMBER))],
    workspace: Annotated[Workspace, Depends(get_current_workspace)],
):
    return await TimeEntryService.update_time_entry(db, workspace, id, payload)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_time_entry(
    id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    _role: Annotated[WorkspaceMember, Depends(require_role(WorkspaceRole.MEMBER))],
    workspace: Annotated[Workspace, Depends(get_current_workspace)],
):
    return await TimeEntryService.delete_time_entry(db, workspace, id)


@router.delete("/", status_code=status.HTTP_204_NO_CONTENT)
async def bulk_delete(
    body: TimeEntryBulkDelete,
    db: Annotated[AsyncSession, Depends(get_db)],
    _role: Annotated[WorkspaceMember, Depends(require_role(WorkspaceRole.MEMBER))],
    workspace: Annotated[Workspace, Depends(get_current_workspace)],
):
    return await TimeEntryService.bulk_delete(db, workspace, body.ids)
