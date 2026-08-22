from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio.session import AsyncSession

from src.api.v1.auth.auth_models import User
from src.api.v1.notifications.notifications_models import Notification, NotificationType
from src.api.v1.workspace.workspace_models import Workspace
from src.api.v1.workspace_members.workspace_members_models import WorkspaceMembers
from src.api.v1.workspace_members.workspace_members_schemas import WorkspaceRole


class WorkspaceMembersService:
    @staticmethod
    async def add_workspace_member(
        db: AsyncSession,
        candidate_email: str,
        workspace: Workspace,
        authorized_person: WorkspaceMembers,
    ):
        user = await db.scalar(select(User).where(User.email == candidate_email))
        if user is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST)

        membership = WorkspaceMembers(
            user_id=user.id, role=WorkspaceRole.MEMBER, workspace_id=workspace.id
        )

        notification = Notification(
            user_id=user.id,
            type=NotificationType.WORKSPACE_INVITE,
            payload={
                "workspace_id": workspace.id,
                "workspace_name": workspace.name,
                "invited_by_user_id": authorized_person.user_id,
                "invited_by_name": authorized_person.user.name,
                "role": WorkspaceRole.MEMBER,
            },
        )

        db.add(membership)
        db.add(notification)
        await db.commit()
        await db.refresh(membership)
        return membership
