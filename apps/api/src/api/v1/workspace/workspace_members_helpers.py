from typing import Annotated

from fastapi import Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.v1.auth.auth_helpers import get_current_user
from src.api.v1.auth.auth_models import User
from src.api.v1.workspace.workspace_members_models import WorkspaceMember
from src.api.v1.workspace.workspace_members_schemas import WorkspaceRole
from src.api.v1.workspace.workspace_models import Workspace
from src.core.database import get_db

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
