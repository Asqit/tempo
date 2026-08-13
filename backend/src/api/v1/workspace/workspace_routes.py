from typing import Annotated

from fastapi import APIRouter, Depends, status
from fastapi_pagination import Page
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.v1.auth.auth_helpers import get_current_user
from src.api.v1.auth.auth_models import User
from src.api.v1.workspace.workspace_schemas import (
    WorkspaceCreate,
    WorkspaceRead,
    WorkspaceUpdate,
)
from src.api.v1.workspace.workspace_service import WorkspaceService
from src.core.database import get_db

router = APIRouter(prefix="/workspaces", tags=["Workspace"])


@router.post("/", response_model=WorkspaceRead)
async def create_workspace(
    body: WorkspaceCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    return await WorkspaceService.create_workspace(db, current_user.id, body)


@router.get("", response_model=Page[WorkspaceRead])
async def list_workspaces(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    return await WorkspaceService.list_workspaces(db, current_user.id)


@router.get("/{workspace_id}", response_model=WorkspaceRead)
async def get_workspace(
    workspace_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    return await WorkspaceService.get_workspace(db, current_user.id, id)


@router.put("/{workspace_id}", response_model=WorkspaceRead)
async def update_workspace(
    workspace_id: int,
    body: WorkspaceUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    return await WorkspaceService.update_workspace(db, current_user.id, id, body)


@router.delete("/{workspace_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_workspace(
    workspace_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    return await WorkspaceService.delete_workspace(db, current_user.id, id)
