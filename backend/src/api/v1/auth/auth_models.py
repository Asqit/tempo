from typing import TYPE_CHECKING

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.core.database import Base

if TYPE_CHECKING:
    from src.api.v1.clients.clients_models import Client
    from src.api.v1.projects.projects_models import Project
    from src.api.v1.time_entries.time_entires_models import TimeEntry


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(32))
    email: Mapped[str] = mapped_column(String(32))
    country: Mapped[str] = mapped_column(String())
    hashed_password: Mapped[str] = mapped_column(String(255))

    clients: Mapped[list["Client"]] = relationship(
        back_populates="user", cascade="all, delete-orphan", lazy="selectin"
    )

    projects: Mapped[list["Project"]] = relationship(
        back_populates="user", cascade="all, delete-orphan", lazy="selectin"
    )

    time_entries: Mapped[list["TimeEntry"]] = relationship(
        back_populates="user", cascade="all, delete-orphan", lazy="selectin"
    )
