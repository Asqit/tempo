from datetime import datetime

from sqlalchemy import asc, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.api.v1.time_entries.time_entires_models import TimeEntry
from src.api.v1.workspace.workspace_models import Workspace


class ReportsService:
    @staticmethod
    async def get_live_report(
        db: AsyncSession,
        workspace: Workspace,
        period_start: datetime,
        period_end: datetime,
        client_id: int | None,
        project_id: int | None,
        billable: bool | None,
    ):
        filters = [
            TimeEntry.workspace_id == workspace.id,
            TimeEntry.start_time >= period_start,
            or_(TimeEntry.end_time.is_(None), TimeEntry.end_time <= period_end),
        ]

        if client_id is not None:
            filters.append(TimeEntry.client_id == client_id)

        if project_id is not None:
            filters.append(TimeEntry.project_id == project_id)

        if billable is not None:
            filters.append(TimeEntry.billable == billable)

        result = await db.execute(
            select(TimeEntry)
            .where(*filters)
            .order_by(asc(TimeEntry.created_at))
            .options(selectinload(TimeEntry.client))
            .options(selectinload(TimeEntry.project))
        )

        entries = result.scalars().all()
        return entries
