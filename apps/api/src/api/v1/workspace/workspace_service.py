from datetime import UTC, datetime, timedelta

from fastapi import HTTPException, status
from fastapi_pagination.ext.sqlalchemy import paginate
from sqlalchemy import exists, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.v1.auth.auth_models import User
from src.api.v1.notifications.notifications_schemas import (
    WorkspaceInviteAcceptedPayload,
    WorkspaceInvitePayload,
    WorkspaceLeftPayload,
    WorkspaceRemovedPayload,
    WorkspaceRoleChangedPayload,
)
from src.api.v1.notifications.notifications_service import NotificationsService
from src.api.v1.workspace.models.invitation_models import WorkspaceInvitation
from src.api.v1.workspace.models.workspace_models import Workspace
from src.api.v1.workspace.schemas.invitation_schemas import WorkspaceInvitationCreate
from src.api.v1.workspace.schemas.member_schemas import (
    WorkspaceMemberUpdate,
    WorkspaceRole,
)
from src.api.v1.workspace.schemas.workspace_schemas import WorkspaceCreate
from src.api.v1.workspace.workspace_utils import has_permission

from .models.member_models import WorkspaceMember


class WorkspaceService:
    # -------------------------------------------------------------- LIST WORKSPACES
    @staticmethod
    async def list_workspaces(db: AsyncSession, user_id: int):
        query = (
            select(Workspace)
            .outerjoin(WorkspaceMember, WorkspaceMember.workspace_id == Workspace.id)
            .where(
                or_(
                    Workspace.user_id == user_id,
                    WorkspaceMember.user_id == user_id,
                )
            )
            .distinct()
            .order_by(Workspace.id)
        )
        return await paginate(db, query)

    # -------------------------------------------------------------- CREATE WORKSPACE
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

        owner = WorkspaceMember(
            user_id=user_id,
            role="owner",
            workspace_id=workspace.id,
        )

        db.add(owner)

        await db.commit()
        await db.refresh(workspace)

        return workspace

    # -------------------------------------------------------------- DELETE WORKSPACE
    @staticmethod
    async def delete_workspace(db: AsyncSession, member: WorkspaceMember):
        await db.delete(member.workspace)
        await db.commit()

    # --------------------------------------------------------------------------------------- MEMBERS <<--
    # -------------------------------------------------------------- LIST MEMBERS
    @staticmethod
    async def list_workspace_members(db: AsyncSession, workspace_id: int):
        return await paginate(
            db,
            select(WorkspaceMember).where(WorkspaceMember.workspace_id == workspace_id),
        )

    # -------------------------------------------------------------- UPDATE MEMBER
    @staticmethod
    async def update_workspace_member(
        db: AsyncSession,
        member_id: int,
        body: WorkspaceMemberUpdate,
        admin: WorkspaceMember,
    ):
        member = await db.get(WorkspaceMember, member_id)

        if member is None or member.workspace_id != admin.workspace_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

        # Only owners can modify owners or assign the OWNER role.
        if (
            member.role == WorkspaceRole.OWNER or body.role == WorkspaceRole.OWNER
        ) and admin.role != WorkspaceRole.OWNER:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)

        old_role = member.role
        member.role = body.role

        if member.user_id != admin.user_id and old_role != body.role:
            await NotificationsService.create_notification(
                db,
                member.user_id,
                WorkspaceRoleChangedPayload(
                    workspace_id=admin.workspace_id,
                    workspace_name=admin.workspace.name,
                    member_user_id=member.user_id,
                    member_name=member.user.name,
                    changed_by_user_id=admin.user_id,
                    changed_by_name=admin.user.name,
                    old_role=old_role.value,
                    new_role=body.role.value,
                ),
            )

        await db.commit()
        await db.refresh(member)

        return member

    # -------------------------------------------------------------- REMOVE MEMBER
    @staticmethod
    async def remove_workspace_member(
        db: AsyncSession, member_id: int, admin: WorkspaceMember
    ):
        member = await db.get(WorkspaceMember, member_id)
        if member is None or member.workspace_id != admin.workspace_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

        if has_permission(member.role, WorkspaceRole.ADMIN) and not has_permission(
            admin.role, WorkspaceRole.OWNER
        ):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)

        if member.user_id != admin.user_id:
            await NotificationsService.create_notification(
                db,
                member.user_id,
                WorkspaceRemovedPayload(
                    workspace_id=member.workspace_id,
                    workspace_name=member.workspace.name,
                    removed_by_user_id=admin.user_id,
                    removed_by_name=admin.user.name,
                ),
            )

        await db.delete(member)
        await db.commit()
        return member_id

    # -------------------------------------------------------------- LEAVE WORKSPACE
    @staticmethod
    async def leave_workspace(db: AsyncSession, member: WorkspaceMember):
        if member.user_id != member.workspace.user_id:
            owner = await db.get(User, member.workspace.user_id)
            if owner is not None:
                _ = await NotificationsService.create_notification(
                    db,
                    owner.id,
                    WorkspaceLeftPayload(
                        workspace_id=member.workspace_id,
                        workspace_name=member.workspace.name,
                        user_id=member.user_id,
                        user_name=member.user.name,
                    ),
                )
        await db.delete(member)
        await db.commit()

    # --------------------------------------------------------------------------------------- INVITATIONS <<--
    # -------------------------------------------------------------- GET INVITATIONS
    @staticmethod
    async def list_invitations(db: AsyncSession, user_id: int):
        return await paginate(
            db,
            select(WorkspaceInvitation).where(WorkspaceInvitation.user_id == user_id),
        )

    # -------------------------------------------------------------- CREATE INVITATION
    @staticmethod
    async def create_invitation(
        db: AsyncSession,
        body: WorkspaceInvitationCreate,
        member: WorkspaceMember,
        workspace_id: int,
    ):

        invitee_user = await db.scalar(select(User).where(User.email == body.email))
        if invitee_user is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST)

        conflict = await db.scalar(
            select(WorkspaceInvitation).where(
                WorkspaceInvitation.user_id == invitee_user.id,
                WorkspaceInvitation.workspace_id == workspace_id,
                WorkspaceInvitation.accepted_at.is_(None),
                WorkspaceInvitation.revoked_at.is_(None),
                WorkspaceInvitation.expires_at > datetime.now(UTC),
            )
        )

        if conflict is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, detail="already invited"
            )

        membership = await db.scalar(
            select(WorkspaceMember).where(
                WorkspaceMember.user_id == invitee_user.id,
                WorkspaceMember.workspace_id == member.workspace_id,
            )
        )

        if membership:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, detail="already member"
            )

        role = body.role or WorkspaceRole.MEMBER
        invite = WorkspaceInvitation(
            workspace_id=workspace_id,
            user_id=invitee_user.id,
            role=role,
            expires_at=datetime.now(UTC) + timedelta(days=30),
        )

        db.add(invite)
        await db.flush()

        _ = await NotificationsService.create_notification(
            db,
            invitee_user.id,
            WorkspaceInvitePayload(
                invitation_id=invite.id,
                workspace_id=workspace_id,
                workspace_name=member.workspace.name,
                invited_by_user_id=member.user_id,
                invited_by_name=member.user.name,
                role=role.value,
            ),
        )

        await db.commit()
        await db.refresh(invite)

        return invite

    # -------------------------------------------------------------- ACCEPT INVITATION
    @staticmethod
    async def accept_invitation(db: AsyncSession, invitation_id: int, user_id: int):
        invitation = await db.get(WorkspaceInvitation, invitation_id)
        if invitation is None or invitation.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

        now = datetime.now(UTC)

        if invitation.accepted_at is not None:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT)

        if invitation.revoked_at is not None:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT)

        if invitation.expires_at is not None and invitation.expires_at <= now:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT)

        membership = WorkspaceMember(
            user_id=user_id,
            workspace_id=invitation.workspace_id,
            role=invitation.role,
        )

        workspace = await db.get(Workspace, invitation.workspace_id)
        owner = await db.get(User, workspace.user_id) if workspace else None
        accepter = await db.get(User, user_id)
        if workspace is not None and owner is not None and accepter is not None:
            await NotificationsService.create_notification(
                db,
                owner.id,
                WorkspaceInviteAcceptedPayload(
                    workspace_id=workspace.id,
                    workspace_name=workspace.name,
                    accepted_by_user_id=accepter.id,
                    accepted_by_name=accepter.name,
                    role=membership.role.value,
                ),
            )

        invitation.accepted_at = now
        db.add(membership)
        await db.commit()
        await db.refresh(membership)
        return membership.id

    # -------------------------------------------------------------- REVOKE INVITATION
    @staticmethod
    async def revoke_invitation(db: AsyncSession, invitation_id: int, user_id: int):
        invitation = await db.get(WorkspaceInvitation, invitation_id)
        if invitation is None or invitation.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

        invitation.revoked_at = datetime.now(UTC)
        await db.commit()
        return invitation.id
