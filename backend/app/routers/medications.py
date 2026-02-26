from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_user
from app.database import get_session
from app.models.medication import Medication
from app.models.user import User
from app.schemas.medication import MedicationCreate, MedicationResponse, MedicationUpdate

router = APIRouter(prefix="/api/medications", tags=["medications"])


@router.get("", response_model=list[MedicationResponse])
async def list_medications(
    active_only: bool = Query(True),
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> list[Medication]:
    stmt = (
        select(Medication)
        .where(Medication.user_id == current_user.id)
        .order_by(Medication.name)
    )
    if active_only:
        stmt = stmt.where(Medication.is_active == True)  # noqa: E712
    result = await session.execute(stmt)
    return list(result.scalars().all())


@router.post("", response_model=MedicationResponse, status_code=201)
async def create_medication(
    data: MedicationCreate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> Medication:
    med = Medication(user_id=current_user.id, **data.model_dump())
    session.add(med)
    await session.commit()
    await session.refresh(med)
    return med


@router.put("/{med_id}", response_model=MedicationResponse)
async def update_medication(
    med_id: int,
    data: MedicationUpdate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> Medication:
    med = await session.get(Medication, med_id)
    if not med or med.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Medication not found")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(med, field, value)

    med.updated_at = datetime.now(timezone.utc).isoformat()
    await session.commit()
    await session.refresh(med)
    return med


@router.delete("/{med_id}", status_code=204)
async def delete_medication(
    med_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> None:
    med = await session.get(Medication, med_id)
    if not med or med.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Medication not found")
    med.is_active = False
    med.updated_at = datetime.now(timezone.utc).isoformat()
    await session.commit()
