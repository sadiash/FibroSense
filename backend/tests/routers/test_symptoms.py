"""Tests for the /api/symptoms router."""

from httpx import AsyncClient

from tests.conftest import make_symptom_log_payload


# ---------------------------------------------------------------------------
# POST /api/symptoms — create
# ---------------------------------------------------------------------------


async def test_create_symptom_log(client: AsyncClient) -> None:
    payload = make_symptom_log_payload()
    resp = await client.post("/api/symptoms", json=payload)

    assert resp.status_code == 201
    body = resp.json()
    assert body["date"] == "2025-01-15"
    assert body["pain_severity"] == 5  # auto-computed max of 5 and 4
    assert body["fatigue_severity"] == 6
    assert body["brain_fog"] == 4
    assert body["mood"] == 5
    assert body["is_flare"] is False
    assert body["flare_severity"] is None
    assert body["notes"] == "Moderate day"
    assert "id" in body
    assert "created_at" in body
    assert "updated_at" in body


async def test_create_symptom_pain_locations_roundtrip(client: AsyncClient) -> None:
    """pain_locations stored as JSON text should round-trip as list of objects."""
    locations = [
        {"location": "neck", "severity": 7, "descriptors": ["throbbing"], "note": "stiff"},
        {"location": "left_hand", "severity": 3, "descriptors": [], "note": None},
    ]
    payload = make_symptom_log_payload(pain_locations=locations)
    resp = await client.post("/api/symptoms", json=payload)

    assert resp.status_code == 201
    result_locs = resp.json()["pain_locations"]
    assert len(result_locs) == 2
    assert result_locs[0]["location"] == "neck"
    assert result_locs[0]["severity"] == 7
    assert result_locs[0]["descriptors"] == ["throbbing"]
    assert result_locs[0]["note"] == "stiff"
    assert result_locs[1]["location"] == "left_hand"


async def test_pain_severity_auto_computed(client: AsyncClient) -> None:
    """pain_severity should be auto-computed as max of per-area severities."""
    locations = [
        {"location": "neck", "severity": 3, "descriptors": [], "note": None},
        {"location": "lower_back", "severity": 8, "descriptors": [], "note": None},
        {"location": "left_hip", "severity": 5, "descriptors": [], "note": None},
    ]
    payload = make_symptom_log_payload(pain_locations=locations)
    resp = await client.post("/api/symptoms", json=payload)

    assert resp.status_code == 201
    assert resp.json()["pain_severity"] == 8


async def test_pain_severity_zero_when_no_locations(client: AsyncClient) -> None:
    """pain_severity should be 0 when no locations are provided."""
    payload = make_symptom_log_payload(pain_locations=[])
    resp = await client.post("/api/symptoms", json=payload)

    assert resp.status_code == 201
    assert resp.json()["pain_severity"] == 0


async def test_flare_severity_null_when_is_flare_false(client: AsyncClient) -> None:
    """When is_flare=false the router sets flare_severity to None."""
    payload = make_symptom_log_payload(is_flare=False, flare_severity=7)
    resp = await client.post("/api/symptoms", json=payload)

    assert resp.status_code == 201
    assert resp.json()["flare_severity"] is None


async def test_flare_severity_set_when_is_flare_true(client: AsyncClient) -> None:
    payload = make_symptom_log_payload(is_flare=True, flare_severity=8)
    resp = await client.post("/api/symptoms", json=payload)

    assert resp.status_code == 201
    assert resp.json()["flare_severity"] == 8


async def test_missed_medications_roundtrip(client: AsyncClient) -> None:
    """missed_medications should round-trip through create and read."""
    payload = make_symptom_log_payload(missed_medications=[1, 3, 5])
    resp = await client.post("/api/symptoms", json=payload)

    assert resp.status_code == 201
    body = resp.json()
    assert body["missed_medications"] == [1, 3, 5]

    # Verify via GET
    log_id = body["id"]
    get_resp = await client.get(f"/api/symptoms/{log_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["missed_medications"] == [1, 3, 5]


async def test_missed_medications_null_by_default(client: AsyncClient) -> None:
    """missed_medications should be null when not provided."""
    payload = make_symptom_log_payload()
    resp = await client.post("/api/symptoms", json=payload)

    assert resp.status_code == 201
    assert resp.json()["missed_medications"] is None


# ---------------------------------------------------------------------------
# GET /api/symptoms — list
# ---------------------------------------------------------------------------


async def test_list_symptom_logs_empty(client: AsyncClient) -> None:
    resp = await client.get("/api/symptoms")

    assert resp.status_code == 200
    assert resp.json() == []


async def test_list_symptom_logs(client: AsyncClient) -> None:
    await client.post("/api/symptoms", json=make_symptom_log_payload(date="2025-01-10"))
    await client.post("/api/symptoms", json=make_symptom_log_payload(date="2025-01-12"))

    resp = await client.get("/api/symptoms")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 2
    # Ordered by date desc
    assert data[0]["date"] == "2025-01-12"
    assert data[1]["date"] == "2025-01-10"


async def test_list_symptom_logs_filter_by_date_range(client: AsyncClient) -> None:
    await client.post("/api/symptoms", json=make_symptom_log_payload(date="2025-01-05"))
    await client.post("/api/symptoms", json=make_symptom_log_payload(date="2025-01-10"))
    await client.post("/api/symptoms", json=make_symptom_log_payload(date="2025-01-15"))
    await client.post("/api/symptoms", json=make_symptom_log_payload(date="2025-01-20"))

    resp = await client.get(
        "/api/symptoms", params={"start_date": "2025-01-08", "end_date": "2025-01-16"}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 2
    dates = [d["date"] for d in data]
    assert "2025-01-10" in dates
    assert "2025-01-15" in dates


# ---------------------------------------------------------------------------
# GET /api/symptoms/{id} — single
# ---------------------------------------------------------------------------


async def test_get_symptom_log_by_id(client: AsyncClient) -> None:
    create_resp = await client.post("/api/symptoms", json=make_symptom_log_payload())
    log_id = create_resp.json()["id"]

    resp = await client.get(f"/api/symptoms/{log_id}")
    assert resp.status_code == 200
    assert resp.json()["id"] == log_id


async def test_get_symptom_log_not_found(client: AsyncClient) -> None:
    resp = await client.get("/api/symptoms/99999")

    assert resp.status_code == 404
    assert resp.json()["detail"] == "Symptom log not found"


# ---------------------------------------------------------------------------
# PUT /api/symptoms/{id} — update
# ---------------------------------------------------------------------------


async def test_update_symptom_log(client: AsyncClient) -> None:
    create_resp = await client.post("/api/symptoms", json=make_symptom_log_payload())
    log_id = create_resp.json()["id"]

    update_payload = {"notes": "Updated note"}
    resp = await client.put(f"/api/symptoms/{log_id}", json=update_payload)

    assert resp.status_code == 200
    body = resp.json()
    assert body["notes"] == "Updated note"
    # Fields not sent remain unchanged
    assert body["fatigue_severity"] == 6


async def test_update_symptom_log_pain_locations(client: AsyncClient) -> None:
    create_resp = await client.post("/api/symptoms", json=make_symptom_log_payload())
    log_id = create_resp.json()["id"]

    new_locations = [
        {"location": "left_hip", "severity": 6, "descriptors": ["aching"], "note": None},
        {"location": "right_foot", "severity": 9, "descriptors": [], "note": "very sore"},
    ]
    resp = await client.put(
        f"/api/symptoms/{log_id}", json={"pain_locations": new_locations}
    )

    assert resp.status_code == 200
    body = resp.json()
    assert len(body["pain_locations"]) == 2
    assert body["pain_locations"][0]["location"] == "left_hip"
    assert body["pain_locations"][1]["severity"] == 9
    # pain_severity should be recomputed
    assert body["pain_severity"] == 9


async def test_update_symptom_log_not_found(client: AsyncClient) -> None:
    resp = await client.put("/api/symptoms/99999", json={"notes": "test"})

    assert resp.status_code == 404


# ---------------------------------------------------------------------------
# DELETE /api/symptoms/{id}
# ---------------------------------------------------------------------------


async def test_delete_symptom_log(client: AsyncClient) -> None:
    create_resp = await client.post("/api/symptoms", json=make_symptom_log_payload())
    log_id = create_resp.json()["id"]

    resp = await client.delete(f"/api/symptoms/{log_id}")
    assert resp.status_code == 204

    # Verify it's gone
    get_resp = await client.get(f"/api/symptoms/{log_id}")
    assert get_resp.status_code == 404


async def test_delete_symptom_log_not_found(client: AsyncClient) -> None:
    resp = await client.delete("/api/symptoms/99999")

    assert resp.status_code == 404
