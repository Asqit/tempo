from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi.security.oauth2 import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio.session import AsyncSession

from src.api.v1.auth.auth_schemas import LoginResponse, UserCreate, UserRead
from src.api.v1.auth.auth_service import AuthService
from src.core.database import get_db

router = APIRouter(prefix="/auth", tags=["AUTH"])


@router.post("/", response_model=LoginResponse)
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    return await AuthService.login(db, form_data.username, form_data.password)


@router.post("/new", response_model=UserRead)
async def register(data: UserCreate, db: Annotated[AsyncSession, Depends(get_db)]):
    return await AuthService.register(db, data)
