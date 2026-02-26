from sqlalchemy import CheckConstraint, Float, ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin


class ContextualData(TimestampMixin, Base):
    __tablename__ = "contextual_data"

    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), primary_key=True)
    date: Mapped[str] = mapped_column(Text, primary_key=True)
    barometric_pressure: Mapped[float | None] = mapped_column(Float, nullable=True)
    temperature: Mapped[float | None] = mapped_column(Float, nullable=True)
    humidity: Mapped[float | None] = mapped_column(Float, nullable=True)
    menstrual_phase: Mapped[str | None] = mapped_column(Text, nullable=True)
    stress_event: Mapped[str | None] = mapped_column(Text, nullable=True)
    medication_change: Mapped[str | None] = mapped_column(Text, nullable=True)
    exercise_type: Mapped[str | None] = mapped_column(Text, nullable=True)
    exercise_rpe: Mapped[int | None] = mapped_column(Integer, nullable=True)
    diet_flags: Mapped[str | None] = mapped_column(Text, nullable=True)

    __table_args__ = (
        CheckConstraint(
            "menstrual_phase IS NULL OR menstrual_phase IN "
            "('menstrual', 'follicular', 'ovulatory', 'luteal', 'not_applicable')",
            name="ck_menstrual_phase",
        ),
        CheckConstraint(
            "exercise_rpe IS NULL OR (exercise_rpe >= 1 AND exercise_rpe <= 10)",
            name="ck_exercise_rpe",
        ),
    )
