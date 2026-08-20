from __future__ import annotations

from sqlalchemy import ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.api.v1.auth.auth_models import User
from src.api.v1.workspace.workspace_models import Workspace
from src.core.database import Base

class WorkspaceMembers(Base):
    __tablename__ = "workspace_members"
    __table_args__ = (UniqueConstraint("user_id", "workspace_id"),)

    id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    user: Mapped[User] = relationship(back_populates="workspace_accesses", lazy="selectin")

    workspace_id: Mapped[int] = mapped_column(ForeignKey("workspaces.id", ondelete="CASCADE"))
    workspace: Mapped[Workspace] = relationship(back_populates="members", lazy="selectin")

    role: Mapped[str] = mapped_column(String(32), default="member")
