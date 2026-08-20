from backend.src.core.database import Base
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, JSON, ForeignKey, func, Enum
from datetime import datetime

import enum

class NotificationType(str, enum.Enum):
    WORKSPACE_INVITE = "workspace_invite"
    WORKSPACE_REMOVED = "workspace_removed"


class Notification(Base):
    __tablename__ = "notifications"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    type: Mapped[NotificationType] = mapped_column(Enum(NotificationType))
    payload: Mapped[dict] = mapped_column(JSON)
    read_at: Mapped[datetime | None]
