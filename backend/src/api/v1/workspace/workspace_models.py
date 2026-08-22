from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.api.v1.clients.clients_models import Client
from src.api.v1.time_entries.time_entires_models import TimeEntry
from src.api.v1.workspace_members.workspace_members_models import WorkspaceMembers
from src.core.database import Base

if TYPE_CHECKING:
    from src.api.v1.auth.auth_models import User


class Workspace(Base):
    __tablename__ = "workspaces"
    __table_args__ = (UniqueConstraint("user_id", "name"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(32))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    user: Mapped[User] = relationship(back_populates="workspaces", lazy="selectin")

    members: Mapped[list[WorkspaceMembers]] = relationship(
        back_populates="workspace", lazy="selectin"
    )

    clients: Mapped[list[Client]] = relationship(
        back_populates="workspace", cascade="all, delete-orphan", lazy="selectin"
    )

    time_entries: Mapped[list[TimeEntry]] = relationship(
        back_populates="workspace", cascade="all, delete-orphan", lazy="selectin"
    )
