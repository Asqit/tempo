from fastapi import APIRouter, Depends
from typing import Annotated
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi_pagination import Page

from src.api.v1.auth.auth_helpers import get_current_user
from src.api.v1.auth.auth_models import User
from src.core.database import get_db
from .notifications_schemas import NotificationRead
from .notifications_service import NotificationsService

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("/", response_model=Page[NotificationRead])
async def get_all_notifications(
  current_user: Annotated[User, Depends(get_current_user)],
  db: Annotated[AsyncSession, Depends(get_db)]
):
  return await NotificationsService.get_notifications()


@router.put("/{id}/read")
async def read_notification(
  id: int,
  current_user: Annotated[User, Depends(get_current_user)],
  db: Annotated[AsyncSession, Depends(get_db)]
):
  return await NotificationsService.read_notification()
