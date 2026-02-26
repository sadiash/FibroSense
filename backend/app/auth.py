from datetime import datetime, timedelta, timezone

import bcrypt
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_session
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode(), hashed_password.encode())


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def create_access_token(user_id: int, email: str) -> str:
    payload = {
        "sub": str(user_id),
        "email": email,
        "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes),
    }
    return jwt.encode(payload, settings.secret_key, algorithm=settings.jwt_algorithm)


def create_refresh_token(user_id: int) -> str:
    payload = {
        "sub": str(user_id),
        "type": "refresh",
        "exp": datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_expire_days),
    }
    return jwt.encode(payload, settings.secret_key, algorithm=settings.jwt_algorithm)


def decode_token(token: str) -> dict:
    return jwt.decode(token, settings.secret_key, algorithms=[settings.jwt_algorithm])


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: AsyncSession = Depends(get_session),
) -> User:
    credentials_exception = HTTPException(
        status_code=401,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_token(token)
        if payload.get("type") != "access":
            raise credentials_exception
        user_id = int(payload["sub"])
    except (JWTError, KeyError, ValueError):
        raise credentials_exception

    user = await session.get(User, user_id)
    if not user or not user.is_active:
        raise credentials_exception
    return user
