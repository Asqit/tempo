from datetime import datetime

from pydantic import BaseModel, Field


class ClientCreate(BaseModel):
    name: str = Field(min_length=3)


class ClientUpdate(BaseModel):
    name: str | None = Field(default=None)


# ------------------ READ


class DBClientBase(BaseModel):
    model_config = {"from_attributes": True}


class ClientRead(DBClientBase):
    id: int
    name: str
    created_at: datetime
    updated_at: datetime


class ClientShallow(DBClientBase):
    id: int
    name: str
    created_at: datetime
    updated_at: datetime
