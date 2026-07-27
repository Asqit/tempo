from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from src.api.v1.auth.auth_schemas import UserRead


class ClientRead(BaseModel):
    model_config = {"from_attributes": True}
    id: int
    name: str = Field()
    user: UserRead
    created_at: datetime
    updated_at: datetime


class ClientCreate(BaseModel):
    name: str


class ClientPartial(BaseModel):
    name: Optional[str] = None
