from datetime import datetime

from pydantic import BaseModel, Field, model_validator

from src.api.v1.invoices.schemas.issued_invoice_item import (
    IssuedInvoiceItemCreate,
    IssuedInvoiceItemRead,
)


class IssuedInvoiceCreate(BaseModel):
    client_id: int
    number_series_id: int | None = None  # None = použij výchozí řadu workspace
    date_issue: datetime
    date_taxing: datetime
    date_maturity: datetime
    items: list[IssuedInvoiceItemCreate] = Field(min_length=1)

    @model_validator(mode="after")
    def check_dates(self) -> "IssuedInvoiceCreate":
        if self.date_maturity < self.date_issue:
            raise ValueError("date_maturity nesmí být dřív než date_issue")
        return self


class DBInvoice(BaseModel):
    model_config = {"from_attributes": True}


class IssuedInvoiceRead(DBInvoice):
    id: int
    document_number: str
    client_id: int
    date_issue: datetime
    date_taxing: datetime
    date_maturity: datetime
    items: list[IssuedInvoiceItemRead]
