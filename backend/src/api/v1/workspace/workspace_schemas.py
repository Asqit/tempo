import enum
from datetime import datetime

from pydantic import BaseModel, Field

from src.api.v1.auth.auth_schemas import UserRead
from src.api.v1.clients.clients_schemas import ClientShallow
from src.api.v1.time_entries.time_entries_schemas import TimeEntryRead
from src.api.v1.workspace_members.workspace_members_schemas import (
    WorkspaceMemberRead,
)


class WorkspaceCreate(BaseModel):
    name: str = Field(min_length=3)


class WorkspaceUpdate(BaseModel):
    name: str | None = Field(default=None)


# ------------------ READ


class DBWorkspaceBase(BaseModel):
    model_config = {"from_attributes": True}


class WorkspaceRead(DBWorkspaceBase):
    id: int
    name: str
    user: UserRead
    members: list[WorkspaceMemberRead]
    clients: list[ClientShallow]
    time_entries: list[TimeEntryRead]
    created_at: datetime
    updated_at: datetime
