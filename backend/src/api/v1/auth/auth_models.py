from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.core.database import Base

if TYPE_CHECKING:
    from src.api.v1.clients.clients_models import Client
    from src.api.v1.projects.projects_models import Project
    from src.api.v1.time_entries.time_entires_models import TimeEntry


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

    clients: Mapped[list["Client"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )

    projects: Mapped[list["Project"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )

    time_entries: Mapped[list["TimeEntry"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
