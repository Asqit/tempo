from typing import Annotated

from fastapi import APIRouter, Depends, status
from fastapi_pagination import Page
from sqlalchemy.ext.asyncio.session import AsyncSession

from src.api.v1.auth.auth_helpers import get_current_user
from src.api.v1.auth.auth_models import User
from src.api.v1.projects.projects_schema import (
    ProjectBulkDelete,
    ProjectCreate,
    ProjectRead,
    ProjectUpdate,
)
from src.api.v1.projects.projects_service import ProjectsService
from src.core.database import get_db

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.get("/", response_model=Page[ProjectRead])
async def get_projects(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    client_id: int | None = None,
):
    return await ProjectsService.get_projects(db, current_user.id, client_id)


@router.get("/{id}", response_model=ProjectRead)
async def get_project(
    id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    return await ProjectsService.get_project(db, current_user.id, id)


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=ProjectRead)
async def create_project(
    payload: ProjectCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    return await ProjectsService.create_project(db, current_user.id, payload)


@router.put("/{id}", response_model=ProjectRead)
async def update_project(
    id: int,
    payload: ProjectUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    return await ProjectsService.update_project(db, current_user.id, id, payload)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    return await ProjectsService.delete_project(db, current_user.id, id)


@router.delete("/", status_code=status.HTTP_204_NO_CONTENT)
async def bulk_delete(
    body: ProjectBulkDelete,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    return await ProjectsService.bulk_delete(db, current_user.id, body.ids)
