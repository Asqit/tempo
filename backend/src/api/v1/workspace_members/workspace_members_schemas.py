import enum

from pydantic import BaseModel

from src.api.v1.auth.auth_schemas import UserRead


class WorkspaceRole(str, enum.Enum):
    OWNER = "owner"
    ADMIN = "admin"
    MEMBER = "member"


class WorkspaceMemberCreate(BaseModel):
    user_id: int
    role: WorkspaceRole = WorkspaceRole.MEMBER


class WorkspaceMemberUpdate(BaseModel):
    role: WorkspaceRole


class DBWorkspaceBase(BaseModel):
    model_config = {"from_attributes": True}


class WorkspaceMemberRead(DBWorkspaceBase):
    id: int
    user_id: int
    user: UserRead
    role: WorkspaceRole
