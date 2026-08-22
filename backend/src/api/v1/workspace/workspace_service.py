from fastapi import HTTPException, status
from fastapi_pagination.ext.sqlalchemy import paginate
from sqlalchemy import exists, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.v1.workspace.workspace_models import Workspace
from src.api.v1.workspace.workspace_schemas import WorkspaceCreate, WorkspaceUpdate
from src.api.v1.workspace_members.workspace_members_models import WorkspaceMembers


class WorkspaceService:
    @staticmethod
    async def list_workspaces(db: AsyncSession, user_id: int):
        return await paginate(db, select(Workspace).where(Workspace.user_id == user_id))

    @staticmethod
    async def get_workspace(db: AsyncSession, workspace_id: int):
        result = await db.execute(select(Workspace).where(Workspace.id == workspace_id))

        workspace = result.scalar_one_or_none()
        if workspace is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

        return workspace

    @staticmethod
    async def create_workspace(
        db: AsyncSession,
        user_id: int,
        body: WorkspaceCreate,
    ):
        result = await db.execute(
            select(
                exists().where(
                    Workspace.user_id == user_id,
                    Workspace.name == body.name,
                )
            )
        )

        if result.scalar_one():
            raise HTTPException(status_code=status.HTTP_409_CONFLICT)

        workspace = Workspace(
            name=body.name,
            user_id=user_id,
        )

        db.add(workspace)
        await db.flush()

        owner = WorkspaceMembers(
            user_id=user_id,
            role="owner",
            workspace_id=workspace.id,
        )

        db.add(owner)

        await db.commit()
        await db.refresh(workspace)

        return workspace

    @staticmethod
    async def update_workspace(
        db: AsyncSession, user_id: int, workspace_id: int, body: WorkspaceUpdate
    ):
        workspace = await WorkspaceService.get_workspace(db, user_id, workspace_id)

        if body.name is not None and body.name != workspace.name:
            conflicts = await db.scalar(
                select(
                    exists().where(
                        Workspace.user_id == user_id,
                        Workspace.name == body.name,
                        Workspace.id != workspace_id,
                    )
                )
            )

            if conflicts:
                raise HTTPException(status_code=status.HTTP_409_CONFLICT)

            workspace.name = body.name

        await db.commit()
        await db.refresh(workspace)
        return workspace

    @staticmethod
    async def delete_workspace(
        db: AsyncSession,
        user_id: int,
        workspace_id: int,
    ):
        workspace = await db.scalar(
            select(Workspace).where(
                Workspace.id == workspace_id,
                Workspace.user_id == user_id,
            )
        )

        if workspace is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
            )

        await db.delete(workspace)
        await db.commit()
