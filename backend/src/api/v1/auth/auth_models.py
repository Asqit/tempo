from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.api.v1.workspace.workspace_models import Workspace
from src.api.v1.workspace_members.workspace_members_models import WorkspaceMembers
from src.core.database import Base


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"
    id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )

    token_hash: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)

    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )

    revoked_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(32))
    email: Mapped[str] = mapped_column(String(32))
    country: Mapped[str] = mapped_column(String())
    hashed_password: Mapped[str] = mapped_column(String(255))

    workspaces: Mapped[list[Workspace]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )

    workspace_accesses: Mapped[list[WorkspaceMembers]] = relationship(
        back_populates="user", lazy="selectin"
    )
