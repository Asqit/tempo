from time import perf_counter

from fastapi import Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from . import health_schemas


class HealthService:
    @staticmethod
    async def get_live_check() -> health_schemas.LiveCheck:
        return health_schemas.LiveCheck()

    @staticmethod
    async def get_db_stat(db: AsyncSession) -> health_schemas.DbStat:
        try:
            await db.execute(text("SELECT 1"))
            return health_schemas.DbStat(status="ok")
        except Exception:
            return health_schemas.DbStat(status="unavailable")
