from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.models.contextual import ContextualData
from app.schemas.contextual import (
    ContextualDataCreate,
    ContextualDataResponse,
    ContextualDataUpdate,
)

router = APIRouter(prefix="/api/contextual", tags=["contextual"])


@router.get("", response_model=list[ContextualDataResponse])
async def list_contextual(
    start_date: str | None = Query(None),
    end_date: str | None = Query(None),
    session: AsyncSession = Depends(get_session),
) -> list[ContextualData]:
    stmt = select(ContextualData).order_by(ContextualData.date.desc())
    if start_date:
        stmt = stmt.where(ContextualData.date >= start_date)
    if end_date:
        stmt = stmt.where(ContextualData.date <= end_date)
    result = await session.execute(stmt)
    return list(result.scalars().all())


@router.get("/{date}", response_model=ContextualDataResponse)
async def get_contextual(
    date: str, session: AsyncSession = Depends(get_session)
) -> ContextualData:
    data = await session.get(ContextualData, date)
    if not data:
        raise HTTPException(status_code=404, detail="Contextual data not found")
    return data


@router.post("", response_model=ContextualDataResponse, status_code=201)
async def create_contextual(
    data: ContextualDataCreate, session: AsyncSession = Depends(get_session)
) -> ContextualData:
    record = ContextualData(**data.model_dump())
    session.add(record)
    await session.commit()
    await session.refresh(record)
    return record


@router.put("/{date}", response_model=ContextualDataResponse)
async def update_contextual(
    date: str, data: ContextualDataUpdate, session: AsyncSession = Depends(get_session)
) -> ContextualData:
    record = await session.get(ContextualData, date)
    if not record:
        raise HTTPException(status_code=404, detail="Contextual data not found")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(record, field, value)

    record.updated_at = datetime.now(timezone.utc).isoformat()
    await session.commit()
    await session.refresh(record)
    return record
