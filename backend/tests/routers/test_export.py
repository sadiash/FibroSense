"""Tests for the /api/export router."""

import csv
import io
import json

from httpx import AsyncClient

from tests.conftest import make_biometric_payload, make_symptom_log_payload


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


async def _seed_data(client: AsyncClient) -> None:
    """Insert one symptom log and one biometric reading for export tests."""
    await client.post(
        "/api/symptoms",
        json=make_symptom_log_payload(date="2025-01-15"),
    )
    await client.post(
        "/api/biometrics",
        json=make_biometric_payload(date="2025-01-15"),
    )


# ---------------------------------------------------------------------------
# GET /api/export?format=csv
# ---------------------------------------------------------------------------


async def test_export_csv(client: AsyncClient) -> None:
    await _seed_data(client)

    resp = await client.get("/api/export", params={"format": "csv"})

    assert resp.status_code == 200
    assert "text/csv" in resp.headers["content-type"]
    assert "fibrosense-export.csv" in resp.headers.get("content-disposition", "")

    # Parse CSV to verify structure
    reader = csv.DictReader(io.StringIO(resp.text))
    rows = list(reader)
    assert len(rows) >= 1
    assert "date" in reader.fieldnames
    assert "pain_severity" in reader.fieldnames


async def test_export_csv_empty(client: AsyncClient) -> None:
    """Exporting with no data should still return a valid CSV (possibly empty)."""
    resp = await client.get("/api/export", params={"format": "csv"})

    assert resp.status_code == 200
    assert "text/csv" in resp.headers["content-type"]


# ---------------------------------------------------------------------------
# GET /api/export?format=json
# ---------------------------------------------------------------------------


async def test_export_json(client: AsyncClient) -> None:
    await _seed_data(client)

    resp = await client.get("/api/export", params={"format": "json"})

    assert resp.status_code == 200
    assert "application/json" in resp.headers["content-type"]
    assert "fibrosense-export.json" in resp.headers.get("content-disposition", "")

    data = json.loads(resp.text)
    assert isinstance(data, list)
    assert len(data) >= 1
    assert "date" in data[0]
    assert "pain_severity" in data[0]


async def test_export_json_empty(client: AsyncClient) -> None:
    """Exporting JSON with no data should return an empty list."""
    resp = await client.get("/api/export", params={"format": "json"})

    assert resp.status_code == 200
    data = json.loads(resp.text)
    assert isinstance(data, list)
    assert len(data) == 0


# ---------------------------------------------------------------------------
# Invalid format
# ---------------------------------------------------------------------------


async def test_export_invalid_format(client: AsyncClient) -> None:
    resp = await client.get("/api/export", params={"format": "xml"})

    assert resp.status_code == 422
