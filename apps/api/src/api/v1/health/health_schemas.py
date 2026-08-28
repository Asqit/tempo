from typing import Literal

from pydantic import BaseModel


class LiveCheck(BaseModel):
    status: Literal["ok"] = "ok"


class DbStat(BaseModel):
    status: Literal["ok", "unavailable"]
