from fastapi import APIRouter

from src.api.v1.auth import auth_routes
from src.api.v1.clients import clients_routes
from src.api.v1.health import health_routes
from src.api.v1.projects import projects_routes
from src.api.v1.time_entries import time_entries_routes

v1 = APIRouter(prefix="/api/v1")


v1.include_router(health_routes.router)
v1.include_router(auth_routes.router)
v1.include_router(clients_routes.router)
v1.include_router(projects_routes.router)
v1.include_router(time_entries_routes.router)
