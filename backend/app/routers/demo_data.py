from fastapi import APIRouter, Depends
from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.models.biometric import BiometricReading
from app.models.contextual import ContextualData
from app.models.correlation import CorrelationCache
from app.models.medication import Medication
from app.models.symptom import SymptomLog
from app.models.sync_log import SyncLog
from app.schemas.demo_data import DemoDataClearResponse, DemoDataStatusResponse

router = APIRouter(prefix="/api/demo-data", tags=["demo-data"])

SEED_DATE_START = "2025-12-01"
SEED_DATE_END = "2026-02-28"
SEEDED_MEDICATION_NAMES = [
    "Duloxetine (Cymbalta)",
    "Gabapentin (Neurontin)",
    "Melatonin",
]


@router.get("/status", response_model=DemoDataStatusResponse)
async def get_demo_data_status(
    session: AsyncSession = Depends(get_session),
) -> DemoDataStatusResponse:
    biometrics = await session.scalar(
        select(func.count()).select_from(BiometricReading).where(
            BiometricReading.source == "fictitious_oura"
        )
    )
    symptoms = await session.scalar(
        select(func.count()).select_from(SymptomLog).where(
            SymptomLog.notes.like("[FICTITIOUS]%")
        )
    )
    contextual = await session.scalar(
        select(func.count()).select_from(ContextualData).where(
            ContextualData.date.between(SEED_DATE_START, SEED_DATE_END)
        )
    )
    medications = await session.scalar(
        select(func.count()).select_from(Medication).where(
            Medication.name.in_(SEEDED_MEDICATION_NAMES)
        )
    )
    sync_logs = await session.scalar(
        select(func.count()).select_from(SyncLog).where(
            SyncLog.source == "fictitious_seed"
        )
    )

    return DemoDataStatusResponse(
        has_demo_data=(biometrics or 0) > 0,
        biometric_readings_count=biometrics or 0,
        symptom_logs_count=symptoms or 0,
        contextual_data_count=contextual or 0,
        medications_count=medications or 0,
        sync_log_count=sync_logs or 0,
    )


@router.delete("", response_model=DemoDataClearResponse)
async def clear_demo_data(
    session: AsyncSession = Depends(get_session),
) -> DemoDataClearResponse:
    try:
        total = 0

        # Delete biometric readings with fictitious source
        result = await session.execute(
            delete(BiometricReading).where(
                BiometricReading.source == "fictitious_oura"
            )
        )
        total += result.rowcount

        # Delete symptom logs with [FICTITIOUS] prefix
        result = await session.execute(
            delete(SymptomLog).where(
                SymptomLog.notes.like("[FICTITIOUS]%")
            )
        )
        total += result.rowcount

        # Delete symptom logs with null notes in seed date range
        result = await session.execute(
            delete(SymptomLog).where(
                SymptomLog.notes.is_(None),
                SymptomLog.date.between(SEED_DATE_START, SEED_DATE_END),
            )
        )
        total += result.rowcount

        # Delete contextual data in seed date range
        result = await session.execute(
            delete(ContextualData).where(
                ContextualData.date.between(SEED_DATE_START, SEED_DATE_END)
            )
        )
        total += result.rowcount

        # Delete seeded medications
        result = await session.execute(
            delete(Medication).where(
                Medication.name.in_(SEEDED_MEDICATION_NAMES)
            )
        )
        total += result.rowcount

        # Delete fictitious sync logs
        result = await session.execute(
            delete(SyncLog).where(SyncLog.source == "fictitious_seed")
        )
        total += result.rowcount

        # Clear all correlation cache (derived data, will be recomputed)
        result = await session.execute(delete(CorrelationCache))
        total += result.rowcount

        await session.commit()

        return DemoDataClearResponse(
            status="completed",
            records_deleted=total,
        )
    except Exception as e:
        await session.rollback()
        return DemoDataClearResponse(
            status="error",
            error_message=str(e),
        )
