from pydantic import BaseModel
from .notifications_models import NotificationType
from datetime import datetime

class DBNotification(BaseModel):
  model_config = {"from_attributes": True}


class NotificationRead(DBNotification):
  id: int
  user_id: int
  type: NotificationType
  payload: dict
  read_at: datetime
