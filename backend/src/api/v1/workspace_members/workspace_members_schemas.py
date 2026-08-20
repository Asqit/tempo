import enum
from datetime import datetime

from pydantic import BaseModel, Field

from src.api.v1.auth.auth_schemas import UserRead
from src.api.v1.clients.clients_schemas import ClientShallow
from src.api.v1.time_entries.time_entries_schemas import TimeEntryRead


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
