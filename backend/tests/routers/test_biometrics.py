"""Tests for the /api/biometrics router."""

from httpx import AsyncClient

from tests.conftest import make_biometric_payload


# ---------------------------------------------------------------------------
# GET /api/biometrics — list
# ---------------------------------------------------------------------------


async def test_list_biometrics_empty(client: AsyncClient) -> None:
    resp = await client.get("/api/biometrics")

    assert resp.status_code == 200
    assert resp.json() == []


async def test_list_biometrics(client: AsyncClient) -> None:
    await client.post("/api/biometrics", json=make_biometric_payload(date="2025-01-10"))
    await client.post("/api/biometrics", json=make_biometric_payload(date="2025-01-12"))

    resp = await client.get("/api/biometrics")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 2
    # Ordered by date desc
    assert data[0]["date"] == "2025-01-12"
    assert data[1]["date"] == "2025-01-10"


async def test_list_biometrics_filter_by_date(client: AsyncClient) -> None:
    await client.post("/api/biometrics", json=make_biometric_payload(date="2025-01-05"))
    await client.post("/api/biometrics", json=make_biometric_payload(date="2025-01-10"))
    await client.post("/api/biometrics", json=make_biometric_payload(date="2025-01-15"))

    resp = await client.get(
        "/api/biometrics", params={"start_date": "2025-01-08", "end_date": "2025-01-12"}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["date"] == "2025-01-10"


# ---------------------------------------------------------------------------
# GET /api/biometrics/{date}
# ---------------------------------------------------------------------------


async def test_get_biometric_by_date(client: AsyncClient) -> None:
    await client.post("/api/biometrics", json=make_biometric_payload(date="2025-01-15"))

    resp = await client.get("/api/biometrics/2025-01-15")
    assert resp.status_code == 200
    body = resp.json()
    assert body["date"] == "2025-01-15"
    assert body["sleep_duration"] == 7.5
    assert body["source"] == "oura"


async def test_get_biometric_not_found(client: AsyncClient) -> None:
    resp = await client.get("/api/biometrics/2099-12-31")

    assert resp.status_code == 404
    assert resp.json()["detail"] == "Biometric reading not found"


# ---------------------------------------------------------------------------
# POST /api/biometrics — create & upsert
# ---------------------------------------------------------------------------


async def test_create_biometric(client: AsyncClient) -> None:
    payload = make_biometric_payload()
    resp = await client.post("/api/biometrics", json=payload)

    assert resp.status_code == 201
    body = resp.json()
    assert body["date"] == "2025-01-15"
    assert body["sleep_efficiency"] == 88.0
    assert body["spo2"] == 97.0
    assert "created_at" in body
    assert "updated_at" in body


async def test_upsert_biometric_updates_existing(client: AsyncClient) -> None:
    """POSTing the same date a second time should update (upsert), not duplicate."""
    payload = make_biometric_payload(date="2025-01-15", sleep_duration=7.0)
    resp1 = await client.post("/api/biometrics", json=payload)
    assert resp1.status_code == 201

    updated_payload = make_biometric_payload(date="2025-01-15", sleep_duration=8.5)
    resp2 = await client.post("/api/biometrics", json=updated_payload)
    assert resp2.status_code == 201
    assert resp2.json()["sleep_duration"] == 8.5

    # Only one record for that date
    list_resp = await client.get("/api/biometrics")
    assert len(list_resp.json()) == 1


async def test_create_biometric_without_optional_spo2(client: AsyncClient) -> None:
    payload = make_biometric_payload(spo2=None)
    resp = await client.post("/api/biometrics", json=payload)

    assert resp.status_code == 201
    assert resp.json()["spo2"] is None
