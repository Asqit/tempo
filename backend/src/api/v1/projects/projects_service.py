from fastapi import HTTPException, status
from fastapi_pagination.ext.sqlalchemy import paginate
from sqlalchemy import select
from sqlalchemy.ext.asyncio.session import AsyncSession

from src.api.v1.clients.clients_models import Client
from src.api.v1.projects.projects_models import Project
from src.api.v1.projects.projects_schema import ProjectPartial, ProjectWrite


class ProjectsService:
    @staticmethod
    async def get_projects(db: AsyncSession, user_id: int):
        return await paginate(
            db,
            select(Project)
            .where(Project.user_id == user_id)
            .order_by(Project.created_at),
        )

    @staticmethod
    async def get_project(db: AsyncSession, user_id: int, project_id: int):
        project = await db.get(Project, project_id)
        if project is None or project.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
        return project

    @staticmethod
    async def create_project(db: AsyncSession, user_id: int, payload: ProjectWrite):
        conflicting_rows = await db.execute(
            select(Project).where(
                Project.name == payload.name, Project.user_id == user_id
            )
        )
        conflicts = conflicting_rows.scalars().all()

        if len(conflicts) > 0:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT)

        # validate that project's owner, client, is owned by our user
        client = await db.get(Client, payload.client_id)
        if client is None or client.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="client not found"
            )

        new_proj = Project(name=payload.name, user_id=user_id, client_id=client.id)
        db.add(new_proj)
        await db.commit()
        await db.refresh(new_proj)
        return new_proj

    @staticmethod
    async def update_project(
        db: AsyncSession, user_id: int, project_id: int, payload: ProjectPartial
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
