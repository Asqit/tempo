from typing import Annotated

from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status
from fastapi.security.oauth2 import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio.session import AsyncSession

from src.api.v1.auth.auth_helpers import get_current_user
from src.api.v1.auth.auth_models import User
from src.api.v1.auth.auth_schemas import LoginResponse, UserCreate, UserRead
from src.api.v1.auth.auth_service import AuthService
from src.core.database import get_db

router = APIRouter(prefix="/auth", tags=["AUTH"])


COOKIE_SETTINGS = {
    "key": "refresh_token",
    "httponly": True,
    "secure": True,
    "samesite": "lax",
    "path": "/auth/refresh",
}


@router.post("/", response_model=LoginResponse)
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Annotated[AsyncSession, Depends(get_db)],
    res: Response,
):
    data = await AuthService.login(db, form_data.username, form_data.password)
    res.set_cookie(value=data["refresh_token"], **COOKIE_SETTINGS)

    return data


@router.post("/new", response_model=UserRead)
async def register(data: UserCreate, db: Annotated[AsyncSession, Depends(get_db)]):
    return await AuthService.register(db, data)


@router.post("/refresh")
async def refresh(
    db: Annotated[AsyncSession, Depends(get_db)],
    res: Response,
    refresh_token: Annotated[str | None, Cookie()] = None,
):
    if refresh_token is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)

    tokens = await AuthService.rotate_refresh_token(db, refresh_token)

    res.set_cookie(value=tokens["refresh_token"], **COOKIE_SETTINGS)

    return {
        "access_token": tokens["access_token"],
        "token_type": "bearer",
    }


@router.delete("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    res: Response,
    refresh_token: Annotated[str | None, Cookie()] = None,
):
    if refresh_token is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)

    await AuthService.revoke_refresh_token(db, refresh_token)

    res.delete_cookie(**COOKIE_SETTINGS)

    return Response(status_code=status.HTTP_204_NO_CONTENT)
