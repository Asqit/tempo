from datetime import datetime

from pydantic import BaseModel, Field

from src.api.v1.workspace.workspace_members_schemas import WorkspaceRole


class WorkspaceInvitationCreate(BaseModel):
    email: str = Field(min_length=3)
    role: WorkspaceRole | None = Field(default=None)
    expires_at: datetime | None = Field(default=None)


class WorkspaceInvitationUpdate(BaseModel):
    role: WorkspaceRole | None = Field(default=None)
    expires_at: datetime | None = Field(default=None)
    revoked_at: datetime | None = Field(default=None)


# -------------- READ
class DBWorkspaceInvitation(BaseModel):
    model_config = {"from_attributes": True}


class WorkspaceInvitation(DBWorkspaceInvitation):
    id: int
    workspace_id: int
    user_id: int
    role: WorkspaceRole
    created_at: datetime
    updated_at: datetime
    expires_at: datetime | None
    accepted_at: datetime | None
    revoked_at: datetime | None
