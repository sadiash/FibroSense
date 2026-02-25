"""Tests for the /api/medications router."""

from httpx import AsyncClient

from tests.conftest import make_medication_payload


# ---------------------------------------------------------------------------
# POST /api/medications — create
# ---------------------------------------------------------------------------


async def test_create_medication(client: AsyncClient) -> None:
    payload = make_medication_payload()
    resp = await client.post("/api/medications", json=payload)

    assert resp.status_code == 201
    body = resp.json()
    assert body["name"] == "Ibuprofen"
    assert body["dosage"] == "200mg"
    assert body["frequency"] == "twice daily"
    assert body["is_active"] is True
    assert "id" in body
    assert "created_at" in body
    assert "updated_at" in body


async def test_create_medication_name_only(client: AsyncClient) -> None:
    resp = await client.post("/api/medications", json={"name": "Aspirin"})

    assert resp.status_code == 201
    body = resp.json()
    assert body["name"] == "Aspirin"
    assert body["dosage"] is None
    assert body["frequency"] is None


# ---------------------------------------------------------------------------
# GET /api/medications — list
# ---------------------------------------------------------------------------


async def test_list_medications_empty(client: AsyncClient) -> None:
    resp = await client.get("/api/medications")

    assert resp.status_code == 200
    assert resp.json() == []


async def test_list_medications_active_only(client: AsyncClient) -> None:
    await client.post("/api/medications", json=make_medication_payload(name="Med A"))
    await client.post("/api/medications", json=make_medication_payload(name="Med B"))

    resp = await client.get("/api/medications")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 2


async def test_list_medications_includes_inactive(client: AsyncClient) -> None:
    create_resp = await client.post(
        "/api/medications", json=make_medication_payload(name="Med A")
    )
    med_id = create_resp.json()["id"]
    # Soft-delete (deactivate)
    await client.delete(f"/api/medications/{med_id}")

    # active_only=true should hide it
    resp = await client.get("/api/medications", params={"active_only": "true"})
    assert len(resp.json()) == 0

    # active_only=false should show it
    resp = await client.get("/api/medications", params={"active_only": "false"})
    assert len(resp.json()) == 1
    assert resp.json()[0]["is_active"] is False


# ---------------------------------------------------------------------------
# PUT /api/medications/{id} — update
# ---------------------------------------------------------------------------


async def test_update_medication(client: AsyncClient) -> None:
    create_resp = await client.post(
        "/api/medications", json=make_medication_payload()
    )
    med_id = create_resp.json()["id"]

    resp = await client.put(
        f"/api/medications/{med_id}",
        json={"dosage": "400mg", "frequency": "once daily"},
    )

    assert resp.status_code == 200
    body = resp.json()
    assert body["dosage"] == "400mg"
    assert body["frequency"] == "once daily"
    assert body["name"] == "Ibuprofen"  # unchanged


async def test_update_medication_not_found(client: AsyncClient) -> None:
    resp = await client.put(
        "/api/medications/99999", json={"name": "Nope"}
    )
    assert resp.status_code == 404


# ---------------------------------------------------------------------------
# DELETE /api/medications/{id} — soft delete
# ---------------------------------------------------------------------------


async def test_delete_medication_soft_deletes(client: AsyncClient) -> None:
    create_resp = await client.post(
        "/api/medications", json=make_medication_payload()
    )
    med_id = create_resp.json()["id"]

    resp = await client.delete(f"/api/medications/{med_id}")
    assert resp.status_code == 204

    # Should be hidden from active list
    list_resp = await client.get("/api/medications")
    assert len(list_resp.json()) == 0

    # Still exists when including inactive
    list_resp = await client.get(
        "/api/medications", params={"active_only": "false"}
    )
    assert len(list_resp.json()) == 1
    assert list_resp.json()[0]["is_active"] is False


async def test_delete_medication_not_found(client: AsyncClient) -> None:
    resp = await client.delete("/api/medications/99999")
    assert resp.status_code == 404
