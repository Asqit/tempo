import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi_pagination import add_pagination

from src.api.middlewares import logging_middleware
from src.api.v1.router import v1
from src.core.logger import configure_logging

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI):
    # init;;;;;;;;
    #
    yield
    # de-init


def create_app() -> FastAPI:
    configure_logging()
    app = FastAPI(
        title="Tick-API",
        description="Tick API - Time tracking & invoicing utility",
        lifespan=lifespan,
        version="0.1.0",
    )

    app.include_router(v1)
    app.add_middleware(logging_middleware.LoggingMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:5173",
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    add_pagination(app)

    return app


app = create_app()
