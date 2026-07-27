from fastapi import HTTPException, status
from fastapi_pagination import Page
from fastapi_pagination.ext.sqlalchemy import paginate
from sqlalchemy import select
from sqlalchemy.ext.asyncio.session import AsyncSession

from src.api.v1.clients.clients_models import Client
from src.api.v1.clients.clients_schemas import ClientCreate, ClientPartial, ClientRead


class ClientsService:
    @staticmethod
    async def get_client(db: AsyncSession, id: int, user_id: int):
        client = await db.get(Client, id)
        if client is None or client.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
        return client

    @staticmethod
    async def get_all_clients(db: AsyncSession, user_id: int) -> Page[ClientRead]:
        return await paginate(
            db,
            select(Client).where(Client.user_id == user_id).order_by(Client.created_at),
        )

    @staticmethod
    async def create_client(db: AsyncSession, payload: ClientCreate, user_id: int):
        conflicting_rows = await db.execute(
            select(Client).where(Client.name == payload.name, Client.user_id == user_id)
        )
        conflicts = conflicting_rows.scalars().all()

        if len(conflicts) > 0:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT)

        new_client = Client(name=payload.name, user_id=user_id)
        db.add(new_client)
        await db.commit()
        await db.refresh(new_client)
        return new_client

    @staticmethod
    async def delete_client(db: AsyncSession, id: int, user_id: int):
        client = await db.get(Client, id)
        if client is None or client.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
        await db.delete(client)
        await db.commit()
        return id

    @staticmethod
    async def update_client(
        db: AsyncSession, id: int, payload: ClientPartial, user_id: int
    ):
        client = await db.get(Client, id)
        if client is None or client.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
        if payload.name:
            client.name = payload.name
        await db.commit()
        await db.refresh(client)
        return client
