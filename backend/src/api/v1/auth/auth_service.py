from datetime import timedelta

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio.session import AsyncSession

from src.api.v1.auth.auth_helpers import (
    ACCESS_EXPIRY,
    Token,
    authenticate_user,
    create_access_token,
    hash_password,
)
from src.api.v1.auth.auth_models import User
from src.api.v1.auth.auth_schemas import UserCreate, UserRead


class AuthService:
    # ----------------------------------------------------------------- LOGIN
    @staticmethod
    async def login(db: AsyncSession, username: str, password: str):
        user = await authenticate_user(db, username, password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        access_token_expires = timedelta(minutes=ACCESS_EXPIRY)
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        token_data = Token(access_token=access_token, token_type="bearer")
        return {
            **token_data.model_dump(exclude_unset=True),
            **UserRead(
                id=user.id, email=user.email, country=user.country, name=user.name
            ).model_dump(exclude_unset=True),
        }

    # ----------------------------------------------------------------- REGISTER
    @staticmethod
    async def register(db: AsyncSession, payload: UserCreate):
        rows = await db.execute(select(User).where(User.email == payload.email))
        conflicts = rows.scalars().all()
        if len(conflicts) > 0:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
            )

        pwd = hash_password(payload.password)
        user = User(
            email=payload.email,
            country=payload.country,
            name=payload.name,
            hashed_password=pwd,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user
