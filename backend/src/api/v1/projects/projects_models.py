from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import mapped_column, relationship
from sqlalchemy.orm.base import Mapped

if TYPE_CHECKING:
    from src.api.v1.auth.auth_models import User
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

    client_id: Mapped[int | None] = mapped_column(ForeignKey("clients.id"))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

    user: Mapped["User"] = relationship(back_populates="projects")
    client: Mapped[Optional["Client"]] = relationship(
        back_populates="projects", lazy="selectin"
    )
    time_entries: Mapped[list["TimeEntry"]] = relationship(
        back_populates="project",
        lazy="selectin",
        cascade="all, delete-orphan",  # ORM manipulations
        passive_deletes=True,
    )
