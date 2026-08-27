from contextlib import asynccontextmanager
from datetime import datetime
from typing import Any, AsyncGenerator

from sqlalchemy import DateTime, func
from sqlalchemy.ext.asyncio import (
    AsyncAttrs,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

from src.core.config import app_config

engine = create_async_engine(app_config.get_pg_db_url())
async_session_maker = async_sessionmaker(engine)


@asynccontextmanager
async def get_session() -> AsyncGenerator[AsyncSession, Any]:
    async with async_session_maker() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise


async def get_db() -> AsyncGenerator[AsyncSession, Any]:
    async with get_session() as session:
        yield session


class Base(AsyncAttrs, DeclarativeBase):
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        server_onupdate=func.now(),
        onupdate=func.now(),
    )


from src.api.v1.auth import auth_models  # noqa: F401
from src.api.v1.clients import clients_models  # noqa: F401
from src.api.v1.notifications import notifications_models  # noqa: F401
from src.api.v1.projects import projects_models  # noqa: F401
from src.api.v1.reports import reports_models  # noqa: F401
from src.api.v1.time_entries import time_entires_models  # noqa: F401
from src.api.v1.workspace import (  # noqa: F401
    workspace_members_models,
    workspace_models,
)
