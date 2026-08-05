from __future__ import annotations

import secrets
from datetime import UTC, datetime, timedelta
from hashlib import sha256
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pwdlib import PasswordHash
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio.session import AsyncSession

from src.api.v1.auth.auth_models import User
from src.core.config import app_config
from src.core.database import get_db

# openssl rand -hex 32
SECRET_KEY = app_config.JWT_SECRET
ALGORITHM = "HS256"
ACCESS_EXPIRY = 30

oauth2_schema = OAuth2PasswordBearer(tokenUrl="auth")


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: str


def hash256_token(token: str) -> str:
    return sha256(token.encode("utf-8")).hexdigest()


def generate_refresh_token():
    raw = secrets.token_urlsafe(64)
    return (
        raw,
        hash256_token(raw),
        datetime.now(UTC) + timedelta(days=30),
    )


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(UTC) + expires_delta
    else:
        expire = datetime.now(UTC) + timedelta(minutes=15)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


password_schema = PasswordHash.recommended()


def verify_password(plain: str, hashed: str) -> bool:
    return password_schema.verify(plain, hashed)


def hash_password(plain: str) -> str:
    return password_schema.hash(plain)


async def authenticate_user(db: AsyncSession, email: str, password: str):
    user = await get_user(db, email)
    if user is None:
        return False

    if not verify_password(password, user.hashed_password):
        return False
    return user


async def get_user(db: AsyncSession, email: str) -> User | None:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def get_current_user(
    db: Annotated[AsyncSession, Depends(get_db)],
    token: Annotated[str, Depends(oauth2_schema)],
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_email = payload.get("sub")
        if user_email is None:
            raise credentials_exception
        token_data = TokenData(email=user_email)
    except jwt.InvalidTokenError:
        raise credentials_exception
    except ValueError:
        raise credentials_exception

    user = await get_user(db, token_data.email)
    if user is None:
        raise credentials_exception
    return user
