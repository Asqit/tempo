from typing import Annotated

from fastapi import APIRouter, Depends, status
from fastapi_pagination import Page
from sqlalchemy.ext.asyncio.session import AsyncSession

from src.api.v1.auth.auth_helpers import get_current_user
from src.api.v1.auth.auth_models import User
from src.api.v1.clients.clients_schemas import ClientCreate, ClientRead, ClientUpdate
from src.api.v1.clients.clients_service import ClientsService
from src.core.database import get_db

router = APIRouter(prefix="/clients", tags=["Clients"])


@router.get("/")
async def get_clients(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> Page[ClientRead]:
    return await ClientsService.get_all_clients(db, current_user.id)


@router.get("/{id}", response_model=ClientRead)
async def get_client(
    id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    return await ClientsService.get_client(db, id, current_user.id)


@router.post("/", response_model=ClientRead, status_code=status.HTTP_201_CREATED)
async def create_client(
    payload: ClientCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    return await ClientsService.create_client(db, payload, current_user.id)


@router.put("/{id}", response_model=ClientRead)
async def update_client(
    id: int,
    payload: ClientUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    return await ClientsService.update_client(db, id, payload, current_user.id)


@router.delete("/{id}")
async def delete_client(
    id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    return await ClientsService.delete_client(db, id, current_user.id)
