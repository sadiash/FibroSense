import json
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.models.symptom import SymptomLog
from app.schemas.symptom import SymptomLogCreate, SymptomLogResponse, SymptomLogUpdate

router = APIRouter(prefix="/api/symptoms", tags=["symptoms"])


def _deserialize_log(log: SymptomLog) -> None:
    """Deserialize JSON text fields on a SymptomLog instance in-place."""
    log.pain_locations = json.loads(log.pain_locations)  # type: ignore[assignment]
    if log.missed_medications:
        log.missed_medications = json.loads(log.missed_medications)  # type: ignore[assignment]


@router.post("", response_model=SymptomLogResponse, status_code=201)
async def create_symptom_log(
    data: SymptomLogCreate, session: AsyncSession = Depends(get_session)
) -> SymptomLog:
    # Auto-compute pain_severity as max of per-area severities
    pain_severity = data.pain_severity
    if pain_severity is None:
        pain_severity = (
            max(e.severity for e in data.pain_locations) if data.pain_locations else 0
        )

    log = SymptomLog(
        date=data.date,
        pain_severity=pain_severity,
        pain_locations=json.dumps([e.model_dump() for e in data.pain_locations]),
        fatigue_severity=data.fatigue_severity,
        brain_fog=data.brain_fog,
        mood=data.mood,
        is_flare=data.is_flare,
        flare_severity=data.flare_severity if data.is_flare else None,
        notes=data.notes,
        missed_medications=(
            json.dumps(data.missed_medications) if data.missed_medications else None
        ),
    )
    session.add(log)
    await session.commit()
    await session.refresh(log)
    _deserialize_log(log)
    return log


@router.get("", response_model=list[SymptomLogResponse])
async def list_symptom_logs(
    start_date: str | None = Query(None),
    end_date: str | None = Query(None),
    session: AsyncSession = Depends(get_session),
) -> list[SymptomLog]:
    stmt = select(SymptomLog).order_by(SymptomLog.date.desc())
    if start_date:
        stmt = stmt.where(SymptomLog.date >= start_date)
    if end_date:
        stmt = stmt.where(SymptomLog.date <= end_date)
    result = await session.execute(stmt)
    logs = list(result.scalars().all())
    for log in logs:
        _deserialize_log(log)
    return logs


@router.get("/{log_id}", response_model=SymptomLogResponse)
async def get_symptom_log(
    log_id: int, session: AsyncSession = Depends(get_session)
) -> SymptomLog:
    log = await session.get(SymptomLog, log_id)
    if not log:
        raise HTTPException(status_code=404, detail="Symptom log not found")
    _deserialize_log(log)
    return log


@router.put("/{log_id}", response_model=SymptomLogResponse)
async def update_symptom_log(
    log_id: int, data: SymptomLogUpdate, session: AsyncSession = Depends(get_session)
) -> SymptomLog:
    log = await session.get(SymptomLog, log_id)
    if not log:
        raise HTTPException(status_code=404, detail="Symptom log not found")

    update_data = data.model_dump(exclude_unset=True)

    if "pain_locations" in update_data and update_data["pain_locations"] is not None:
        entries = data.pain_locations  # already validated PainLocationEntry list
        update_data["pain_locations"] = json.dumps(
            [e.model_dump() for e in entries]  # type: ignore[union-attr]
        )
        # Recompute pain_severity as max of per-area severities
        if "pain_severity" not in update_data or update_data["pain_severity"] is None:
            update_data["pain_severity"] = (
                max(e.severity for e in entries) if entries else 0  # type: ignore[union-attr]
            )

    if "missed_medications" in update_data:
        meds = update_data["missed_medications"]
        update_data["missed_medications"] = json.dumps(meds) if meds else None

    for field, value in update_data.items():
        setattr(log, field, value)

    log.updated_at = datetime.now(timezone.utc).isoformat()
    await session.commit()
    await session.refresh(log)
    _deserialize_log(log)
    return log


@router.delete("/{log_id}", status_code=204)
async def delete_symptom_log(
    log_id: int, session: AsyncSession = Depends(get_session)
) -> None:
    log = await session.get(SymptomLog, log_id)
    if not log:
        raise HTTPException(status_code=404, detail="Symptom log not found")
    await session.delete(log)
    await session.commit()
