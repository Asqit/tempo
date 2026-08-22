from datetime import datetime
from typing import Annotated, Literal, Union

from pydantic import BaseModel, Field

from .notifications_models import NotificationType


class WorkspaceInvitePayload(BaseModel):
    type: Literal[NotificationType.WORKSPACE_INVITE] = NotificationType.WORKSPACE_INVITE
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


class DBNotification(BaseModel):
    model_config = {"from_attributes": True}


NotificationPayload = Annotated[
    Union[WorkspaceInvitePayload, WorkspaceRemovedPayload],
    Field(discriminator="type"),
]


class NotificationRead(DBNotification):
    id: int
    user_id: int
    type: NotificationType
    payload: NotificationPayload
    read_at: datetime | None = None
