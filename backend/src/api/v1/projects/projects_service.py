from logging import getLogger

from fastapi import HTTPException, status
from fastapi_pagination import Page
from fastapi_pagination.ext.sqlalchemy import paginate
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio.session import AsyncSession
from sqlalchemy.orm import selectinload

from src.api.v1.clients.clients_models import Client
from src.api.v1.projects.projects_models import Project
from src.api.v1.projects.projects_schema import (
    ProjectCreate,
    ProjectRead,
    ProjectUpdate,
)
from src.api.v1.workspace.workspace_models import Workspace

logger = getLogger(__name__)


class ProjectsService:
    @staticmethod
    async def _get_client_in_workspace(
        db: AsyncSession, workspace: Workspace, client_id: int
    ) -> Client:
        """prefetched client"""
        client = await db.scalar(
            select(Client).where(
                Client.id == client_id,
                Client.workspace_id == workspace.id,
            )
        )

        if client is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

        return client

    @staticmethod
    async def get_projects(
        db: AsyncSession, workspace: Workspace, client_id: int | None
    ) -> Page[ProjectRead]:
        filters = [Client.workspace_id == workspace.id]

        if client_id is not None:
            filters.append(Project.client_id == client_id)

        return await paginate(
            db,
            select(Project)
            .join(Project.client)
            .where(*filters)
            .options(selectinload(Project.client))
            .order_by(Project.created_at),
        )

    @staticmethod
    async def get_project(db: AsyncSession, workspace: Workspace, project_id: int):
        project = await db.scalar(
            select(Project)
            .join(Project.client)
            .where(Project.id == project_id, Client.workspace_id == workspace.id)
            .options(selectinload(Project.client))
        )

        if project is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

        return project

    @staticmethod
    async def create_project(
        db: AsyncSession, workspace: Workspace, client_id: int, payload: ProjectCreate
    ):
        await ProjectsService._get_client_in_workspace(db, workspace, client_id)

        conflicting_rows = await db.execute(
            select(Project).where(
                Project.name == payload.name,
                Project.client_id == client_id,
            )
        )
        conflicts = conflicting_rows.scalars().all()

        if len(conflicts) > 0:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT)

        new_proj = Project(
            name=payload.name,
            description=payload.description,
            start_time=payload.start_time,
            end_time=payload.end_time,
            client_id=client_id,
        )

        db.add(new_proj)
        await db.commit()
        await db.refresh(new_proj)

        return await db.scalar(
            select(Project)
            .where(Project.id == new_proj.id)
            .options(selectinload(Project.client))
        )

    @staticmethod
    async def update_project(
        db: AsyncSession,
        workspace: Workspace,
        client_id: int,
        project_id: int,
        payload: ProjectUpdate,
    ):
        await ProjectsService._get_client_in_workspace(db, workspace, client_id)

        project = await db.get(Project, project_id)
        if project is None or project.client_id != client_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

        if payload.name is not None:
            project.name = payload.name
        if payload.description is not None:
            project.description = payload.description
        if payload.start_time is not None:
            project.start_time = payload.start_time
        if payload.end_time is not None:
            project.end_time = payload.end_time

        await db.commit()
        await db.refresh(project)
        return project

    @staticmethod
    async def delete_project(
        db: AsyncSession, workspace: Workspace, client_id: int, project_id: int
    ):
        await ProjectsService._get_client_in_workspace(db, workspace, client_id)

        project = await db.get(Project, project_id)
        if project is None or project.client_id != client_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

        await db.delete(project)
        await db.commit()

        return project_id

    @staticmethod
    async def bulk_delete(
        db: AsyncSession, workspace: Workspace, client_id: int, ids: list[int]
    ):
        await ProjectsService._get_client_in_workspace(db, workspace, client_id)

        stmt = (
            delete(Project)
            .where(Project.client_id == client_id)
            .where(Project.id.in_(ids))
        )

        await db.execute(stmt)
        await db.commit()
