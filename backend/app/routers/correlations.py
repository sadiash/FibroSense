from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.models.correlation import CorrelationCache
from app.schemas.correlation import CorrelationComputeRequest, CorrelationResponse
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/api/correlations", tags=["correlations"])


@router.get("", response_model=list[CorrelationResponse])
async def get_correlations(
    session: AsyncSession = Depends(get_session),
) -> list[CorrelationCache]:
    stmt = select(CorrelationCache).order_by(CorrelationCache.computed_at.desc())
    result = await session.execute(stmt)
    return list(result.scalars().all())


@router.get("/matrix", response_model=list[CorrelationResponse])
async def get_correlation_matrix(
    session: AsyncSession = Depends(get_session),
) -> list[CorrelationCache]:
    stmt = (
        select(CorrelationCache)
        .where(CorrelationCache.lag_days == 0)
        .order_by(CorrelationCache.computed_at.desc())
    )
    result = await session.execute(stmt)
    return list(result.scalars().all())


@router.post("/compute", response_model=list[CorrelationResponse])
async def compute_correlations(
    request: CorrelationComputeRequest,
    session: AsyncSession = Depends(get_session),
) -> list[CorrelationCache]:
    service = AnalyticsService(session)
    return await service.compute_correlations(method=request.method, max_lag=request.max_lag)


@router.get("/lagged", response_model=list[CorrelationResponse])
async def get_lagged_correlations(
    metric_a: str = Query(...),
    metric_b: str = Query(...),
    max_lag: int = Query(7, ge=0, le=30),
    session: AsyncSession = Depends(get_session),
) -> list[CorrelationCache]:
    # Check cache first
    stmt = (
        select(CorrelationCache)
        .where(
            CorrelationCache.metric_a == metric_a,
            CorrelationCache.metric_b == metric_b,
            CorrelationCache.lag_days <= max_lag,
        )
        .order_by(CorrelationCache.lag_days)
    )
    result = await session.execute(stmt)
    cached = list(result.scalars().all())
    if cached:
        return cached

    service = AnalyticsService(session)
    return await service.compute_lagged_correlations(metric_a, metric_b, max_lag)
