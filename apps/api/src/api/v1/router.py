from fastapi import APIRouter

from src.api.v1.auth import auth_routes
from src.api.v1.clients import clients_routes
from src.api.v1.health import health_routes
from src.api.v1.notifications import notifications_routes
from src.api.v1.projects import projects_routes, projects_schema
from src.api.v1.reports import reports_routes
from src.api.v1.time_entries import time_entries_routes
from src.api.v1.workspace import workspace_routes

v1 = APIRouter(prefix="/api/v1")


projects_schema.ProjectRead.model_rebuild()

v1.include_router(health_routes.router)
v1.include_router(auth_routes.router)
v1.include_router(clients_routes.router)
v1.include_router(projects_routes.router)
v1.include_router(time_entries_routes.router)
v1.include_router(workspace_routes.router)
v1.include_router(reports_routes.router)
v1.include_router(notifications_routes.router)
