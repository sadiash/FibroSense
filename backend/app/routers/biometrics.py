from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.models.biometric import BiometricReading
from app.schemas.biometric import BiometricReadingCreate, BiometricReadingResponse

router = APIRouter(prefix="/api/biometrics", tags=["biometrics"])


@router.get("", response_model=list[BiometricReadingResponse])
async def list_biometrics(
    start_date: str | None = Query(None),
    end_date: str | None = Query(None),
    session: AsyncSession = Depends(get_session),
) -> list[BiometricReading]:
    stmt = select(BiometricReading).order_by(BiometricReading.date.desc())
    if start_date:
        stmt = stmt.where(BiometricReading.date >= start_date)
    if end_date:
        stmt = stmt.where(BiometricReading.date <= end_date)
    result = await session.execute(stmt)
    return list(result.scalars().all())


@router.get("/{date}", response_model=BiometricReadingResponse)
async def get_biometric(
    date: str, session: AsyncSession = Depends(get_session)
) -> BiometricReading:
    reading = await session.get(BiometricReading, date)
    if not reading:
        raise HTTPException(status_code=404, detail="Biometric reading not found")
    return reading


@router.post("", response_model=BiometricReadingResponse, status_code=201)
async def upsert_biometric(
    data: BiometricReadingCreate, session: AsyncSession = Depends(get_session)
) -> BiometricReading:
    existing = await session.get(BiometricReading, data.date)
    if existing:
        for field, value in data.model_dump().items():
            setattr(existing, field, value)
        existing.updated_at = datetime.now(timezone.utc).isoformat()
        await session.commit()
        await session.refresh(existing)
        return existing

    reading = BiometricReading(**data.model_dump())
    session.add(reading)
    await session.commit()
    await session.refresh(reading)
    return reading
