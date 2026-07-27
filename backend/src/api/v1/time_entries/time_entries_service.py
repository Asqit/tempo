from datetime import datetime, timezone

from fastapi import HTTPException, status
from fastapi_pagination.ext.sqlalchemy import paginate
from sqlalchemy import exists, select
from sqlalchemy.ext.asyncio.session import AsyncSession

from src.api.v1.time_entries.time_entires_models import TimeEntry
from src.api.v1.time_entries.time_entries_schemas import (
    TimeEntryPartial,
    TimeEntryWrite,
)


class TimeEntryService:
    @staticmethod
    async def get_last_entry(db: AsyncSession, user_id: int):
        row = await db.execute(
            select(TimeEntry)
            .where(TimeEntry.user_id == user_id)
            .order_by(TimeEntry.start_time.desc())
            .limit(1)
        )

        entry = row.scalar_one_or_none()
        if entry is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

        return entry

    @staticmethod
    async def get_time_entry(db: AsyncSession, user_id: int, id: int):
        entry = await db.get(TimeEntry, id)
        if entry is None or entry.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
        return entry

    @staticmethod
    async def get_all_time_entries(db: AsyncSession, user_id: int):
        return await paginate(
            db,
            select(TimeEntry)
            .where(TimeEntry.user_id == user_id)
            .order_by(TimeEntry.created_at),
        )

    @staticmethod
    async def create_time_entry(
        db: AsyncSession, user_id: int, payload: TimeEntryWrite
    ):
        start = payload.start_time or datetime.now(timezone.utc)
        if start.tzinfo is None:
            start = start.replace(tzinfo=timezone.utc)  # assume UTC
        else:
            start = start.astimezone(timezone.utc)

        conflict = await db.scalar(
            select(
                exists().where(
                    TimeEntry.start_time == start, TimeEntry.user_id == user_id
                )
            )
        )

        if conflict:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT)

        entry = TimeEntry(
            user_id=user_id,
            start_time=start,
            end_time=payload.end_time,
            description=payload.description,
            project_id=payload.project_id,
        )
        db.add(entry)
        await db.commit()
        await db.refresh(entry)
        return entry

    @staticmethod
    async def update_time_entry(
        db: AsyncSession, user_id: int, id: int, payload: TimeEntryPartial
    ):
        if payload.end_time is not None and payload.end_time.tzinfo is None:
            payload.end_time = payload.end_time.replace(tzinfo=timezone.utc)

        entry = await TimeEntryService.get_time_entry(db, user_id, id)
        for key, value in payload.model_dump(exclude_unset=True).items():
            if value != None:
                setattr(entry, key, value)
        await db.commit()
        await db.refresh(entry)
        return entry

    @staticmethod
    async def delete_time_entry(db: AsyncSession, user_id: int, id: int):
        entry = await TimeEntryService.get_time_entry(db, user_id, id)
        await db.delete(entry)
        await db.commit()
        return id
