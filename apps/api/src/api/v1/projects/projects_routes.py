from typing import Annotated

from fastapi import APIRouter, Depends, status
from fastapi_pagination import Page
from sqlalchemy.ext.asyncio.session import AsyncSession

from src.api.v1.projects.projects_schema import (
    ProjectBulkDelete,
    ProjectCreate,
    ProjectRead,
    ProjectUpdate,
)
from src.api.v1.projects.projects_service import ProjectsService
from src.api.v1.workspace.workspace_members_helpers import require_role
from src.api.v1.workspace.workspace_members_models import WorkspaceMember
from src.api.v1.workspace.workspace_members_schemas import WorkspaceRole
from src.api.v1.workspace.workspace_models import Workspace
from src.api.v1.workspace.workspace_utils import get_current_workspace
from src.core.database import get_db

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.get("/", response_model=Page[ProjectRead], tags=["mcp"])
async def get_projects(
    db: Annotated[AsyncSession, Depends(get_db)],
    workspace: Annotated[Workspace, Depends(get_current_workspace)],
    _role: Annotated[WorkspaceMember, Depends(require_role(WorkspaceRole.MEMBER))],
    client_id: int | None = None,
):
    return await ProjectsService.get_projects(db, workspace, client_id)


@router.get("/{id}", response_model=ProjectRead, tags=["mcp"])
async def get_project(
    id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    _role: Annotated[WorkspaceMember, Depends(require_role(WorkspaceRole.MEMBER))],
    workspace: Annotated[Workspace, Depends(get_current_workspace)],
):
    return await ProjectsService.get_project(db, workspace, id)


@router.post(
    "/", status_code=status.HTTP_201_CREATED, response_model=ProjectRead, tags=["mcp"]
)
async def create_project(
    payload: ProjectCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    _role: Annotated[WorkspaceMember, Depends(require_role(WorkspaceRole.ADMIN))],
    workspace: Annotated[Workspace, Depends(get_current_workspace)],
    client_id: int,
):
    return await ProjectsService.create_project(db, workspace, client_id, payload)


@router.put("/{id}", response_model=ProjectRead, tags=["mcp"])
async def update_project(
    id: int,
    payload: ProjectUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    _role: Annotated[WorkspaceMember, Depends(require_role(WorkspaceRole.ADMIN))],
    workspace: Annotated[Workspace, Depends(get_current_workspace)],
    client_id: int,
):
    return await ProjectsService.update_project(db, workspace, client_id, id, payload)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    workspace: Annotated[Workspace, Depends(get_current_workspace)],
    _role: Annotated[WorkspaceMember, Depends(require_role(WorkspaceRole.ADMIN))],
    client_id: int,
):
    return await ProjectsService.delete_project(db, workspace, client_id, id)


@router.delete("/", status_code=status.HTTP_204_NO_CONTENT)
async def bulk_delete(
    body: ProjectBulkDelete,
    db: Annotated[AsyncSession, Depends(get_db)],
    workspace: Annotated[Workspace, Depends(get_current_workspace)],
    _role: Annotated[WorkspaceMember, Depends(require_role(WorkspaceRole.ADMIN))],
    client_id: int,
):
    return await ProjectsService.bulk_delete(db, workspace, client_id, body.ids)
