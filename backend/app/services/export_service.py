import json

import pandas as pd
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.biometric import BiometricReading
from app.models.contextual import ContextualData
from app.models.symptom import SymptomLog


class ExportService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def export(
        self, format: str, start_date: str | None, end_date: str | None
    ) -> tuple[bytes, str, str]:
        symptom_stmt = select(SymptomLog).order_by(SymptomLog.date)
        bio_stmt = select(BiometricReading).order_by(BiometricReading.date)
        ctx_stmt = select(ContextualData).order_by(ContextualData.date)

        if start_date:
            symptom_stmt = symptom_stmt.where(SymptomLog.date >= start_date)
            bio_stmt = bio_stmt.where(BiometricReading.date >= start_date)
            ctx_stmt = ctx_stmt.where(ContextualData.date >= start_date)
        if end_date:
            symptom_stmt = symptom_stmt.where(SymptomLog.date <= end_date)
            bio_stmt = bio_stmt.where(BiometricReading.date <= end_date)
            ctx_stmt = ctx_stmt.where(ContextualData.date <= end_date)

        symptoms = list((await self.session.execute(symptom_stmt)).scalars().all())
        bios = list((await self.session.execute(bio_stmt)).scalars().all())
        ctxs = list((await self.session.execute(ctx_stmt)).scalars().all())

        symptom_df = pd.DataFrame(
            [
                {
                    "date": s.date,
                    "pain_severity": s.pain_severity,
                    "pain_locations": s.pain_locations,
                    "fatigue_severity": s.fatigue_severity,
                    "brain_fog": s.brain_fog,
                    "mood": s.mood,
                    "is_flare": s.is_flare,
                    "flare_severity": s.flare_severity,
                    "notes": s.notes,
                }
                for s in symptoms
            ]
        )

        bio_df = pd.DataFrame(
            [
                {
                    "date": b.date,
                    "sleep_duration": b.sleep_duration,
                    "sleep_efficiency": b.sleep_efficiency,
                    "deep_sleep_pct": b.deep_sleep_pct,
                    "rem_sleep_pct": b.rem_sleep_pct,
                    "hrv_rmssd": b.hrv_rmssd,
                    "resting_hr": b.resting_hr,
                    "activity_score": b.activity_score,
                }
                for b in bios
            ]
        )

        ctx_df = pd.DataFrame(
            [
                {
                    "date": c.date,
                    "barometric_pressure": c.barometric_pressure,
                    "temperature": c.temperature,
                    "humidity": c.humidity,
                }
                for c in ctxs
            ]
        )

        if symptom_df.empty:
            df = pd.DataFrame()
        else:
            df = symptom_df
            if not bio_df.empty:
                df = df.merge(bio_df, on="date", how="outer")
            if not ctx_df.empty:
                df = df.merge(ctx_df, on="date", how="outer")
            df = df.sort_values("date")

        if format == "json":
            content = json.dumps(df.to_dict(orient="records"), indent=2).encode()
            return content, "application/json", "fibrosense-export.json"
        else:
            content = df.to_csv(index=False).encode()
            return content, "text/csv", "fibrosense-export.csv"
