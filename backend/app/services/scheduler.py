import logging

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy import select

from app.database import async_session
from app.models.user import User
from app.services.analytics_service import AnalyticsService
from app.services.oura_service import OuraService
from app.services.weather_service import WeatherService

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()


async def _get_active_user_ids() -> list[int]:
    async with async_session() as session:
        result = await session.execute(
            select(User.id).where(User.is_active == True)  # noqa: E712
        )
        return list(result.scalars().all())


async def sync_weather() -> None:
    user_ids = await _get_active_user_ids()
    for user_id in user_ids:
        async with async_session() as session:
            service = WeatherService(session, user_id)
            result = await service.sync()
            logger.info("Weather sync user=%d: %s (%d records)", user_id, result.status, result.records_synced)


async def sync_oura() -> None:
    user_ids = await _get_active_user_ids()
    for user_id in user_ids:
        async with async_session() as session:
            service = OuraService(session, user_id)
            result = await service.sync()
            logger.info("Oura sync user=%d: %s (%d records)", user_id, result.status, result.records_synced)


async def recompute_correlations() -> None:
    user_ids = await _get_active_user_ids()
    for user_id in user_ids:
        async with async_session() as session:
            service = AnalyticsService(session, user_id)
            results = await service.compute_correlations()
            logger.info("Correlation recompute user=%d: %d pairs", user_id, len(results))


def start_scheduler() -> None:
    scheduler.add_job(sync_weather, "cron", hour=5, minute=0, id="weather_sync")
    scheduler.add_job(sync_oura, "cron", hour=6, minute=0, id="oura_sync")
    scheduler.add_job(recompute_correlations, "cron", hour=7, minute=0, id="correlation_recompute")
    scheduler.start()
    logger.info("Scheduler started with 3 daily jobs")
