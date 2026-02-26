import json
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.models.contextual import ContextualData
from app.models.symptom import SymptomLog
from app.schemas.symptom import SymptomLogCreate, SymptomLogResponse, SymptomLogUpdate

router = APIRouter(prefix="/api/symptoms", tags=["symptoms"])


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

    # Upsert contextual data if any contextual fields are provided
    ctx_fields = {
        "menstrual_phase": data.menstrual_phase,
        "stress_event": data.stress_event,
        "medication_change": data.medication_change,
        "exercise_type": data.exercise_type,
        "exercise_rpe": data.exercise_rpe if data.exercise_type else None,
        "diet_flags": data.diet_flags,
    }
    if any(v is not None for v in ctx_fields.values()):
        existing_ctx = await session.get(ContextualData, data.date)
        if existing_ctx:
            for field, value in ctx_fields.items():
                if value is not None:
                    setattr(existing_ctx, field, value)
            existing_ctx.updated_at = datetime.now(timezone.utc).isoformat()
        else:
            ctx = ContextualData(date=data.date, **ctx_fields)
            session.add(ctx)

    await session.commit()
    await session.refresh(log)
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
    return list(result.scalars().all())


@router.get("/{log_id}", response_model=SymptomLogResponse)
async def get_symptom_log(
    log_id: int, session: AsyncSession = Depends(get_session)
) -> SymptomLog:
    log = await session.get(SymptomLog, log_id)
    if not log:
        raise HTTPException(status_code=404, detail="Symptom log not found")
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
