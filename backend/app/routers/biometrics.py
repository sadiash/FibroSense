from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_user
from app.database import get_session
from app.models.biometric import BiometricReading
from app.models.user import User
from app.schemas.biometric import BiometricReadingCreate, BiometricReadingResponse

router = APIRouter(prefix="/api/biometrics", tags=["biometrics"])


@router.get("", response_model=list[BiometricReadingResponse])
async def list_biometrics(
    start_date: str | None = Query(None),
    end_date: str | None = Query(None),
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> list[BiometricReading]:
    stmt = (
        select(BiometricReading)
        .where(BiometricReading.user_id == current_user.id)
        .order_by(BiometricReading.date.desc())
    )
    if start_date:
        stmt = stmt.where(BiometricReading.date >= start_date)
    if end_date:
        stmt = stmt.where(BiometricReading.date <= end_date)
    result = await session.execute(stmt)
    return list(result.scalars().all())


@router.get("/{date}", response_model=BiometricReadingResponse)
async def get_biometric(
    date: str,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> BiometricReading:
    reading = await session.get(BiometricReading, (current_user.id, date))
    if not reading:
        raise HTTPException(status_code=404, detail="Biometric reading not found")
    return reading


@router.post("", response_model=BiometricReadingResponse, status_code=201)
async def upsert_biometric(
    data: BiometricReadingCreate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> BiometricReading:
    existing = await session.get(BiometricReading, (current_user.id, data.date))
    if existing:
        for field, value in data.model_dump().items():
            if field != "date":
                setattr(existing, field, value)
        existing.updated_at = datetime.now(timezone.utc).isoformat()
        await session.commit()
        await session.refresh(existing)
        return existing

    reading = BiometricReading(user_id=current_user.id, **data.model_dump())
    session.add(reading)
    await session.commit()
    await session.refresh(reading)
    return reading
