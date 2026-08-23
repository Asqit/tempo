from datetime import UTC, datetime

from fastapi import HTTPException, status
from fastapi_pagination.ext.sqlalchemy import paginate
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.v1.notifications.notifications_models import Notification


class NotificationsService:
    @staticmethod
    async def get_notifications(db: AsyncSession, user_id: int, unread: bool = False):
        filters = [Notification.user_id == user_id]
        if unread:
            filters.append(Notification.read_at.is_(None))

        return await paginate(db, select(Notification).where(*filters))

    @staticmethod
    async def read_notification(db: AsyncSession, user_id: int, id: int):
        result = await db.get(Notification, id)
        if result is None or result.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT)

        result.read_at = datetime.now(UTC)
        await db.commit()

    @staticmethod
    async def create_notification():
        pass
