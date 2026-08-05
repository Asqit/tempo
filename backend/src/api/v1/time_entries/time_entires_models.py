from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from src.api.v1.auth.auth_models import User
    from src.api.v1.clients.clients_models import Client
    from src.api.v1.projects.projects_models import Project
from src.core.database import Base


class TimeEntry(Base):
    __tablename__ = "time_entries"

    id: Mapped[int] = mapped_column(primary_key=True)
    description: Mapped[str | None] = mapped_column(String(64))
    start_time: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    end_time: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), default=None
    )

    project_id: Mapped[int | None] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE")
    )
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    client_id: Mapped[int | None] = mapped_column(ForeignKey("clients.id"))

    client: Mapped[Client | None] = relationship(back_populates="time_entries")
    user: Mapped[User] = relationship(back_populates="time_entries")
    project: Mapped[Project | None] = relationship(
        back_populates="time_entries", lazy="selectin"
    )
