from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_user
from app.database import get_session
from app.models.settings import AppSetting
from app.models.user import User
from app.schemas.settings import SettingResponse, SettingUpdate

router = APIRouter(prefix="/api/settings", tags=["settings"])


@router.get("", response_model=list[SettingResponse])
async def list_settings(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> list[AppSetting]:
    result = await session.execute(
        select(AppSetting).where(AppSetting.user_id == current_user.id)
    )
    return list(result.scalars().all())


@router.get("/{key}", response_model=SettingResponse)
async def get_setting(
    key: str,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> AppSetting:
    setting = await session.get(AppSetting, (current_user.id, key))
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    return setting


@router.put("/{key}", response_model=SettingResponse)
async def update_setting(
    key: str,
    data: SettingUpdate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> AppSetting:
    setting = await session.get(AppSetting, (current_user.id, key))
    if setting:
        setting.value = data.value
        setting.updated_at = datetime.now(timezone.utc).isoformat()
    else:
        setting = AppSetting(user_id=current_user.id, key=key, value=data.value)
        session.add(setting)

    await session.commit()
    await session.refresh(setting)
    return setting
