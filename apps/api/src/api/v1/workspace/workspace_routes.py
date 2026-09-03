from typing import Annotated

from fastapi import APIRouter, Depends, status
from fastapi_pagination import Page
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.v1.auth.auth_helpers import get_current_user
from src.api.v1.auth.auth_models import User
from src.api.v1.workspace.models.member_models import WorkspaceMember
from src.api.v1.workspace.schemas.invitation_schemas import (
    WorkspaceInvitationCreate,
    WorkspaceInvitationRead,
)
from src.api.v1.workspace.schemas.member_schemas import (
    WorkspaceMemberRead,
    WorkspaceMemberUpdate,
    WorkspaceRole,
)
from src.api.v1.workspace.schemas.workspace_schemas import (
    WorkspaceCreate,
    WorkspaceRead,
)
from src.api.v1.workspace.workspace_service import WorkspaceService
from src.api.v1.workspace.workspace_utils import require_role
from src.core.database import get_db

router = APIRouter(prefix="/workspaces", tags=["Workspace"])


@router.post("", response_model=WorkspaceRead)
async def create_workspace(
    body: WorkspaceCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    return await WorkspaceService.create_workspace(db, current_user.id, body)


@router.get("", response_model=Page[WorkspaceRead])
async def list_workspaces(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    return await WorkspaceService.list_workspaces(db, current_user.id)


@router.delete("/", status_code=status.HTTP_204_NO_CONTENT)
async def delete_workspace(
    db: Annotated[AsyncSession, Depends(get_db)],
    member: Annotated[WorkspaceMember, Depends(require_role(WorkspaceRole.OWNER))],
):
    return await WorkspaceService.delete_workspace(db, member)


# --------------------------------------------------------------------------------------- MEMBERS <<--


@router.get("/members", response_model=Page[WorkspaceMemberRead])
async def list_workspace_members(
    db: Annotated[AsyncSession, Depends(get_db)],
    member: Annotated[WorkspaceMember, Depends(require_role(WorkspaceRole.MEMBER))],
):
    """Get all members for selected workspace"""
    return await WorkspaceService.list_workspace_members(db, member.workspace_id)


@router.put("/members/{member_id}", response_model=WorkspaceMemberRead)
async def update_workspace_member(
    body: WorkspaceMemberUpdate,
    member_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    admin: Annotated[WorkspaceMember, Depends(require_role(WorkspaceRole.ADMIN))],
):
    """Update workspace member"""
    return await WorkspaceService.update_workspace_member(db, member_id, body, admin)


@router.delete("/members/me", status_code=status.HTTP_204_NO_CONTENT)
async def leave_workspace(
    db: Annotated[AsyncSession, Depends(get_db)],
    member: Annotated[WorkspaceMember, Depends(require_role(WorkspaceRole.MEMBER))],
):
    """removes requestee from workspace"""
    await WorkspaceService.leave_workspace(db, member)


@router.delete("/members/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_workspace_member(
    member_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    admin: Annotated[WorkspaceMember, Depends(require_role(WorkspaceRole.ADMIN))],
):
    """removes member from workspace"""
    await WorkspaceService.remove_workspace_member(db, member_id, admin)


# --------------------------------------------------------------------------------------- INVITATIONS <<--


@router.get("/invitations", response_model=Page[WorkspaceInvitationRead])
async def list_all_workspace_invitations(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    return await WorkspaceService.list_invitations(db, current_user.id)


@router.post("/invitations", response_model=WorkspaceInvitationRead)
async def create_invitation(
    body: WorkspaceInvitationCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    member: Annotated[WorkspaceMember, Depends(require_role(WorkspaceRole.MEMBER))],
):
    return await WorkspaceService.create_invitation(
        db, body, member, member.workspace_id
    )


@router.post(
    "/invitations/accept/{invitation_id}", status_code=status.HTTP_204_NO_CONTENT
)
async def accept_invitation(
    invitation_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    return await WorkspaceService.accept_invitation(db, invitation_id, current_user.id)


@router.delete(
    "/invitations/revoke/{invitation_id}", status_code=status.HTTP_204_NO_CONTENT
)
async def revoke_invitation(
    invitation_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    return await WorkspaceService.revoke_invitation(db, invitation_id, current_user.id)
