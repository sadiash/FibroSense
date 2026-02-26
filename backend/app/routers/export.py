from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_user
from app.database import get_session
from app.models.user import User
from app.services.export_service import ExportService

router = APIRouter(prefix="/api/export", tags=["export"])


@router.get("")
async def export_data(
    format: str = Query("csv", pattern="^(csv|json)$"),
    start_date: str | None = Query(None),
    end_date: str | None = Query(None),
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> StreamingResponse:
    service = ExportService(session, current_user.id)
    content, media_type, filename = await service.export(format, start_date, end_date)

    return StreamingResponse(
        content=iter([content]),
        media_type=media_type,
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
