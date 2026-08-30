from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field


class ClientCreate(BaseModel):
    name: str = Field(min_length=3)
    hourly_rate: Decimal | None = Field(default=None)
    is_company: bool | None = Field(default=None)

    street: str | None = Field(max_length=255, default=None)
    city: str | None = Field(max_length=100, default=None)
    postal_code: str | None = Field(max_length=10, default=None)
    # ISO 3166-1 alpha-2
    country: str | None = Field(min_length=2, max_length=2, default=None)

    ico: str | None = Field(max_length=20, default=None)
    dic: str | None = Field(max_length=20, default=None)
    vat_payer: bool | None = Field(default=False)

    bank_account: str | None = Field(max_length=34, default=None)
    iban: str | None = Field(max_length=34, default=None)
    currency: str | None = Field(max_length=3, default=None)
    discount_percentage: Decimal | None = Field(default=None)


class ClientUpdate(ClientCreate):
    pass


# ------------------ READ


class DBClientBase(BaseModel):
    model_config = {"from_attributes": True}


class ClientRead(DBClientBase):
    id: int
    name: str
    hourly_rate: Decimal | None
    is_company: bool | None

    street: str | None
    city: str | None
    postal_code: str | None
    # ISO 3166-1 alpha-2
    country: str | None

    ico: str | None
    dic: str | None
    vat_payer: bool | None

    bank_account: str | None
    iban: str | None
    currency: str | None
    discount_percentage: Decimal | None
    created_at: datetime
    updated_at: datetime


class ClientShallow(ClientRead):
    pass
