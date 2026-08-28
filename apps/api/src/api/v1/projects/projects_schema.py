from datetime import datetime

from pydantic import BaseModel, Field

from src.api.v1.clients.clients_schemas import ClientRead


class ProjectCreate(BaseModel):
    name: str = Field(max_length=30)
    description: str | None = Field(max_length=128, default=None)
    start_time: datetime | None = Field(default=None)
    end_time: datetime | None = Field(default=None)


class ProjectUpdate(BaseModel):
    name: str | None = Field(default=None, max_length=30)
    description: str | None = Field(default=None, max_length=128)
    start_time: datetime | None = Field(default=None)
    end_time: datetime | None = Field(default=None)


class ProjectBulkDelete(BaseModel):
    ids: list[int]


# -------------------------- READ


class DBProjectBase(BaseModel):
    model_config = {"from_attributes": True}


class ProjectRead(DBProjectBase):
    id: int
    name: str
    client: ClientRead | None
    description: str | None
    start_time: datetime | None
    end_time: datetime | None
    created_at: datetime
    updated_at: datetime


class ProjectShallow(DBProjectBase):
    id: int
    name: str
    description: str | None
    start_time: datetime | None
    end_time: datetime | None
