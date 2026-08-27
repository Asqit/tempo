from datetime import datetime
from typing import Annotated, Literal, Union

from pydantic import BaseModel, Field

from .notifications_models import NotificationType


class WorkspaceInvitePayload(BaseModel):
    type: Literal[NotificationType.WORKSPACE_INVITE] = NotificationType.WORKSPACE_INVITE
    invitation_id: int
    workspace_id: int
    workspace_name: str
    invited_by_user_id: int
    invited_by_name: str
    role: str


class WorkspaceRemovedPayload(BaseModel):
    type: Literal[NotificationType.WORKSPACE_REMOVED] = (
        NotificationType.WORKSPACE_REMOVED
    )
    workspace_id: int
    workspace_name: str
    removed_by_user_id: int
    removed_by_name: str


class WorkspaceInviteAcceptedPayload(BaseModel):
    type: Literal[NotificationType.WORKSPACE_INVITE_ACCEPTED] = (
        NotificationType.WORKSPACE_INVITE_ACCEPTED
    )
    workspace_id: int
    workspace_name: str
    accepted_by_user_id: int
    accepted_by_name: str
    role: str


class WorkspaceRoleChangedPayload(BaseModel):
    type: Literal[NotificationType.WORKSPACE_ROLE_CHANGED] = (
        NotificationType.WORKSPACE_ROLE_CHANGED
    )
    workspace_id: int
    workspace_name: str
    member_user_id: int
    member_name: str
    changed_by_user_id: int
    changed_by_name: str
    old_role: str
    new_role: str


class WorkspaceLeftPayload(BaseModel):
    type: Literal[NotificationType.WORKSPACE_LEFT] = NotificationType.WORKSPACE_LEFT
    workspace_id: int
    workspace_name: str
    user_id: int
    user_name: str


class DBNotification(BaseModel):
    model_config = {"from_attributes": True}


NotificationPayload = Annotated[
    Union[
        WorkspaceInvitePayload,
        WorkspaceInviteAcceptedPayload,
        WorkspaceRemovedPayload,
        WorkspaceRoleChangedPayload,
        WorkspaceLeftPayload,
    ],
    Field(discriminator="type"),
]


class NotificationRead(DBNotification):
    id: int
    user_id: int
    type: NotificationType
    payload: NotificationPayload
    read_at: datetime | None = None
