import logging

from apscheduler.schedulers.asyncio import AsyncIOScheduler

from app.database import async_session
from app.services.analytics_service import AnalyticsService
from app.services.oura_service import OuraService
from app.services.weather_service import WeatherService

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()


async def sync_weather() -> None:
    async with async_session() as session:
        service = WeatherService(session)
        result = await service.sync()
        logger.info("Weather sync: %s (%d records)", result.status, result.records_synced)


async def sync_oura() -> None:
    async with async_session() as session:
        service = OuraService(session)
        result = await service.sync()
        logger.info("Oura sync: %s (%d records)", result.status, result.records_synced)


async def recompute_correlations() -> None:
    async with async_session() as session:
        service = AnalyticsService(session)
        results = await service.compute_correlations()
        logger.info("Correlation recompute: %d pairs", len(results))


def start_scheduler() -> None:
    scheduler.add_job(sync_weather, "cron", hour=5, minute=0, id="weather_sync")
    scheduler.add_job(sync_oura, "cron", hour=6, minute=0, id="oura_sync")
    scheduler.add_job(recompute_correlations, "cron", hour=7, minute=0, id="correlation_recompute")
    scheduler.start()
    logger.info("Scheduler started with 3 daily jobs")
