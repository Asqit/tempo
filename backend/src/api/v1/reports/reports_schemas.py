from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field


class CreateReport(BaseModel):
    name: str = Field(max_length=100)
    description: str = Field(max_length=64)
    period_start: datetime
    period_end: datetime
    client_id: int | None = Field(default=None)
    project_id: int | None = Field(default=None)
    billable: bool | None = Field(default=None)


class DBReportBase(BaseModel):
    model_config = {"from_attributes": True}


class ReportClientSnapshot(DBReportBase):
    name: str
    hourly_rate: Decimal | None
    currency: str


class ReportProjectSnapshot(DBReportBase):
    name: str


class ReportEntrySnapshot(DBReportBase):
    id: int
    report_id: int
    time_entry_id: int | None
    duration_minutes: int
    description: str
    logged_at: datetime
    client_name: str | None
    project_name: str | None


class ReportRead(DBReportBase):
    id: int
    period_start: datetime
    period_end: datetime
    name: str
    description: str
    workspace_id: int
    client_snapshot: ReportClientSnapshot | None
    project_snapshot: ReportProjectSnapshot | None
    snapshots: list[ReportEntrySnapshot]
