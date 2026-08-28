from typing import Annotated

from fastapi import APIRouter, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.v1.health import health_schemas
from src.api.v1.health.health_service import HealthService
from src.core.database import get_db

router = APIRouter(prefix="/health")


@router.get("/live", response_model=health_schemas.LiveCheck)
async def live_check() -> health_schemas.LiveCheck:
    return await HealthService.get_live_check()


@router.get("/status")
async def db_stat(
    res: Response, db: Annotated[AsyncSession, Depends(get_db)]
) -> health_schemas.DbStat:
    stats = await HealthService.get_db_stat(db)
    if stats.status != "ok":
        res.status_code = 503
        return stats

    res.status_code = 200
    return stats
