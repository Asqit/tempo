from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import mapped_column, relationship
from sqlalchemy.orm.base import Mapped

if TYPE_CHECKING:
    from src.api.v1.auth.auth_models import User
    from src.api.v1.projects.projects_models import Project
from src.core.database import Base


class Client(Base):
    __tablename__ = "clients"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(30))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

    user: Mapped["User"] = relationship(back_populates="clients", lazy="selectin")
    projects: Mapped[list["Project"]] = relationship(
        back_populates="client", cascade="all, delete-orphan", lazy="selectin"
    )
