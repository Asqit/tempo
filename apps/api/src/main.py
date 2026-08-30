import logging
from contextlib import asynccontextmanager

import httpx
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# from fastapi_mcp import FastApiMCP
from fastapi_pagination import add_pagination

from src.api.middlewares import logging_middleware
from src.api.v1.router import v1
from src.core.logger import configure_logging
from src.core.startup import startup

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.http_client = httpx.AsyncClient(
        base_url="https://verejnerejstriky.msp.gov.cz",
        timeout=httpx.Timeout(10.0),
        headers={
            "Accept": "application/json",
        },
    )

    yield

    await app.state.http_client.aclose()


def create_app() -> FastAPI:
    startup()
    configure_logging()

    app = FastAPI(
        title="TEMPO",
        description="TEMPO | Time tracking & invoicing utility made for modern day",
        lifespan=lifespan,
        version="0.1.0",
    )

    app.include_router(v1)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    _ = add_pagination(app)

    # FastApiMCP package is now incompatible with FastAPI
    # mcp = FastApiMCP(
    #     fastapi=app,
    #     include_tags=["mcp"],
    # )
    # mcp.mount_http()

    return app


app = create_app()
