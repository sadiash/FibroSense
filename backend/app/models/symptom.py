from sqlalchemy import Boolean, CheckConstraint, Index, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin


class SymptomLog(TimestampMixin, Base):
    __tablename__ = "symptom_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    date: Mapped[str] = mapped_column(Text, nullable=False)
    pain_severity: Mapped[int] = mapped_column(Integer, nullable=False)
    pain_locations: Mapped[str] = mapped_column(Text, nullable=False)  # JSON array
    fatigue_severity: Mapped[int] = mapped_column(Integer, nullable=False)
    brain_fog: Mapped[int] = mapped_column(Integer, nullable=False)
    mood: Mapped[int] = mapped_column(Integer, nullable=False)
    is_flare: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    flare_severity: Mapped[int | None] = mapped_column(Integer, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    missed_medications: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON array of medication IDs

    __table_args__ = (
        CheckConstraint("pain_severity >= 0 AND pain_severity <= 10", name="ck_pain_severity"),
        CheckConstraint(
            "fatigue_severity >= 0 AND fatigue_severity <= 10", name="ck_fatigue_severity"
        ),
        CheckConstraint("brain_fog >= 0 AND brain_fog <= 10", name="ck_brain_fog"),
        CheckConstraint("mood >= 0 AND mood <= 10", name="ck_mood"),
        CheckConstraint(
            "flare_severity IS NULL OR (flare_severity >= 1 AND flare_severity <= 10)",
            name="ck_flare_severity",
        ),
        Index("idx_symptom_logs_date", "date"),
        Index("idx_symptom_logs_is_flare", "is_flare", sqlite_where=(is_flare == True)),  # noqa: E712
    )
