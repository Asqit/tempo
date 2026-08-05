from datetime import UTC, datetime, timedelta

from fastapi import HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio.session import AsyncSession

from src.api.v1.auth.auth_helpers import (
    ACCESS_EXPIRY,
    Token,
    authenticate_user,
    create_access_token,
    generate_refresh_token,
    hash256_token,
    hash_password,
)
from src.api.v1.auth.auth_models import RefreshToken, User
from src.api.v1.auth.auth_schemas import UserCreate


class AuthService:
    @staticmethod
    async def _store_refresh_token(db: AsyncSession, user_id: int):
        raw_token, token_hash, expires_at = generate_refresh_token()
        db.add(
            RefreshToken(user_id=user_id, token_hash=token_hash, expires_at=expires_at)
        )
        return raw_token

    @staticmethod
    async def rotate_refresh_token(db: AsyncSession, raw_token: str):
        token_hash = hash256_token(raw_token)

        result = await db.execute(
            select(RefreshToken)
            .where(
                RefreshToken.token_hash == token_hash,
                RefreshToken.expires_at >= datetime.now(UTC),
                RefreshToken.revoked_at.is_(None),
            )
            .limit(1)
        )

        old_refresh_token = result.scalar_one_or_none()

        if old_refresh_token is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
            )

        user = await db.get(User, old_refresh_token.user_id)

        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User no longer exists",
            )

        # revoke old token
        old_refresh_token.revoked_at = datetime.now(UTC)

        # create new refresh token
        new_raw_token, new_token_hash, expires_at = generate_refresh_token()

        db.add(
            RefreshToken(
                user_id=user.id,
                token_hash=new_token_hash,
                expires_at=expires_at,
            )
        )

        # create new access token
        access_token = create_access_token(
            data={"sub": user.email},
            expires_delta=timedelta(minutes=ACCESS_EXPIRY),
        )

        # one transaction
        await db.commit()

        return {
            "access_token": access_token,
            "refresh_token": new_raw_token,
        }

    @staticmethod
    async def revoke_refresh_token(db: AsyncSession, raw_token: str):
        token_hash = hash256_token(raw_token)
        await db.execute(
            update(RefreshToken)
            .where(RefreshToken.token_hash == token_hash)
            .values(revoked_at=datetime.now(UTC))
        )

        await db.commit()

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

        refresh_token = await AuthService._store_refresh_token(db, user.id)
        await db.commit()
        await db.refresh(user)
        token_data = Token(access_token=access_token, token_type="bearer")
        return {"token": token_data, "user": user, "refresh_token": refresh_token}

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
