from decimal import Decimal

from pydantic import BaseModel, Field


class IssuedInvoiceItemCreate(BaseModel):
    name: str = Field(max_length=255)
    unit_price: Decimal = Field(ge=0, decimal_places=2)
    amount: Decimal = Field(default=1, gt=0, decimal_places=2)
    vat_rate: Decimal = Field(default=21, ge=0, le=100, decimal_places=2)


class DBInvoiceItem(BaseModel):
    model_config = {"from_attributes": True}


class IssuedInvoiceItemRead(DBInvoiceItem):
    id: int
    name: str
    unit_price: Decimal
    amount: Decimal
    vat_rate: Decimal
