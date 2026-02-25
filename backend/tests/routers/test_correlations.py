"""Tests for the /api/correlations router."""

from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.correlation import CorrelationCache
from tests.conftest import make_biometric_payload, make_symptom_log_payload


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


async def _seed_correlation_cache(session: AsyncSession) -> None:
    """Insert a pre-computed correlation row for GET tests."""
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


# ---------------------------------------------------------------------------
# GET /api/correlations — returns cached correlations
# ---------------------------------------------------------------------------


async def test_get_correlations_empty(client: AsyncClient) -> None:
    resp = await client.get("/api/correlations")

    assert resp.status_code == 200
    assert resp.json() == []


async def test_get_correlations_returns_cached(
    client: AsyncClient, session: AsyncSession
) -> None:
    await _seed_correlation_cache(session)

    resp = await client.get("/api/correlations")

    assert resp.status_code == 200
    data = resp.json()
    assert len(data) >= 1
    first = data[0]
    assert first["metric_a"] == "pain_severity"
    assert first["metric_b"] == "sleep_duration"
    assert first["correlation_coefficient"] == -0.45
    assert first["method"] == "spearman"


# ---------------------------------------------------------------------------
# POST /api/correlations/compute — insufficient data returns empty list
# ---------------------------------------------------------------------------


async def test_compute_correlations_insufficient_data(client: AsyncClient) -> None:
    """With fewer than 5 data points, compute should return an empty list."""
    # Seed only 2 symptom logs (need at least 5)
    for i in range(2):
        await client.post(
            "/api/symptoms",
            json=make_symptom_log_payload(date=f"2025-01-{10 + i:02d}"),
        )

    resp = await client.post("/api/correlations/compute", json={"method": "spearman", "max_lag": 0})

    assert resp.status_code == 200
    assert resp.json() == []


async def test_compute_correlations_with_enough_data(client: AsyncClient) -> None:
    """With 5+ data points, compute should return correlation entries."""
    for i in range(6):
        day = f"2025-01-{10 + i:02d}"
        await client.post(
            "/api/symptoms",
            json=make_symptom_log_payload(
                date=day,
                pain_severity=i + 1,
                fatigue_severity=(i + 2) % 10,
                brain_fog=(i + 3) % 10,
                mood=10 - i,
            ),
        )
        await client.post(
            "/api/biometrics",
            json=make_biometric_payload(
                date=day,
                sleep_duration=6.0 + i * 0.3,
                sleep_efficiency=75.0 + i * 2.0,
                hrv_rmssd=30.0 + i * 3.0,
                resting_hr=55.0 + i * 1.5,
            ),
        )

    resp = await client.post("/api/correlations/compute", json={"method": "spearman", "max_lag": 0})

    assert resp.status_code == 200
    data = resp.json()
    assert len(data) > 0
    # Each entry has the expected fields
    first = data[0]
    assert "metric_a" in first
    assert "metric_b" in first
    assert "correlation_coefficient" in first
    assert "p_value" in first
    assert "sample_size" in first


# ---------------------------------------------------------------------------
# GET /api/correlations/lagged
# ---------------------------------------------------------------------------


async def test_lagged_correlations_insufficient_data(client: AsyncClient) -> None:
    """With no data, lagged correlations should return empty."""
    resp = await client.get(
        "/api/correlations/lagged",
        params={"metric_a": "pain_severity", "metric_b": "sleep_duration", "max_lag": 3},
    )

    assert resp.status_code == 200
    assert resp.json() == []


async def test_lagged_correlations_with_data(client: AsyncClient) -> None:
    """With enough data, lagged correlations should return multiple lag entries."""
    for i in range(10):
        day = f"2025-01-{10 + i:02d}"
        await client.post(
            "/api/symptoms",
            json=make_symptom_log_payload(date=day, pain_severity=(i % 10) + 1),
        )
        await client.post(
            "/api/biometrics",
            json=make_biometric_payload(date=day, sleep_duration=5.0 + i * 0.5),
        )

    resp = await client.get(
        "/api/correlations/lagged",
        params={"metric_a": "pain_severity", "metric_b": "sleep_duration", "max_lag": 3},
    )

    assert resp.status_code == 200
    data = resp.json()
    assert len(data) > 0
    lag_days = [item["lag_days"] for item in data]
    assert 0 in lag_days


async def test_lagged_correlations_requires_metric_params(client: AsyncClient) -> None:
    """metric_a and metric_b are required query params."""
    resp = await client.get("/api/correlations/lagged")

    assert resp.status_code == 422
