"""Shared test fixtures for FibroSense backend tests."""

from collections.abc import AsyncIterator

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.database import get_session
from app.models.base import Base

# ---------------------------------------------------------------------------
# Async in-memory SQLite engine & session
# ---------------------------------------------------------------------------

TEST_DATABASE_URL = "sqlite+aiosqlite://"

engine = create_async_engine(TEST_DATABASE_URL, echo=False)

TestingSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


@pytest.fixture(autouse=True)
async def setup_database() -> AsyncIterator[None]:
    """Create all tables before each test and drop them after."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


async def _override_get_session() -> AsyncIterator[AsyncSession]:
    async with TestingSessionLocal() as session:
        yield session


@pytest.fixture()
async def session() -> AsyncIterator[AsyncSession]:
    """Standalone async session for direct DB operations in tests."""
    async with TestingSessionLocal() as session:
        yield session


# ---------------------------------------------------------------------------
# Async HTTP test client
# ---------------------------------------------------------------------------


@pytest.fixture()
async def client() -> AsyncIterator[AsyncClient]:
    """httpx AsyncClient wired to the FastAPI app with overridden DB session."""
    # Import app lazily so the test-time engine is already configured
    from app.main import app

    app.dependency_overrides[get_session] = _override_get_session

    transport = ASGITransport(app=app)  # type: ignore[arg-type]
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        yield ac

    app.dependency_overrides.clear()


# ---------------------------------------------------------------------------
# Sample data factories
# ---------------------------------------------------------------------------


def make_symptom_log_payload(**overrides: object) -> dict:
    """Return a valid SymptomLogCreate payload with sensible defaults."""
    defaults: dict = {
        "date": "2025-01-15",
        "pain_locations": [
            {"location": "lower_back", "severity": 5, "descriptors": [], "note": None},
            {"location": "left_shoulder", "severity": 4, "descriptors": [], "note": None},
        ],
        "fatigue_severity": 6,
        "brain_fog": 4,
        "mood": 5,
        "is_flare": False,
        "flare_severity": None,
        "notes": "Moderate day",
    }
    defaults.update(overrides)
    return defaults


def make_medication_payload(**overrides: object) -> dict:
    """Return a valid MedicationCreate payload with sensible defaults."""
    defaults: dict = {
        "name": "Ibuprofen",
        "dosage": "200mg",
        "frequency": "twice daily",
    }
    defaults.update(overrides)
    return defaults


def make_biometric_payload(**overrides: object) -> dict:
    """Return a valid BiometricReadingCreate payload with sensible defaults."""
    defaults: dict = {
        "date": "2025-01-15",
        "sleep_duration": 7.5,
        "sleep_efficiency": 88.0,
        "deep_sleep_pct": 18.0,
        "rem_sleep_pct": 22.0,
        "hrv_rmssd": 42.0,
        "resting_hr": 62.0,
        "temperature_deviation": -0.1,
        "activity_score": 75,
        "activity_calories": 350,
        "spo2": 97.0,
        "source": "oura",
    }
    defaults.update(overrides)
    return defaults


def make_contextual_payload(**overrides: object) -> dict:
    """Return a valid ContextualDataCreate payload with sensible defaults."""
    defaults: dict = {
        "date": "2025-01-15",
        "barometric_pressure": 1013.25,
        "temperature": 22.0,
        "humidity": 45.0,
        "menstrual_phase": "follicular",
        "stress_event": None,
        "medication_change": None,
        "exercise_type": "walking",
        "exercise_rpe": 4,
    }
    defaults.update(overrides)
    return defaults
