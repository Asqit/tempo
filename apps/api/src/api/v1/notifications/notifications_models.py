import enum
from datetime import datetime

from sqlalchemy import JSON, DateTime, Enum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from src.core.database import Base


class NotificationType(str, enum.Enum):
    WORKSPACE_INVITE = "workspace_invite"
    WORKSPACE_INVITE_ACCEPTED = "workspace_invite_accepted"
    WORKSPACE_REMOVED = "workspace_removed"
    WORKSPACE_ROLE_CHANGED = "workspace_role_changed"
    WORKSPACE_LEFT = "workspace_left"


class Notification(Base):
    __tablename__ = "notifications"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    type: Mapped[NotificationType] = mapped_column(Enum(NotificationType))
    payload: Mapped[dict] = mapped_column(JSON)
    read_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True, default=None
    )
