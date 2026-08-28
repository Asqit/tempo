from __future__ import annotations

from typing import Annotated

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.v1.auth.auth_helpers import get_current_user
from src.api.v1.auth.auth_models import User
from src.api.v1.workspace.workspace_members_helpers import get_member
from src.api.v1.workspace.workspace_models import Workspace
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
