from datetime import datetime

from pydantic import BaseModel, Field

from src.api.v1.clients.clients_schemas import ClientRead
from src.api.v1.projects.projects_schema import ProjectShallow


class TimeEntryCreate(BaseModel):
    start_time: datetime | None = Field(default=None)
    end_time: datetime | None = Field(default=None)
    description: str | None = Field(default=None)
    project_id: int | None = Field(default=None)
    client_id: int | None = Field(default=None)
    billable: bool | None = Field(default=False)


class TimeEntryBulkDelete(BaseModel):
    ids: list[int]


class TimeEntryUpdate(BaseModel):
    start_time: datetime | None = Field(default=None)
    end_time: datetime | None = Field(default=None)
    description: str | None = Field(default=None)
    project_id: int | None = Field(default=None)
    client_id: int | None = Field(default=None)
    billable: bool | None = Field(default=False)


# ------------------- READ


class DBTimeEntryBase(BaseModel):
    model_config = {"from_attributes": True}


class TimeEntryRead(DBTimeEntryBase):
    id: int
    description: str | None
    start_time: datetime
    end_time: datetime | None
    workspace_id: int
    client_id: int | None
    project_id: int | None
    user_id: int
    client: ClientRead | None
    project: ProjectShallow | None
    billable: bool


class TimeEntrySummary(DBTimeEntryBase):
    id: int
    description: str | None
    start_time: datetime
    end_time: datetime | None
    workspace_id: int
    project: ProjectShallow | None
    billable: bool
