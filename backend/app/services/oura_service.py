from datetime import datetime, timedelta, timezone

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.biometric import BiometricReading
from app.models.settings import AppSetting
from app.models.sync_log import SyncLog
from app.schemas.sync import SyncTriggerResponse


class OuraService:
    BASE_URL = "https://api.ouraring.com/v2/usercollection"

    def __init__(self, session: AsyncSession, user_id: int) -> None:
        self.session = session
        self.user_id = user_id

    async def _get_api_key(self) -> str | None:
        """Read API key from DB first, fall back to env var."""
        setting = await self.session.get(AppSetting, (self.user_id, "oura_api_key"))
        if setting and setting.value:
            return setting.value
        return settings.oura_api_key or None

    async def sync(self) -> SyncTriggerResponse:
        api_key = await self._get_api_key()
        if not api_key:
            return SyncTriggerResponse(
                status="error", error_message="Oura API key not configured"
            )

        now = datetime.now(timezone.utc)
        sync_log = SyncLog(
            user_id=self.user_id,
            source="oura",
            sync_type="daily",
            started_at=now.isoformat(),
            status="running",
        )
        self.session.add(sync_log)
        await self.session.flush()

        try:
            records = await self._fetch_and_store(api_key)
            sync_log.status = "completed"
            sync_log.records_synced = records
            sync_log.completed_at = datetime.now(timezone.utc).isoformat()
            await self.session.commit()
            return SyncTriggerResponse(status="completed", records_synced=records)
        except httpx.HTTPStatusError as e:
            msg = f"Oura API error {e.response.status_code}: {e.response.text[:200]}"
            sync_log.status = "error"
            sync_log.error_message = msg
            sync_log.completed_at = datetime.now(timezone.utc).isoformat()
            await self.session.commit()
            return SyncTriggerResponse(status="error", error_message=msg)
        except Exception as e:
            sync_log.status = "error"
            sync_log.error_message = str(e)
            sync_log.completed_at = datetime.now(timezone.utc).isoformat()
            await self.session.commit()
            return SyncTriggerResponse(status="error", error_message=str(e))

    async def _fetch_and_store(self, api_key: str) -> int:
        headers = {"Authorization": f"Bearer {api_key}"}
        end_date = datetime.now(timezone.utc).date()
        start_date = end_date - timedelta(days=7)
        params = {"start_date": str(start_date), "end_date": str(end_date)}

        async with httpx.AsyncClient(timeout=30) as client:
            # Sleep periods endpoint has actual duration, HRV, heart rate
            sleep_resp = await client.get(
                f"{self.BASE_URL}/sleep", headers=headers, params=params
            )
            sleep_resp.raise_for_status()
            sleep_periods = sleep_resp.json().get("data", [])

            readiness_resp = await client.get(
                f"{self.BASE_URL}/daily_readiness", headers=headers, params=params
            )
            readiness_resp.raise_for_status()
            readiness_data = readiness_resp.json().get("data", [])

            activity_resp = await client.get(
                f"{self.BASE_URL}/daily_activity", headers=headers, params=params
            )
            activity_resp.raise_for_status()
            activity_data = activity_resp.json().get("data", [])

        # Aggregate sleep periods per day, preferring long_sleep
        daily_sleep: dict[str, dict] = {}
        for period in sleep_periods:
            day = period.get("day")
            if not day:
                continue
            existing_period = daily_sleep.get(day)
            # Keep the longest sleep period (long_sleep > sleep > rest)
            if not existing_period or (period.get("total_sleep_duration", 0) or 0) > (existing_period.get("total_sleep_duration", 0) or 0):
                daily_sleep[day] = period

        readiness_map = {r["day"]: r for r in readiness_data}
        activity_map = {a["day"]: a for a in activity_data}
        records_synced = 0

        for day, sleep in daily_sleep.items():
            readiness = readiness_map.get(day, {})
            activity = activity_map.get(day, {})

            total_sleep_sec = sleep.get("total_sleep_duration", 0) or 0
            deep_sleep_sec = sleep.get("deep_sleep_duration", 0) or 0
            rem_sleep_sec = sleep.get("rem_sleep_duration", 0) or 0

            reading = BiometricReading(
                user_id=self.user_id,
                date=day,
                sleep_duration=round(total_sleep_sec / 3600, 2),
                sleep_efficiency=sleep.get("efficiency", 0) or 0,
                deep_sleep_pct=round(deep_sleep_sec / total_sleep_sec * 100, 1) if total_sleep_sec > 0 else 0,
                rem_sleep_pct=round(rem_sleep_sec / total_sleep_sec * 100, 1) if total_sleep_sec > 0 else 0,
                hrv_rmssd=sleep.get("average_hrv", 0) or 0,
                resting_hr=sleep.get("lowest_heart_rate", 0) or 0,
                temperature_deviation=readiness.get("temperature_deviation", 0) or 0,
                activity_score=activity.get("score", 0) or 0,
                activity_calories=activity.get("active_calories", 0) or 0,
                spo2=None,
                source="oura",
            )

            existing_record = await self.session.get(BiometricReading, (self.user_id, day))
            if existing_record:
                for col in [
                    "sleep_duration", "sleep_efficiency", "deep_sleep_pct",
                    "rem_sleep_pct", "hrv_rmssd", "resting_hr",
                    "temperature_deviation", "activity_score", "activity_calories",
                ]:
                    setattr(existing_record, col, getattr(reading, col))
                existing_record.updated_at = datetime.now(timezone.utc).isoformat()
            else:
                self.session.add(reading)

            records_synced += 1

        await self.session.flush()
        return records_synced
