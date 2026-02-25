from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.models.sync_log import SyncLog
from app.schemas.sync import SyncStatusResponse, SyncTriggerResponse
from app.services.oura_service import OuraService
from app.services.weather_service import WeatherService

router = APIRouter(prefix="/api/sync", tags=["sync"])


@router.post("/oura", response_model=SyncTriggerResponse)
async def trigger_oura_sync(
    session: AsyncSession = Depends(get_session),
) -> SyncTriggerResponse:
    service = OuraService(session)
    return await service.sync()


@router.post("/weather", response_model=SyncTriggerResponse)
async def trigger_weather_sync(
    session: AsyncSession = Depends(get_session),
) -> SyncTriggerResponse:
    service = WeatherService(session)
    return await service.sync()


@router.get("/status", response_model=list[SyncStatusResponse])
async def get_sync_status(
    session: AsyncSession = Depends(get_session),
) -> list[SyncLog]:
    stmt = select(SyncLog).order_by(SyncLog.started_at.desc()).limit(20)
    result = await session.execute(stmt)
    return list(result.scalars().all())
