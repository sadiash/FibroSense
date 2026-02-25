"""Tests for SQLAlchemy model instantiation and constraints."""

import json

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.biometric import BiometricReading
from app.models.contextual import ContextualData
from app.models.correlation import CorrelationCache
from app.models.settings import AppSetting
from app.models.symptom import SymptomLog
from app.models.sync_log import SyncLog


# ---------------------------------------------------------------------------
# SymptomLog
# ---------------------------------------------------------------------------


async def test_symptom_log_instantiation(session: AsyncSession) -> None:
    log = SymptomLog(
        date="2025-01-15",
        pain_severity=5,
        pain_locations=json.dumps(["lower_back", "shoulders"]),
        fatigue_severity=6,
        brain_fog=4,
        mood=5,
        is_flare=False,
    )
    session.add(log)
    await session.commit()

    result = await session.execute(select(SymptomLog))
    fetched = result.scalar_one()
    assert fetched.date == "2025-01-15"
    assert fetched.pain_severity == 5
    assert fetched.is_flare is False
    assert fetched.flare_severity is None
    assert fetched.id is not None
    assert fetched.created_at is not None
    assert fetched.updated_at is not None


async def test_symptom_log_pain_locations_json_roundtrip(session: AsyncSession) -> None:
    """pain_locations is stored as JSON text and can be round-tripped."""
    locations = ["neck", "wrists", "knees"]
    log = SymptomLog(
        date="2025-01-15",
        pain_severity=3,
        pain_locations=json.dumps(locations),
        fatigue_severity=2,
        brain_fog=1,
        mood=7,
        is_flare=False,
    )
    session.add(log)
    await session.commit()

    result = await session.execute(select(SymptomLog))
    fetched = result.scalar_one()
    parsed = json.loads(fetched.pain_locations)
    assert parsed == locations


async def test_symptom_log_with_flare(session: AsyncSession) -> None:
    log = SymptomLog(
        date="2025-02-01",
        pain_severity=9,
        pain_locations=json.dumps(["full_body"]),
        fatigue_severity=9,
        brain_fog=8,
        mood=2,
        is_flare=True,
        flare_severity=8,
        notes="Terrible flare day",
    )
    session.add(log)
    await session.commit()

    result = await session.execute(select(SymptomLog))
    fetched = result.scalar_one()
    assert fetched.is_flare is True
    assert fetched.flare_severity == 8
    assert fetched.notes == "Terrible flare day"


async def test_symptom_log_autoincrement_id(session: AsyncSession) -> None:
    """Multiple inserts should get auto-incremented IDs."""
    for day in ["2025-01-01", "2025-01-02", "2025-01-03"]:
        log = SymptomLog(
            date=day,
            pain_severity=3,
            pain_locations=json.dumps(["back"]),
            fatigue_severity=3,
            brain_fog=3,
            mood=5,
            is_flare=False,
        )
        session.add(log)

    await session.commit()

    result = await session.execute(select(SymptomLog).order_by(SymptomLog.id))
    logs = list(result.scalars().all())
    assert len(logs) == 3
    assert logs[0].id < logs[1].id < logs[2].id


# ---------------------------------------------------------------------------
# BiometricReading
# ---------------------------------------------------------------------------


async def test_biometric_reading_date_pk(session: AsyncSession) -> None:
    """BiometricReading uses date as the primary key."""
    reading = BiometricReading(
        date="2025-01-15",
        sleep_duration=7.5,
        sleep_efficiency=88.0,
        deep_sleep_pct=18.0,
        rem_sleep_pct=22.0,
        hrv_rmssd=42.0,
        resting_hr=62.0,
        temperature_deviation=-0.1,
        activity_score=75,
        activity_calories=350,
    )
    session.add(reading)
    await session.commit()

    fetched = await session.get(BiometricReading, "2025-01-15")
    assert fetched is not None
    assert fetched.date == "2025-01-15"
    assert fetched.sleep_duration == 7.5


async def test_biometric_reading_optional_spo2(session: AsyncSession) -> None:
    reading = BiometricReading(
        date="2025-01-16",
        sleep_duration=6.0,
        sleep_efficiency=80.0,
        deep_sleep_pct=15.0,
        rem_sleep_pct=20.0,
        hrv_rmssd=35.0,
        resting_hr=65.0,
        temperature_deviation=0.0,
        activity_score=60,
        activity_calories=200,
        spo2=None,
    )
    session.add(reading)
    await session.commit()

    fetched = await session.get(BiometricReading, "2025-01-16")
    assert fetched is not None
    assert fetched.spo2 is None


async def test_biometric_reading_default_source(session: AsyncSession) -> None:
    reading = BiometricReading(
        date="2025-01-17",
        sleep_duration=7.0,
        sleep_efficiency=85.0,
        deep_sleep_pct=17.0,
        rem_sleep_pct=21.0,
        hrv_rmssd=40.0,
        resting_hr=60.0,
        temperature_deviation=0.2,
        activity_score=80,
        activity_calories=400,
    )
    session.add(reading)
    await session.commit()

    fetched = await session.get(BiometricReading, "2025-01-17")
    assert fetched is not None
    assert fetched.source == "oura"


# ---------------------------------------------------------------------------
# ContextualData
# ---------------------------------------------------------------------------


async def test_contextual_data_date_pk(session: AsyncSession) -> None:
    """ContextualData uses date as primary key."""
    record = ContextualData(
        date="2025-01-15",
        barometric_pressure=1013.25,
        temperature=22.0,
        humidity=45.0,
    )
    session.add(record)
    await session.commit()

    fetched = await session.get(ContextualData, "2025-01-15")
    assert fetched is not None
    assert fetched.barometric_pressure == 1013.25


async def test_contextual_data_all_nullable_fields(session: AsyncSession) -> None:
    """All fields except date are nullable."""
    record = ContextualData(date="2025-01-15")
    session.add(record)
    await session.commit()

    fetched = await session.get(ContextualData, "2025-01-15")
    assert fetched is not None
    assert fetched.barometric_pressure is None
    assert fetched.temperature is None
    assert fetched.humidity is None
    assert fetched.menstrual_phase is None
    assert fetched.stress_event is None
    assert fetched.medication_change is None
    assert fetched.exercise_type is None
    assert fetched.exercise_rpe is None


# ---------------------------------------------------------------------------
# CorrelationCache
# ---------------------------------------------------------------------------


async def test_correlation_cache_instantiation(session: AsyncSession) -> None:
    cache = CorrelationCache(
        computed_at="2025-01-20T00:00:00+00:00",
        metric_a="pain_severity",
        metric_b="sleep_duration",
        lag_days=0,
        correlation_coefficient=-0.45,
        p_value=0.02,
        sample_size=30,
        date_range_start="2025-01-01",
        date_range_end="2025-01-30",
        method="spearman",
    )
    session.add(cache)
    await session.commit()

    result = await session.execute(select(CorrelationCache))
    fetched = result.scalar_one()
    assert fetched.metric_a == "pain_severity"
    assert fetched.correlation_coefficient == -0.45
    assert fetched.id is not None


async def test_correlation_cache_default_method(session: AsyncSession) -> None:
    cache = CorrelationCache(
        computed_at="2025-01-20T00:00:00+00:00",
        metric_a="a",
        metric_b="b",
        lag_days=0,
        correlation_coefficient=0.5,
        p_value=0.01,
        sample_size=20,
        date_range_start="2025-01-01",
        date_range_end="2025-01-20",
    )
    session.add(cache)
    await session.commit()

    result = await session.execute(select(CorrelationCache))
    fetched = result.scalar_one()
    assert fetched.method == "pearson"


# ---------------------------------------------------------------------------
# SyncLog
# ---------------------------------------------------------------------------


async def test_sync_log_instantiation(session: AsyncSession) -> None:
    log = SyncLog(
        source="oura",
        sync_type="daily",
        started_at="2025-01-15T06:00:00+00:00",
        status="completed",
        records_synced=5,
    )
    session.add(log)
    await session.commit()

    result = await session.execute(select(SyncLog))
    fetched = result.scalar_one()
    assert fetched.source == "oura"
    assert fetched.records_synced == 5
    assert fetched.completed_at is None
    assert fetched.error_message is None
    assert fetched.id is not None


# ---------------------------------------------------------------------------
# AppSetting
# ---------------------------------------------------------------------------


async def test_app_setting_string_pk(session: AsyncSession) -> None:
    setting = AppSetting(key="theme", value="dark")
    session.add(setting)
    await session.commit()

    fetched = await session.get(AppSetting, "theme")
    assert fetched is not None
    assert fetched.value == "dark"
    assert fetched.created_at is not None
    assert fetched.updated_at is not None
