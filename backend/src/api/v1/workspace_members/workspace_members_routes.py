from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio.session import AsyncSession

from src.api.v1.workspace.workspace_models import Workspace
from src.api.v1.workspace.workspace_service import WorkspaceService
from src.api.v1.workspace.workspace_utils import get_current_workspace
from src.api.v1.workspace_members.workspace_members_helpers import (
    require_role,
)
from src.api.v1.workspace_members.workspace_members_models import WorkspaceMembers
from src.api.v1.workspace_members.workspace_members_schemas import WorkspaceRole
from src.api.v1.workspace_members.workspace_memebers_service import (
    WorkspaceMembersService,
)
from src.core.database import get_db

router = APIRouter(
    prefix="/workspaces/{workspace_id}/members", tags=["workspace-members"]
)


@router.get("/")
async def list_workspace_members():
    pass


@router.post("/", status_code=status.HTTP_201_CREATED)
async def add_workspace_member(
    candidate_email: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    workspace_id: int,
    member: Annotated[WorkspaceMembers, Depends(require_role(WorkspaceRole.ADMIN))],
):
    workspace = await WorkspaceService.get_workspace(db, workspace_id)
    membership = await WorkspaceMembersService.add_workspace_member(
        db, candidate_email, workspace, member
    )

    return membership.id


@router.put("/{member_id}")
async def change_member_role():
    pass


@router.delete("/{member_id}")
async def leave_workspace():
    pass
