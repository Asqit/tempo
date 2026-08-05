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

logger = getLogger(__name__)


class ProjectsService:
    @staticmethod
    async def get_projects(
        db: AsyncSession, user_id: int, client_id: int | None
    ) -> Page[ProjectRead]:
        filters = [Project.user_id == user_id]

        if client_id is not None:
            filters.append(Project.client_id == client_id)

        return await paginate(
            db,
            select(Project)
            .where(*filters)
            .options(selectinload(Project.client).options(selectinload(Client.user)))
            .order_by(Project.created_at),
        )

    @staticmethod
    async def get_project(db: AsyncSession, user_id: int, project_id: int):
        result = await db.execute(
            select(Project)
            .where(Project.id == project_id, Project.user_id == user_id)
            .options(selectinload(Project.client).options(selectinload(Client.user)))
        )

        project = result.scalar_one_or_none()
        if project is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
        return project

    @staticmethod
    async def create_project(db: AsyncSession, user_id: int, payload: ProjectCreate):
        conflicting_rows = await db.execute(
            select(Project).where(
                Project.name == payload.name,
                Project.user_id == user_id,
            )
        )
        conflicts = conflicting_rows.scalars().all()

        if len(conflicts) > 0:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT)

        # validate that project's client belongs to our user
        if payload.client_id is not None:
            client = await db.get(Client, payload.client_id)
            if client is None or client.user_id != user_id:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="client not found",
                )

        new_proj = Project(
            name=payload.name,
            user_id=user_id,
            client_id=payload.client_id,
        )

        db.add(new_proj)
        await db.commit()
        await db.refresh(new_proj)

        # Reload with the relationships required by ProjectRead
        project = await db.scalar(
            select(Project)
            .where(Project.id == new_proj.id)
            .options(selectinload(Project.client).options(selectinload(Client.user)))
        )

        return project

    @staticmethod
    async def update_project(
        db: AsyncSession, user_id: int, project_id: int, payload: ProjectUpdate
    ):
        project = await db.get(Project, project_id)
        if project is None or project.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

        if payload.name:
            project.name = payload.name

        await db.commit()
        await db.refresh(project)
        return project

    @staticmethod
    async def delete_project(db: AsyncSession, user_id: int, project_id: int):
        project = await db.get(Project, project_id)
        if project is None or project.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
        await db.delete(project)
        await db.commit()

        return project_id

    @staticmethod
    async def bulk_delete(db: AsyncSession, user_id: int, ids: list[int]):
        stmt = (
            delete(Project).where(Project.user_id == user_id).where(Project.id.in_(ids))
        )

        await db.execute(stmt)
        await db.commit()
