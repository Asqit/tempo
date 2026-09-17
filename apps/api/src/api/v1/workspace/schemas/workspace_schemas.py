from datetime import datetime

from pydantic import BaseModel, Field

from src.api.v1.clients.clients_schemas import ClientShallow
from src.api.v1.time_entries.time_entries_schemas import TimeEntryRead

from .member_schemas import (
    WorkspaceMemberRead,
)


class WorkspaceBillingProfileCreate(BaseModel):
    legal_name: str = Field(min_length=1, max_length=255)
    street: str | None = Field(default=None, max_length=255)
    city: str | None = Field(default=None, max_length=100)
    postal_code: str | None = Field(default=None, max_length=10)
    country: str = Field(default="CZ", min_length=2, max_length=2)
    ico: str | None = Field(default=None, max_length=20)
    dic: str | None = Field(default=None, max_length=20)
    vat_payer: bool = False
    bank_account: str | None = Field(default=None, max_length=34)
    iban: str | None = Field(default=None, max_length=34)
    currency: str = Field(default="CZK", min_length=3, max_length=3)


class WorkspaceBillingProfileRead(WorkspaceBillingProfileCreate):
    id: int
    workspace_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class WorkspaceBillingProfileUpdate(WorkspaceBillingProfileCreate):
    pass


class WorkspaceCreate(BaseModel):
    name: str = Field(min_length=3)
    billing_profile: WorkspaceBillingProfileCreate


class WorkspaceUpdate(BaseModel):
    name: str | None = Field(default=None)


# ------------------ READ


class DBWorkspaceBase(BaseModel):
    model_config = {"from_attributes": True}


class WorkspaceRead(DBWorkspaceBase):
    id: int
    name: str
    members: list[WorkspaceMemberRead]
    clients: list[ClientShallow]
    time_entries: list[TimeEntryRead]
    billing_profile: WorkspaceBillingProfileRead
    created_at: datetime
    updated_at: datetime
