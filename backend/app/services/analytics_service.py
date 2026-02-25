from datetime import datetime, timezone

import numpy as np
import pandas as pd
from scipy import stats
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.biometric import BiometricReading
from app.models.contextual import ContextualData
from app.models.correlation import CorrelationCache
from app.models.symptom import SymptomLog


SYMPTOM_METRICS = ["pain_severity", "fatigue_severity", "brain_fog", "mood"]
BIOMETRIC_METRICS = [
    "sleep_duration", "sleep_efficiency", "hrv_rmssd", "resting_hr",
]
WEATHER_METRICS = ["barometric_pressure", "temperature", "humidity"]
ALL_METRICS = SYMPTOM_METRICS + BIOMETRIC_METRICS + WEATHER_METRICS


class AnalyticsService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def _build_dataframe(self) -> pd.DataFrame:
        symptom_result = await self.session.execute(select(SymptomLog))
        symptoms = symptom_result.scalars().all()
        symptom_df = pd.DataFrame(
            [
                {
                    "date": s.date,
                    "pain_severity": s.pain_severity,
                    "fatigue_severity": s.fatigue_severity,
                    "brain_fog": s.brain_fog,
                    "mood": s.mood,
                }
                for s in symptoms
            ]
        )

        bio_result = await self.session.execute(select(BiometricReading))
        bios = bio_result.scalars().all()
        bio_df = pd.DataFrame(
            [
                {
                    "date": b.date,
                    "sleep_duration": b.sleep_duration,
                    "sleep_efficiency": b.sleep_efficiency,
                    "hrv_rmssd": b.hrv_rmssd,
                    "resting_hr": b.resting_hr,
                }
                for b in bios
            ]
        )

        ctx_result = await self.session.execute(select(ContextualData))
        ctxs = ctx_result.scalars().all()
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
            return pd.DataFrame()

        df = symptom_df
        if not bio_df.empty:
            df = df.merge(bio_df, on="date", how="outer")
        if not ctx_df.empty:
            df = df.merge(ctx_df, on="date", how="outer")

        df = df.sort_values("date").reset_index(drop=True)
        return df

    async def compute_correlations(
        self, method: str = "spearman", max_lag: int = 0
    ) -> list[CorrelationCache]:
        df = await self._build_dataframe()
        if df.empty or len(df) < 5:
            return []

        now = datetime.now(timezone.utc).isoformat()
        date_range_start = df["date"].min()
        date_range_end = df["date"].max()

        await self.session.execute(delete(CorrelationCache).where(CorrelationCache.lag_days == 0))

        results: list[CorrelationCache] = []
        available = [m for m in ALL_METRICS if m in df.columns]

        for i, metric_a in enumerate(available):
            for metric_b in available[i + 1:]:
                pair = df[[metric_a, metric_b]].dropna()
                if len(pair) < 5:
                    continue

                if method == "pearson":
                    coeff, pval = stats.pearsonr(pair[metric_a], pair[metric_b])
                else:
                    coeff, pval = stats.spearmanr(pair[metric_a], pair[metric_b])

                cache = CorrelationCache(
                    computed_at=now,
                    metric_a=metric_a,
                    metric_b=metric_b,
                    lag_days=0,
                    correlation_coefficient=round(float(coeff), 4),
                    p_value=round(float(pval), 6),
                    sample_size=len(pair),
                    date_range_start=date_range_start,
                    date_range_end=date_range_end,
                    method=method,
                )
                self.session.add(cache)
                results.append(cache)

        await self.session.commit()
        return results

    async def compute_lagged_correlations(
        self, metric_a: str, metric_b: str, max_lag: int = 7
    ) -> list[CorrelationCache]:
        df = await self._build_dataframe()
        if df.empty or metric_a not in df.columns or metric_b not in df.columns:
            return []

        now = datetime.now(timezone.utc).isoformat()
        date_range_start = df["date"].min()
        date_range_end = df["date"].max()
        results: list[CorrelationCache] = []

        for lag in range(max_lag + 1):
            if lag == 0:
                a_vals = df[metric_a]
                b_vals = df[metric_b]
            else:
                a_vals = df[metric_a].iloc[lag:]
                b_vals = df[metric_b].iloc[:-lag]

            pair = pd.DataFrame({"a": a_vals.values, "b": b_vals.values}).dropna()
            if len(pair) < 5:
                continue

            coeff, pval = stats.spearmanr(pair["a"], pair["b"])
            if np.isnan(coeff):
                continue

            cache = CorrelationCache(
                computed_at=now,
                metric_a=metric_a,
                metric_b=metric_b,
                lag_days=lag,
                correlation_coefficient=round(float(coeff), 4),
                p_value=round(float(pval), 6),
                sample_size=len(pair),
                date_range_start=date_range_start,
                date_range_end=date_range_end,
                method="spearman",
            )
            results.append(cache)

        return results
