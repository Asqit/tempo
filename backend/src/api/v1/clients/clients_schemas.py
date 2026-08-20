from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field


class ClientCreate(BaseModel):
    name: str = Field(min_length=3)
    hourly_rate: Decimal | None = Field(default=None)
    currency: str | None = Field(default=None)


class ClientUpdate(BaseModel):
    name: str | None = Field(default=None)
    hourly_rate: Decimal | None
    currency: str | None


# ------------------ READ


class DBClientBase(BaseModel):
    model_config = {"from_attributes": True}


class ClientRead(DBClientBase):
    id: int
    name: str
    hourly_rate: Decimal | None
    currency: str
    created_at: datetime
    updated_at: datetime


class ClientShallow(DBClientBase):
    id: int
    name: str
    hourly_rate: Decimal | None
    currency: str
    created_at: datetime
    updated_at: datetime
