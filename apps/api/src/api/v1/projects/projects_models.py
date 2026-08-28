from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import mapped_column, relationship
from sqlalchemy.orm.base import Mapped

if TYPE_CHECKING:
    from src.api.v1.clients.clients_models import Client
    from src.api.v1.time_entries.time_entires_models import TimeEntry
from src.core.database import Base


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(30))
    description: Mapped[str | None] = mapped_column(String(128))
    start_time: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    end_time: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    # Deleting a client should remove its projects at the DB level
    client_id: Mapped[int] = mapped_column(
        ForeignKey("clients.id", ondelete="CASCADE"), nullable=False
    )
    client: Mapped[Client] = relationship(back_populates="projects", lazy="selectin")

    # Deleting a project should NOT delete time entries; the FK uses ON DELETE SET NULL
    time_entries: Mapped[list[TimeEntry]] = relationship(
        back_populates="project",
        lazy="selectin",
        passive_deletes=True,
    )
