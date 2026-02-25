"""Tests for the /api/contextual router."""

from httpx import AsyncClient

from tests.conftest import make_contextual_payload


# ---------------------------------------------------------------------------
# POST /api/contextual — create
# ---------------------------------------------------------------------------


async def test_create_contextual(client: AsyncClient) -> None:
    payload = make_contextual_payload()
    resp = await client.post("/api/contextual", json=payload)

    assert resp.status_code == 201
    body = resp.json()
    assert body["date"] == "2025-01-15"
    assert body["barometric_pressure"] == 1013.25
    assert body["menstrual_phase"] == "follicular"
    assert body["exercise_rpe"] == 4
    assert "created_at" in body


async def test_create_contextual_minimal(client: AsyncClient) -> None:
    """Only date is required; all other fields are optional."""
    resp = await client.post("/api/contextual", json={"date": "2025-02-01"})

    assert resp.status_code == 201
    body = resp.json()
    assert body["barometric_pressure"] is None
    assert body["menstrual_phase"] is None
    assert body["exercise_rpe"] is None


# ---------------------------------------------------------------------------
# Validation: menstrual_phase
# ---------------------------------------------------------------------------


async def test_create_contextual_valid_menstrual_phases(client: AsyncClient) -> None:
    """All five valid enum values should be accepted."""
    valid_phases = ["menstrual", "follicular", "ovulatory", "luteal", "not_applicable"]
    for i, phase in enumerate(valid_phases):
        resp = await client.post(
            "/api/contextual",
            json=make_contextual_payload(date=f"2025-03-{10 + i:02d}", menstrual_phase=phase),
        )
        assert resp.status_code == 201, f"Phase '{phase}' should be accepted"


# ---------------------------------------------------------------------------
# Validation: exercise_rpe range
# ---------------------------------------------------------------------------


async def test_create_contextual_rpe_too_low(client: AsyncClient) -> None:
    """exercise_rpe < 1 must be rejected."""
    payload = make_contextual_payload(exercise_rpe=0)
    resp = await client.post("/api/contextual", json=payload)

    assert resp.status_code == 422


async def test_create_contextual_rpe_too_high(client: AsyncClient) -> None:
    """exercise_rpe > 10 must be rejected."""
    payload = make_contextual_payload(exercise_rpe=11)
    resp = await client.post("/api/contextual", json=payload)

    assert resp.status_code == 422


async def test_create_contextual_rpe_boundaries(client: AsyncClient) -> None:
    """RPE of 1 and 10 should both be accepted."""
    resp1 = await client.post(
        "/api/contextual",
        json=make_contextual_payload(date="2025-04-01", exercise_rpe=1),
    )
    assert resp1.status_code == 201

    resp10 = await client.post(
        "/api/contextual",
        json=make_contextual_payload(date="2025-04-02", exercise_rpe=10),
    )
    assert resp10.status_code == 201


# ---------------------------------------------------------------------------
# GET /api/contextual — list & filter
# ---------------------------------------------------------------------------


async def test_list_contextual_empty(client: AsyncClient) -> None:
    resp = await client.get("/api/contextual")

    assert resp.status_code == 200
    assert resp.json() == []


async def test_list_contextual(client: AsyncClient) -> None:
    await client.post("/api/contextual", json=make_contextual_payload(date="2025-01-10"))
    await client.post("/api/contextual", json=make_contextual_payload(date="2025-01-15"))

    resp = await client.get("/api/contextual")
    data = resp.json()
    assert len(data) == 2
    assert data[0]["date"] == "2025-01-15"  # desc order


async def test_list_contextual_filter_by_date(client: AsyncClient) -> None:
    await client.post("/api/contextual", json=make_contextual_payload(date="2025-01-05"))
    await client.post("/api/contextual", json=make_contextual_payload(date="2025-01-10"))
    await client.post("/api/contextual", json=make_contextual_payload(date="2025-01-20"))

    resp = await client.get(
        "/api/contextual", params={"start_date": "2025-01-08", "end_date": "2025-01-15"}
    )
    data = resp.json()
    assert len(data) == 1
    assert data[0]["date"] == "2025-01-10"


# ---------------------------------------------------------------------------
# GET /api/contextual/{date}
# ---------------------------------------------------------------------------


async def test_get_contextual_by_date(client: AsyncClient) -> None:
    await client.post("/api/contextual", json=make_contextual_payload(date="2025-01-15"))

    resp = await client.get("/api/contextual/2025-01-15")
    assert resp.status_code == 200
    assert resp.json()["date"] == "2025-01-15"


async def test_get_contextual_not_found(client: AsyncClient) -> None:
    resp = await client.get("/api/contextual/2099-12-31")

    assert resp.status_code == 404
    assert resp.json()["detail"] == "Contextual data not found"


# ---------------------------------------------------------------------------
# PUT /api/contextual/{date} — update
# ---------------------------------------------------------------------------


async def test_update_contextual(client: AsyncClient) -> None:
    await client.post("/api/contextual", json=make_contextual_payload(date="2025-01-15"))

    resp = await client.put(
        "/api/contextual/2025-01-15",
        json={"stress_event": "work deadline", "exercise_rpe": 8},
    )

    assert resp.status_code == 200
    body = resp.json()
    assert body["stress_event"] == "work deadline"
    assert body["exercise_rpe"] == 8
    # Unchanged fields persist
    assert body["barometric_pressure"] == 1013.25


async def test_update_contextual_not_found(client: AsyncClient) -> None:
    resp = await client.put(
        "/api/contextual/2099-12-31",
        json={"stress_event": "none"},
    )

    assert resp.status_code == 404
