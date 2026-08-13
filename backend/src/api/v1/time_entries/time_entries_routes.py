from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, status
from fastapi_pagination import Page
from sqlalchemy.ext.asyncio.session import AsyncSession

from src.api.v1.auth.auth_helpers import get_current_user
from src.api.v1.auth.auth_models import User
from src.api.v1.time_entries.time_entries_schemas import (
    TimeEntryBulkDelete,
    TimeEntryCreate,
    TimeEntryRead,
    TimeEntrySummary,
    TimeEntryUpdate,
)
from src.api.v1.time_entries.time_entries_service import TimeEntryService
from src.core.database import get_db

router = APIRouter(prefix="/time-entries", tags=["TimeEntries"])


@router.get("/", response_model=Page[TimeEntryRead])
async def get_all_time_entries(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    project_id: int | None = None,
    start_time: datetime | None = None,
    end_time: datetime | None = None,
):
    return await TimeEntryService.get_all_time_entries(
        db, current_user.id, project_id, start_time, end_time
    )


@router.get("/calendar", response_model=list[TimeEntrySummary])
async def get_calendar_entries(
    start_time: datetime,
    end_time: datetime,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    return await TimeEntryService.get_calendar_entries(
        db, current_user.id, start_time, end_time
    )


@router.get("/last", response_model=TimeEntryRead)
async def get_last_entry(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    return await TimeEntryService.get_last_entry(db, current_user.id)


@router.get("/{id}", response_model=TimeEntryRead)
async def get_time_entry(
    id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    return await TimeEntryService.get_time_entry(db, current_user.id, id)


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=TimeEntryRead)
async def create_time_entry(
    payload: TimeEntryCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    return await TimeEntryService.create_time_entry(db, current_user.id, payload)


@router.put("/{id}", response_model=TimeEntryRead)
async def update_time_entry(
    id: int,
    payload: TimeEntryUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    return await TimeEntryService.update_time_entry(db, current_user.id, id, payload)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_time_entry(
    id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    return await TimeEntryService.delete_time_entry(db, current_user.id, id)


@router.delete("/", status_code=status.HTTP_204_NO_CONTENT)
async def bulk_delete(
    body: TimeEntryBulkDelete,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    return await TimeEntryService.bulk_delete(db, current_user.id, body.ids)
