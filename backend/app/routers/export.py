from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.services.export_service import ExportService

router = APIRouter(prefix="/api/export", tags=["export"])


@router.get("")
async def export_data(
    format: str = Query("csv", pattern="^(csv|json)$"),
    start_date: str | None = Query(None),
    end_date: str | None = Query(None),
    session: AsyncSession = Depends(get_session),
) -> StreamingResponse:
    service = ExportService(session)
    content, media_type, filename = await service.export(format, start_date, end_date)

    return StreamingResponse(
        content=iter([content]),
        media_type=media_type,
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
