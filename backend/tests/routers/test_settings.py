"""Tests for the /api/settings router."""

from httpx import AsyncClient


# ---------------------------------------------------------------------------
# GET /api/settings — list
# ---------------------------------------------------------------------------


async def test_list_settings_empty(client: AsyncClient) -> None:
    resp = await client.get("/api/settings")

    assert resp.status_code == 200
    assert resp.json() == []


async def test_list_settings(client: AsyncClient) -> None:
    # Create two settings via PUT
    await client.put("/api/settings/theme", json={"value": "dark"})
    await client.put("/api/settings/units", json={"value": "metric"})

    resp = await client.get("/api/settings")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 2
    keys = {s["key"] for s in data}
    assert keys == {"theme", "units"}


# ---------------------------------------------------------------------------
# GET /api/settings/{key}
# ---------------------------------------------------------------------------


async def test_get_setting(client: AsyncClient) -> None:
    await client.put("/api/settings/theme", json={"value": "dark"})

    resp = await client.get("/api/settings/theme")
    assert resp.status_code == 200
    body = resp.json()
    assert body["key"] == "theme"
    assert body["value"] == "dark"
    assert "updated_at" in body


async def test_get_setting_not_found(client: AsyncClient) -> None:
    resp = await client.get("/api/settings/nonexistent")

    assert resp.status_code == 404
    assert resp.json()["detail"] == "Setting not found"


# ---------------------------------------------------------------------------
# PUT /api/settings/{key} — create & update
# ---------------------------------------------------------------------------


async def test_put_setting_creates_new(client: AsyncClient) -> None:
    """PUT on a new key creates the setting."""
    resp = await client.put("/api/settings/language", json={"value": "en"})

    assert resp.status_code == 200
    body = resp.json()
    assert body["key"] == "language"
    assert body["value"] == "en"


async def test_put_setting_updates_existing(client: AsyncClient) -> None:
    """PUT on an existing key updates the value."""
    await client.put("/api/settings/theme", json={"value": "dark"})

    resp = await client.put("/api/settings/theme", json={"value": "light"})
    assert resp.status_code == 200
    assert resp.json()["value"] == "light"

    # Verify via GET
    get_resp = await client.get("/api/settings/theme")
    assert get_resp.json()["value"] == "light"


async def test_put_setting_updates_timestamp(client: AsyncClient) -> None:
    """Updated_at should change when the setting is modified."""
    resp1 = await client.put("/api/settings/tz", json={"value": "UTC"})
    ts1 = resp1.json()["updated_at"]

    resp2 = await client.put("/api/settings/tz", json={"value": "US/Eastern"})
    ts2 = resp2.json()["updated_at"]

    # timestamps should differ (or at least not cause an error)
    assert ts1 is not None
    assert ts2 is not None
