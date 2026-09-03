from datetime import UTC, datetime

from src.api.v1.workspace.workspace_members_models import WorkspaceMember
from fastapi import HTTPException, status
from fastapi_pagination import Page
from fastapi_pagination.ext.sqlalchemy import paginate
from sqlalchemy import delete, exists, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.api.v1.clients.clients_models import Client
from src.api.v1.projects.projects_models import Project
from src.api.v1.time_entries.time_entires_models import TimeEntry
from src.api.v1.time_entries.time_entries_schemas import (
    TimeEntryCreate,
    TimeEntryRead,
    TimeEntryUpdate,
)
from src.api.v1.workspace.workspace_models import Workspace


class TimeEntryService:
    @staticmethod
    async def _validate_references(
        db: AsyncSession,
        workspace: Workspace,
        client_id: int | None,
        project_id: int | None,
    ) -> None:
        """Validate client/project references inside the selected workspace."""

        if client_id is None and project_id is None:
            return

        if client_id is not None:
            client_exists = await db.scalar(
                select(
                    exists().where(
                        Client.id == client_id,
                        Client.workspace_id == workspace.id,
                    )
                )
            )
            if not client_exists:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Client not found in workspace.",
                )

        if project_id is not None:
            project = await db.scalar(select(Project).where(Project.id == project_id))
            if project is None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Project not found.",
                )

            if project.client_id is not None:
                project_client = await db.scalar(
                    select(Client).where(
                        Client.id == project.client_id,
                        Client.workspace_id == workspace.id,
                    )
                )
                if project_client is None:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Project does not belong to this workspace.",
                    )

            if client_id is not None and project.client_id != client_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Project does not belong to the selected client.",
                )

    @staticmethod
    async def get_calendar_entries(
        db: AsyncSession, workspace: Workspace, start_time: datetime, end_time: datetime
    ):
        result = await db.execute(
            select(TimeEntry).where(
                TimeEntry.workspace_id == workspace.id,
                or_(
                    TimeEntry.end_time >= start_time,
                    TimeEntry.end_time.is_(None),
                ),
                TimeEntry.start_time <= end_time,
            )
        )

        return result.scalars().all()

    @staticmethod
    async def get_last_entry(db: AsyncSession, workspace: Workspace):
        row = await db.execute(
            select(TimeEntry)
            .where(TimeEntry.workspace_id == workspace.id)
            .order_by(TimeEntry.start_time.desc())
            .limit(1)
        )

        entry = row.scalar_one_or_none()
        if entry is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

        return entry

    @staticmethod
    async def get_time_entry(db: AsyncSession, workspace: Workspace, id: int):
        entry = await db.get(TimeEntry, id)

        if entry is None or entry.workspace_id != workspace.id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

        return entry

    @staticmethod
    async def get_all_time_entries(
        db: AsyncSession,
        workspace: Workspace,
        project_id: int | None = None,
        client_id: int | None = None,
        start_time: datetime | None = None,
        end_time: datetime | None = None,
        billable: bool | None = None,
    ) -> Page[TimeEntryRead]:
        filters = [TimeEntry.workspace_id == workspace.id]

        if client_id is not None:
            filters.append(TimeEntry.client_id == client_id)
        if project_id is not None:
            filters.append(TimeEntry.project_id == project_id)
        if billable is not None:
            filters.append(TimeEntry.billable == billable)
        if start_time is not None:
            filters.append(
                or_(
                    TimeEntry.end_time >= start_time,
                    TimeEntry.end_time.is_(None),
                )
            )
        if end_time is not None:
            filters.append(TimeEntry.start_time <= end_time)

        stmt = (
            select(TimeEntry)
            .where(*filters)
            .options(selectinload(TimeEntry.project))
            .order_by(TimeEntry.start_time.desc())
        )

        return await paginate(db, stmt)

    @staticmethod
    async def create_time_entry(
        db: AsyncSession,
        workspace: Workspace,
        payload: TimeEntryCreate,
        creator: WorkspaceMember
    ):
        start = payload.start_time or datetime.now(UTC)

        if start.tzinfo is None:
            start = start.replace(tzinfo=UTC)
        else:
            start = start.astimezone(UTC)

        conflict = await db.scalar(
            select(
                exists().where(
                    TimeEntry.workspace_id == workspace.id,
                    TimeEntry.start_time == start,
                )
            )
        )

        if conflict:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT)

        await TimeEntryService._validate_references(
            db,
            workspace,
            payload.client_id,
            payload.project_id,
        )

        entry = TimeEntry(
            workspace_id=workspace.id,
            user_id=creator.user_id,
            start_time=start,
            end_time=payload.end_time,
            description=payload.description,
            client_id=payload.client_id,
            project_id=payload.project_id,
        )

        db.add(entry)
        await db.commit()
        await db.refresh(entry)

        return entry

    @staticmethod
    async def update_time_entry(
        db: AsyncSession,
        workspace: Workspace,
        id: int,
        payload: TimeEntryUpdate,
    ):
        entry = await TimeEntryService.get_time_entry(db, workspace, id)

        if payload.end_time is not None and payload.end_time.tzinfo is None:
            payload.end_time = payload.end_time.replace(tzinfo=UTC)

        client_id = (
            payload.client_id
            if "client_id" in payload.model_fields_set
            else entry.client_id
        )

        project_id = (
            payload.project_id
            if "project_id" in payload.model_fields_set
            else entry.project_id
        )

        await TimeEntryService._validate_references(
            db,
            workspace,
            client_id,
            project_id,
        )

        for key, value in payload.model_dump(exclude_unset=True).items():
            setattr(entry, key, value)

        await db.commit()
        await db.refresh(entry)

        return entry

    @staticmethod
    async def delete_time_entry(
        db: AsyncSession,
        workspace: Workspace,
        id: int,
    ):
        entry = await TimeEntryService.get_time_entry(db, workspace, id)

        await db.delete(entry)
        await db.commit()

        return id

    @staticmethod
    async def bulk_delete(
        db: AsyncSession,
        workspace: Workspace,
        ids: list[int],
    ):
        stmt = (
            delete(TimeEntry)
            .where(TimeEntry.workspace_id == workspace.id)
            .where(TimeEntry.id.in_(ids))
        )

        await db.execute(stmt)
        await db.commit()
