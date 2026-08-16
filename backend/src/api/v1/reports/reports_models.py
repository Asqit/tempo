from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.core.database import Base


class ReportEntrySnapshot(Base):
    """A Freeze snapshot table for each report. This will keep data even though original time-entries may be gone"""

    __tablename__ = "report_entry_snapshots"

    id: Mapped[int] = mapped_column(primary_key=True)

    # Parent report — cascade delete snapshots with report
    report_id: Mapped[int] = mapped_column(ForeignKey("reports.id", ondelete="CASCADE"))

    # Nullable FK — keeps snapshot alive even if original entry is deleted
    time_entry_id: Mapped[int | None] = mapped_column(
        ForeignKey("time_entries.id", ondelete="SET NULL"), nullable=True
    )

    # Frozen fields copied at report generation time
    duration_minutes: Mapped[int]
    description: Mapped[str] = mapped_column(String(256))
    logged_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[int] = mapped_column(primary_key=True)

    # User's period span selection (duration he is reporting)
    period_start: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    period_end: Mapped[datetime] = mapped_column(DateTime(timezone=True))

    # Metadata
    name: Mapped[str] = mapped_column(String(32))
    description: Mapped[str] = mapped_column(String(64))

    workspace_id: Mapped[int] = mapped_column(
        ForeignKey("workspaces.id", ondelete="CASCADE")
    )

    # Possible relation to client
    # When bound to client, report only client's time
    # SET NULL on delete to keep historic reports
    client_id: Mapped[int | None] = mapped_column(
        ForeignKey("clients.id", ondelete="SET NULL"), nullable=True
    )

    # Frozen snapshots — immutable at generation time
    snapshots: Mapped[list[ReportEntrySnapshot]] = relationship(
        cascade="all, delete-orphan"
    )
