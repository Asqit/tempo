from typing import Annotated

from fastapi import APIRouter, Depends, status
from fastapi_pagination import Page
from sqlalchemy.ext.asyncio.session import AsyncSession

from src.api.utils.justice_registry import (
    JusticeRegistryClient,
    get_justice_registry_client,
)
from src.api.v1.auth.auth_helpers import get_current_user
from src.api.v1.auth.auth_models import User
from src.api.v1.clients.clients_schemas import ClientCreate, ClientRead, ClientUpdate
from src.api.v1.clients.clients_service import ClientsService
from src.api.v1.workspace.workspace_members_helpers import require_role
from src.api.v1.workspace.workspace_members_models import WorkspaceMember
from src.api.v1.workspace.workspace_members_schemas import WorkspaceRole
from src.api.v1.workspace.workspace_models import Workspace
from src.api.v1.workspace.workspace_utils import get_current_workspace
from src.core.database import get_db

router = APIRouter(prefix="/clients", tags=["Clients"])


@router.get("/justice-search")
async def search_client_company(
    query: str,
    # _: Annotated[User, Depends(get_current_user)],
    justice: Annotated[JusticeRegistryClient, Depends(get_justice_registry_client)],
):
    return await justice.search(query)


@router.get("/")
async def get_clients(
    workspace: Annotated[Workspace, Depends(get_current_workspace)],
    _role: Annotated[WorkspaceMember, Depends(require_role(WorkspaceRole.MEMBER))],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Page[ClientRead]:
    return await ClientsService.get_all_clients(db, workspace)


@router.get("/{id}", response_model=ClientRead)
async def get_client(
    id: int,
    workspace: Annotated[Workspace, Depends(get_current_workspace)],
    _role: Annotated[WorkspaceMember, Depends(require_role(WorkspaceRole.MEMBER))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    return await ClientsService.get_client(db, id, workspace)


@router.post("/", response_model=ClientRead, status_code=status.HTTP_201_CREATED)
async def create_client(
    payload: ClientCreate,
    workspace: Annotated[Workspace, Depends(get_current_workspace)],
    _role: Annotated[WorkspaceMember, Depends(require_role(WorkspaceRole.ADMIN))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    return await ClientsService.create_client(db, payload, workspace)


@router.put("/{id}", response_model=ClientRead)
async def update_client(
    id: int,
    payload: ClientUpdate,
    workspace: Annotated[Workspace, Depends(get_current_workspace)],
    _role: Annotated[WorkspaceMember, Depends(require_role(WorkspaceRole.ADMIN))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    return await ClientsService.update_client(db, id, payload, workspace)


@router.delete("/{id}")
async def delete_client(
    id: int,
    _role: Annotated[WorkspaceMember, Depends(require_role(WorkspaceRole.ADMIN))],
    workspace: Annotated[Workspace, Depends(get_current_workspace)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    return await ClientsService.delete_client(db, id, workspace)
