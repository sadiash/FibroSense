from datetime import datetime, timedelta, timezone

import httpx
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.biometric import BiometricReading
from app.models.contextual import ContextualData
from app.models.settings import AppSetting
from app.models.sync_log import SyncLog
from app.schemas.sync import SyncTriggerResponse


class WeatherService:
    FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
    ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive"

    def __init__(self, session: AsyncSession, user_id: int) -> None:
        self.session = session
        self.user_id = user_id

    async def _get_location(self) -> tuple[float, float] | None:
        """Read location from DB first, fall back to env vars."""
        lat_setting = await self.session.get(AppSetting, (self.user_id, "weather_latitude"))
        lon_setting = await self.session.get(AppSetting, (self.user_id, "weather_longitude"))

        lat = (lat_setting.value if lat_setting else None) or settings.weather_latitude
        lon = (lon_setting.value if lon_setting else None) or settings.weather_longitude

        if not lat or not lon:
            return None
        return float(lat), float(lon)

    async def sync(self) -> SyncTriggerResponse:
        location = await self._get_location()
        if not location:
            return SyncTriggerResponse(
                status="error", error_message="Weather location not configured"
            )

        now = datetime.now(timezone.utc)
        sync_log = SyncLog(
            user_id=self.user_id,
            source="weather",
            sync_type="daily",
            started_at=now.isoformat(),
            status="running",
        )
        self.session.add(sync_log)
        await self.session.flush()

        try:
            records = await self._fetch_and_store(location)
            sync_log.status = "completed"
            sync_log.records_synced = records
            sync_log.completed_at = datetime.now(timezone.utc).isoformat()
            await self.session.commit()
            return SyncTriggerResponse(status="completed", records_synced=records)
        except Exception as e:
            sync_log.status = "error"
            sync_log.error_message = str(e)
            sync_log.completed_at = datetime.now(timezone.utc).isoformat()
            await self.session.commit()
            return SyncTriggerResponse(status="error", error_message=str(e))

    async def _get_biometric_date_range(self) -> tuple[str, str] | None:
        """Find the earliest and latest biometric reading dates for this user."""
        result = await self.session.execute(
            select(
                func.min(BiometricReading.date),
                func.max(BiometricReading.date),
            ).where(BiometricReading.user_id == self.user_id)
        )
        row = result.one_or_none()
        if row and row[0] and row[1]:
            return row[0], row[1]
        return None

    async def _fetch_and_store(self, location: tuple[float, float]) -> int:
        lat, lon = location
        end_date = datetime.now(timezone.utc).date()
        start_date = end_date - timedelta(days=7)

        # Extend range to cover all biometric data
        bio_range = await self._get_biometric_date_range()
        if bio_range:
            bio_start = datetime.strptime(bio_range[0], "%Y-%m-%d").date()
            if bio_start < start_date:
                start_date = bio_start

        all_daily: dict[str, dict] = {}
        daily_params = "temperature_2m_mean,relative_humidity_2m_mean,surface_pressure_mean"

        async with httpx.AsyncClient(timeout=30) as client:
            # Archive API for historical data (>5 days ago)
            five_days_ago = end_date - timedelta(days=5)
            if start_date < five_days_ago:
                resp = await client.get(self.ARCHIVE_URL, params={
                    "latitude": lat, "longitude": lon,
                    "daily": daily_params,
                    "start_date": str(start_date),
                    "end_date": str(five_days_ago - timedelta(days=1)),
                    "timezone": "auto",
                })
                resp.raise_for_status()
                self._merge_daily(all_daily, resp.json().get("daily", {}))

            # Forecast API for recent days (last 5 + today)
            resp = await client.get(self.FORECAST_URL, params={
                "latitude": lat, "longitude": lon,
                "daily": daily_params,
                "start_date": str(max(start_date, five_days_ago)),
                "end_date": str(end_date),
                "timezone": "auto",
            })
            resp.raise_for_status()
            self._merge_daily(all_daily, resp.json().get("daily", {}))

        records_synced = 0
        for day, values in all_daily.items():
            existing = await self.session.get(ContextualData, (self.user_id, day))
            if existing:
                existing.barometric_pressure = values.get("pressure")
                existing.temperature = values.get("temperature")
                existing.humidity = values.get("humidity")
                existing.updated_at = datetime.now(timezone.utc).isoformat()
            else:
                record = ContextualData(
                    user_id=self.user_id,
                    date=day,
                    barometric_pressure=values.get("pressure"),
                    temperature=values.get("temperature"),
                    humidity=values.get("humidity"),
                )
                self.session.add(record)
            records_synced += 1

        await self.session.flush()
        return records_synced

    @staticmethod
    def _merge_daily(target: dict[str, dict], daily: dict) -> None:
        times = daily.get("time", [])
        temperatures = daily.get("temperature_2m_mean", [])
        humidities = daily.get("relative_humidity_2m_mean", [])
        pressures = daily.get("surface_pressure_mean", [])
        for i, day in enumerate(times):
            target[day] = {
                "pressure": pressures[i] if i < len(pressures) else None,
                "temperature": temperatures[i] if i < len(temperatures) else None,
                "humidity": humidities[i] if i < len(humidities) else None,
            }
