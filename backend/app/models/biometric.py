from sqlalchemy import CheckConstraint, Float, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin


class BiometricReading(TimestampMixin, Base):
    __tablename__ = "biometric_readings"

    date: Mapped[str] = mapped_column(Text, primary_key=True)
    sleep_duration: Mapped[float] = mapped_column(Float, nullable=False)
    sleep_efficiency: Mapped[float] = mapped_column(Float, nullable=False)
    deep_sleep_pct: Mapped[float] = mapped_column(Float, nullable=False)
    rem_sleep_pct: Mapped[float] = mapped_column(Float, nullable=False)
    hrv_rmssd: Mapped[float] = mapped_column(Float, nullable=False)
    resting_hr: Mapped[float] = mapped_column(Float, nullable=False)
    temperature_deviation: Mapped[float] = mapped_column(Float, nullable=False)
    activity_score: Mapped[int] = mapped_column(Integer, nullable=False)
    activity_calories: Mapped[int] = mapped_column(Integer, nullable=False)
    spo2: Mapped[float | None] = mapped_column(Float, nullable=True)
    source: Mapped[str] = mapped_column(Text, default="oura")

    __table_args__ = (
        CheckConstraint(
            "sleep_efficiency >= 0 AND sleep_efficiency <= 100", name="ck_sleep_efficiency"
        ),
        CheckConstraint("deep_sleep_pct >= 0 AND deep_sleep_pct <= 100", name="ck_deep_sleep_pct"),
        CheckConstraint("rem_sleep_pct >= 0 AND rem_sleep_pct <= 100", name="ck_rem_sleep_pct"),
    )
