from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.models.settings import AppSetting
from app.schemas.settings import SettingResponse, SettingUpdate

router = APIRouter(prefix="/api/settings", tags=["settings"])


@router.get("", response_model=list[SettingResponse])
async def list_settings(
    session: AsyncSession = Depends(get_session),
) -> list[AppSetting]:
    result = await session.execute(select(AppSetting))
    return list(result.scalars().all())


@router.get("/{key}", response_model=SettingResponse)
async def get_setting(
    key: str, session: AsyncSession = Depends(get_session)
) -> AppSetting:
    setting = await session.get(AppSetting, key)
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    return setting


@router.put("/{key}", response_model=SettingResponse)
async def update_setting(
    key: str, data: SettingUpdate, session: AsyncSession = Depends(get_session)
) -> AppSetting:
    setting = await session.get(AppSetting, key)
    if setting:
        setting.value = data.value
        setting.updated_at = datetime.now(timezone.utc).isoformat()
    else:
        setting = AppSetting(key=key, value=data.value)
        session.add(setting)

    await session.commit()
    await session.refresh(setting)
    return setting
