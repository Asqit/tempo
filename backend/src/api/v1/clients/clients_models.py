from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import mapped_column, relationship
from sqlalchemy.orm.base import Mapped

if TYPE_CHECKING:
    from src.api.v1.projects.projects_models import Project
    from src.api.v1.time_entries.time_entires_models import TimeEntry
    from src.api.v1.workspace.workspace_models import Workspace
from src.core.database import Base


class Client(Base):
    __tablename__ = "clients"
    __table_args__ = (UniqueConstraint("workspace_id", "name"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(30))

    # belong to a workspace (DB-level ON DELETE CASCADE)
    workspace_id: Mapped[int] = mapped_column(
        ForeignKey("workspaces.id", ondelete="CASCADE")
    )
    workspace: Mapped[Workspace] = relationship(
        back_populates="clients", lazy="selectin"
    )

    # project-not-assigned entries (think temporary)
    time_entries: Mapped[list[TimeEntry]] = relationship(
        back_populates="client",
        lazy="selectin",
        passive_deletes=True,
    )

    projects: Mapped[list[Project]] = relationship(
        back_populates="client",
        lazy="selectin",
        # DB-level ON DELETE CASCADE is used on Project.client_id; keep passive_deletes
        passive_deletes=True,
    )
