from datetime import datetime

from pydantic import BaseModel

from src.api.v1.auth.auth_schemas import UserRead
from src.api.v1.projects.projects_schema import ProjectRead


class TimeEntryRead(BaseModel):
    model_config = {"from_attributes": True}
    id: int
    description: str
    start_time: datetime
    end_time: datetime | None
    user: UserRead
    project: ProjectRead | None


class TimeEntryWrite(BaseModel):
    description: str
    user_id: int
    project_id: int | None
    start_time: datetime | None
    end_time: datetime | None


class TimeEntryPartial(BaseModel):
    description: str | None
    project_id: int | None
    start_time: datetime | None
    end_time: datetime | None
