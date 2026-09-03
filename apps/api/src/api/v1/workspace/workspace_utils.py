from typing import Annotated

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.v1.auth.auth_helpers import get_current_user
from src.api.v1.auth.auth_models import User
from src.api.v1.workspace.models.member_models import WorkspaceMember
from src.api.v1.workspace.models.workspace_models import Workspace
from src.api.v1.workspace.schemas.member_schemas import WorkspaceRole
from src.core.database import get_db


async def get_current_workspace(
    x_workspace_id: Annotated[int, Header(alias="X-Workspace-Id")],
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Workspace:
    """
    Dependency for getting current selected workspace.
    !!It already requires AUTH, so no auth dep needed afterwards if not explicitly needed
    """

    workspace = await db.scalar(select(Workspace).where(Workspace.id == x_workspace_id))
    member = await get_member(db, x_workspace_id, current_user.id)

    if workspace is None or member is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"invalid workspace/user combination {x_workspace_id} {current_user.id}",
        )

    return workspace


ROLE_HIERARCHY = {
    WorkspaceRole.MEMBER: 0,
    WorkspaceRole.ADMIN: 1,
    WorkspaceRole.OWNER: 2,
}


def has_permission(user_role: WorkspaceRole, min_role: WorkspaceRole) -> bool:
    return ROLE_HIERARCHY[user_role] >= ROLE_HIERARCHY[min_role]


async def get_member(db: AsyncSession, workspace_id: int, user_id: int):
    result = await db.execute(
        select(WorkspaceMember).where(
            WorkspaceMember.workspace_id == workspace_id,
            WorkspaceMember.user_id == user_id,
        )
    )
    return result.scalar_one_or_none()


def require_role(min_role: WorkspaceRole):
    """Factory: returns a FastAPI dependency enforcing min_role in a workspace."""
    from src.api.v1.workspace.workspace_utils import get_current_workspace

    async def dependency(
        workspace: Annotated[Workspace, Depends(get_current_workspace)],
        user: Annotated[User, Depends(get_current_user)],
        db: Annotated[AsyncSession, Depends(get_db)],
    ) -> WorkspaceMember:
        member = await get_member(db, workspace.id, user.id)
        if not member or not has_permission(member.role, min_role):
            raise HTTPException(403, "Not enough permissions")
        return member

    return dependency
