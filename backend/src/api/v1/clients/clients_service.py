from fastapi import HTTPException, status
from fastapi_pagination import Page
from fastapi_pagination.ext.sqlalchemy import paginate
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.v1.clients.clients_models import Client
from src.api.v1.clients.clients_schemas import ClientCreate, ClientRead, ClientUpdate
from src.api.v1.workspace.workspace_models import Workspace


class ClientsService:
    @staticmethod
    async def get_client(
        db: AsyncSession,
        id: int,
        workspace: Workspace,
    ) -> Client:
        client = await db.scalar(
            select(Client).where(
                Client.id == id,
                Client.workspace_id == workspace.id,
            )
        )

        if client is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

        return client

    @staticmethod
    async def get_all_clients(
        db: AsyncSession,
        workspace: Workspace,
    ) -> Page[ClientRead]:
        return await paginate(
            db,
            select(Client)
            .where(Client.workspace_id == workspace.id)
            .order_by(Client.created_at),
        )

    @staticmethod
    async def create_client(
        db: AsyncSession,
        payload: ClientCreate,
        workspace: Workspace,
    ) -> Client:
        conflict = await db.scalar(
            select(Client).where(
                Client.workspace_id == workspace.id,
                Client.name == payload.name,
            )
        )

        if conflict:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT)

        new_client = Client(
            name=payload.name,
            workspace_id=workspace.id,
        )

        db.add(new_client)
        await db.commit()
        await db.refresh(new_client)

        return new_client

    @staticmethod
    async def delete_client(
        db: AsyncSession,
        id: int,
        workspace: Workspace,
    ) -> None:
        client = await db.scalar(
            select(Client).where(
                Client.id == id,
                Client.workspace_id == workspace.id,
            )
        )

        if client is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

        await db.delete(client)
        await db.commit()

    @staticmethod
    async def update_client(
        db: AsyncSession,
        id: int,
        payload: ClientUpdate,
        workspace: Workspace,
    ) -> Client:
        client = await db.scalar(
            select(Client).where(
                Client.id == id,
                Client.workspace_id == workspace.id,
            )
        )

        if client is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

        if payload.name is not None:
            client.name = payload.name

        await db.commit()
        await db.refresh(client)

        return client
