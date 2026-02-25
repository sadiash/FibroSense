"""Tests for the /api/sync router."""

from unittest.mock import AsyncMock, MagicMock, patch

from httpx import AsyncClient


# ---------------------------------------------------------------------------
# POST /api/sync/oura
# ---------------------------------------------------------------------------


async def test_oura_sync_no_api_key(client: AsyncClient) -> None:
    """Without an Oura API key, sync should return error status."""
    with patch("app.services.oura_service.settings") as mock_settings:
        mock_settings.oura_api_key = ""
        resp = await client.post("/api/sync/oura")

    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "error"
    assert "not configured" in body["error_message"].lower()


async def test_oura_sync_success(client: AsyncClient) -> None:
    """With a mocked Oura API response, sync should complete successfully."""
    mock_sleep_response = MagicMock()
    mock_sleep_response.status_code = 200
    mock_sleep_response.raise_for_status = MagicMock()
    mock_sleep_response.json.return_value = {
        "data": [
            {
                "day": "2025-01-15",
                "total_sleep_duration": 27000,
                "contributors": {
                    "efficiency": 85,
                    "deep_sleep": 20,
                    "rem_sleep": 22,
                },
            }
        ]
    }

    mock_readiness_response = MagicMock()
    mock_readiness_response.status_code = 200
    mock_readiness_response.raise_for_status = MagicMock()
    mock_readiness_response.json.return_value = {
        "data": [
            {
                "day": "2025-01-15",
                "score": 80,
                "temperature_deviation": 0.1,
            }
        ]
    }

    mock_activity_response = MagicMock()
    mock_activity_response.status_code = 200
    mock_activity_response.raise_for_status = MagicMock()
    mock_activity_response.json.return_value = {
        "data": [
            {
                "day": "2025-01-15",
                "score": 70,
                "active_calories": 350,
            }
        ]
    }

    async def mock_get(url: str, **kwargs: object) -> MagicMock:
        if "daily_sleep" in url:
            return mock_sleep_response
        elif "daily_readiness" in url:
            return mock_readiness_response
        else:
            return mock_activity_response

    with (
        patch("app.services.oura_service.settings") as mock_settings,
        patch("app.services.oura_service.httpx.AsyncClient") as mock_client_cls,
    ):
        mock_settings.oura_api_key = "test-key-123"
        mock_http_client = AsyncMock()
        mock_http_client.get = mock_get
        mock_http_client.__aenter__ = AsyncMock(return_value=mock_http_client)
        mock_http_client.__aexit__ = AsyncMock(return_value=False)
        mock_client_cls.return_value = mock_http_client

        resp = await client.post("/api/sync/oura")

    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "completed"
    assert body["records_synced"] == 1


# ---------------------------------------------------------------------------
# POST /api/sync/weather
# ---------------------------------------------------------------------------


async def test_weather_sync_success(client: AsyncClient) -> None:
    """With a mocked Open-Meteo response, weather sync should succeed."""
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.raise_for_status = MagicMock()
    mock_response.json.return_value = {
        "daily": {
            "time": ["2025-01-14", "2025-01-15"],
            "temperature_2m_mean": [5.2, 6.1],
            "relative_humidity_2m_mean": [70.0, 65.0],
            "surface_pressure_mean": [1015.0, 1012.5],
        }
    }

    with patch("app.services.weather_service.httpx.AsyncClient") as mock_client_cls:
        mock_http_client = AsyncMock()
        mock_http_client.get = AsyncMock(return_value=mock_response)
        mock_http_client.__aenter__ = AsyncMock(return_value=mock_http_client)
        mock_http_client.__aexit__ = AsyncMock(return_value=False)
        mock_client_cls.return_value = mock_http_client

        resp = await client.post("/api/sync/weather")

    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "completed"
    assert body["records_synced"] == 2


async def test_weather_sync_api_error(client: AsyncClient) -> None:
    """When the external API raises, sync should return error status."""
    with patch("app.services.weather_service.httpx.AsyncClient") as mock_client_cls:
        mock_http_client = AsyncMock()
        mock_http_client.get = AsyncMock(side_effect=Exception("Connection refused"))
        mock_http_client.__aenter__ = AsyncMock(return_value=mock_http_client)
        mock_http_client.__aexit__ = AsyncMock(return_value=False)
        mock_client_cls.return_value = mock_http_client

        resp = await client.post("/api/sync/weather")

    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "error"
    assert "Connection refused" in body["error_message"]


# ---------------------------------------------------------------------------
# GET /api/sync/status
# ---------------------------------------------------------------------------


async def test_sync_status_empty(client: AsyncClient) -> None:
    resp = await client.get("/api/sync/status")

    assert resp.status_code == 200
    assert resp.json() == []


async def test_sync_status_after_weather_sync(client: AsyncClient) -> None:
    """After a weather sync (which always creates a SyncLog), status should show entries."""
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.raise_for_status = MagicMock()
    mock_response.json.return_value = {
        "daily": {
            "time": ["2025-01-15"],
            "temperature_2m_mean": [5.0],
            "relative_humidity_2m_mean": [60.0],
            "surface_pressure_mean": [1010.0],
        }
    }

    with patch("app.services.weather_service.httpx.AsyncClient") as mock_client_cls:
        mock_http_client = AsyncMock()
        mock_http_client.get = AsyncMock(return_value=mock_response)
        mock_http_client.__aenter__ = AsyncMock(return_value=mock_http_client)
        mock_http_client.__aexit__ = AsyncMock(return_value=False)
        mock_client_cls.return_value = mock_http_client

        await client.post("/api/sync/weather")

    resp = await client.get("/api/sync/status")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) >= 1
    assert data[0]["source"] == "weather"
    assert data[0]["status"] == "completed"
    assert data[0]["records_synced"] == 1
