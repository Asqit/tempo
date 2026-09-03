import uuid
from datetime import datetime

from fastapi import HTTPException, status
from fastapi_pagination.ext.sqlalchemy import paginate
from sqlalchemy import asc, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.api.v1.clients.clients_models import Client
from src.api.v1.projects.projects_models import Project
from src.api.v1.reports.reports_models import (
    Report,
    ReportClientSnapshot,
    ReportEntrySnapshot,
    ReportProjectSnapshot,
)
from src.api.v1.reports.reports_schemas import CreateReport
from src.api.v1.time_entries.time_entires_models import TimeEntry
from src.api.v1.workspace.models.workspace_models import Workspace


class ReportsService:
    REPORT_LOAD_OPTIONS = (
        selectinload(Report.snapshots),
        selectinload(Report.client_snapshot),
        selectinload(Report.project_snapshot),
    )

    @staticmethod
    async def share_static_report(db: AsyncSession, workspace: Workspace, id: int):
        report = await ReportsService.get_single_static_report(db, workspace, id)
        link = uuid.uuid4()
        report.uuid = link
        await db.commit()
        await db.refresh(report)
        return report

    @staticmethod
    async def get_single_static_report(db: AsyncSession, workspace: Workspace, id: int):
        report = await db.scalar(
            select(Report)
            .where(Report.id == id, Report.workspace_id == workspace.id)
            .options(*ReportsService.REPORT_LOAD_OPTIONS)
        )
        if report is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
        return report

    @staticmethod
    async def get_static_reports(
        db: AsyncSession,
        workspace: Workspace,
        query: str | None,
    ):
        filters = [
            Report.workspace_id == workspace.id,
        ]

        if query:
            filters.append(
                or_(
                    Report.name.ilike(f"%{query}%"),
                    Report.description.ilike(f"%{query}%"),
                )
            )

        return await paginate(
            db,
            select(Report)
            .where(*filters)
            .order_by(Report.created_at.desc())
            .options(*ReportsService.REPORT_LOAD_OPTIONS),
        )

    @staticmethod
    async def delete_static_report(db: AsyncSession, workspace: Workspace, id: int):
        report = await db.get(Report, id)
        if report is None or report.workspace_id != workspace.id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

        await db.delete(report)
        await db.commit()
        return id

    @staticmethod
    async def get_live_report(
        db: AsyncSession,
        workspace: Workspace,
        period_start: datetime,
        period_end: datetime,
        client_ids: list[int] | None,
        project_ids: list[int] | None,
        billable: bool | None,
    ):
        filters = [
            TimeEntry.workspace_id == workspace.id,
            TimeEntry.start_time >= period_start,
            or_(TimeEntry.end_time.is_(None), TimeEntry.end_time <= period_end),
        ]
        if client_ids is not None:
            filters.append(TimeEntry.client_id.in_(client_ids))
        if project_ids is not None:
            filters.append(TimeEntry.project_id.in_(project_ids))
        if billable is not None:
            filters.append(TimeEntry.billable == billable)

        result = await db.execute(
            select(TimeEntry)
            .where(*filters)
            .order_by(asc(TimeEntry.created_at))
            .options(selectinload(TimeEntry.client), selectinload(TimeEntry.project))
        )
        return result.scalars().all()

    @staticmethod
    async def save_live_report(
        db: AsyncSession, workspace: Workspace, body: CreateReport
    ):
        entries = await ReportsService.get_live_report(
            db,
            workspace,
            period_start=body.period_start,
            period_end=body.period_end,
            client_ids=body.client_ids,
            project_ids=body.project_ids,
            billable=body.billable,
        )

        report = Report(
            workspace_id=workspace.id,
            name=body.name,
            description=body.description,
            period_start=body.period_start,
            period_end=body.period_end,
        )
        db.add(report)
        await db.flush()

        clients_map: dict[int, Client] = {}
        projects_map: dict[int, Project] = {}

        for entry in entries:
            duration = 0
            if entry.client is not None:
                clients_map[entry.client.id] = entry.client

            if entry.project is not None:
                projects_map[entry.project.id] = entry.project

            if entry.end_time:
                duration = int((entry.end_time - entry.start_time).total_seconds() / 60)
            db.add(
                ReportEntrySnapshot(
                    report_id=report.id,
                    time_entry_id=entry.id,
                    description=entry.description or "",
                    duration_minutes=duration,
                    logged_at=entry.start_time,
                    client_name=entry.client.name if entry.client else None,
                    project_name=entry.project.name if entry.project else None,
                )
            )

        for client in clients_map.values():
            db.add(
                ReportClientSnapshot(
                    report_id=report.id,
                    name=client.name,
                    hourly_rate=client.hourly_rate,
                    currency=client.currency,
                )
            )

        for project in projects_map.values():
            db.add(ReportProjectSnapshot(report_id=report.id, name=project.name))

        await db.commit()
        await db.refresh(
            report, attribute_names=["client_snapshot", "project_snapshot", "snapshots"]
        )
        return report
