"""Tests for the GET /health endpoint."""

from httpx import AsyncClient


async def test_health_returns_200(client: AsyncClient) -> None:
    response = await client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


async def test_health_json_content_type(client: AsyncClient) -> None:
    response = await client.get("/health")

    assert response.headers["content-type"] == "application/json"
