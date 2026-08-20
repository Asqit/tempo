from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Numeric, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.core.database import Base


class ReportClientSnapshot(Base):
    """Frozen client data at report generation time. 1:1 with Report."""

    __tablename__ = "report_client_snapshots"

    id: Mapped[int] = mapped_column(primary_key=True)
    report_id: Mapped[int] = mapped_column(
        ForeignKey("reports.id", ondelete="CASCADE"), unique=True
    )
    name: Mapped[str] = mapped_column(String(30))
    hourly_rate: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    currency: Mapped[str] = mapped_column(String(3))


class ReportProjectSnapshot(Base):
    """Frozen project data at report generation time. 1:1 with Report."""

    __tablename__ = "report_project_snapshots"

    id: Mapped[int] = mapped_column(primary_key=True)
    report_id: Mapped[int] = mapped_column(
        ForeignKey("reports.id", ondelete="CASCADE"), unique=True
    )
    name: Mapped[str] = mapped_column(String(100))
    # add more frozen Project fields here if Project has them (e.g. rate override)


class ReportEntrySnapshot(Base):
    """Frozen snapshot of a single time entry."""

    __tablename__ = "report_entry_snapshots"

    id: Mapped[int] = mapped_column(primary_key=True)
    report_id: Mapped[int] = mapped_column(ForeignKey("reports.id", ondelete="CASCADE"))
    time_entry_id: Mapped[int | None] = mapped_column(
        ForeignKey("time_entries.id", ondelete="SET NULL"), nullable=True
    )
    duration_minutes: Mapped[int] = mapped_column()
    description: Mapped[str] = mapped_column(String(256))
    logged_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    # denormalized text — entry-level client/project may differ from report's primary one
    client_name: Mapped[str | None] = mapped_column(String(30), nullable=True)
    project_name: Mapped[str | None] = mapped_column(String(100), nullable=True)


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[int] = mapped_column(primary_key=True)
    period_start: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    period_end: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    name: Mapped[str] = mapped_column(String(100))
    description: Mapped[str] = mapped_column(String(64))
    uuid: Mapped[uuid.UUID | None] = mapped_column(
        Uuid,
        default=None,
        nullable=True,
        unique=True,
    )

    workspace_id: Mapped[int] = mapped_column(
        ForeignKey("workspaces.id", ondelete="CASCADE")
    )

    # weak live refs — nulled if source deleted, snapshots below keep the real data
    client_id: Mapped[int | None] = mapped_column(
        ForeignKey("clients.id", ondelete="SET NULL"), nullable=True
    )
    project_id: Mapped[int | None] = mapped_column(
        ForeignKey("projects.id", ondelete="SET NULL"), nullable=True
    )

    client_snapshot: Mapped[ReportClientSnapshot | None] = relationship(
        cascade="all, delete-orphan", uselist=False, lazy="selectin"
    )
    project_snapshot: Mapped[ReportProjectSnapshot | None] = relationship(
        cascade="all, delete-orphan", uselist=False, lazy="selectin"
    )
    snapshots: Mapped[list[ReportEntrySnapshot]] = relationship(
        cascade="all, delete-orphan", lazy="selectin"
    )
