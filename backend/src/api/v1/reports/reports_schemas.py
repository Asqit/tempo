from datetime import datetime

from pydantic import BaseModel, Field


class CreateReport(BaseModel):
    period_start: datetime
    period_end: datetime
    client_id: int | None = Field(default=None)
    project_id: int | None = Field(default=None)
    billable: bool | None = Field(default=None)
