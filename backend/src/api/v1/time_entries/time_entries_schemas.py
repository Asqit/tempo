from datetime import datetime

from pydantic import BaseModel, Field

from src.api.v1.projects.projects_schema import ProjectShallow


class TimeEntryCreate(BaseModel):
    start_time: datetime | None = Field(default=None)
    end_time: datetime | None = Field(default=None)
    description: str | None = Field(default=None)
    project_id: int | None = Field(default=None)
    client_id: int | None = Field(default=None)
    user_id: int


class TimeEntryBulkDelete(BaseModel):
    ids: list[int]


class TimeEntryUpdate(BaseModel):
    start_time: datetime | None = Field(default=None)
    end_time: datetime | None = Field(default=None)
    description: str | None = Field(default=None)
    project_id: int | None = Field(default=None)
    client_id: int | None = Field(default=None)


# ------------------- READ


class DBTimeEntryBase(BaseModel):
    model_config = {"from_attributes": True}


class TimeEntryRead(DBTimeEntryBase):
    id: int
    description: str | None
    start_time: datetime
    end_time: datetime | None
    project_id: int | None
    user_id: int | None
    project: ProjectShallow | None
