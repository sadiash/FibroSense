from pydantic import BaseModel, Field


class ContextualDataCreate(BaseModel):
    date: str
    barometric_pressure: float | None = None
    temperature: float | None = None
    humidity: float | None = None
    menstrual_phase: str | None = None
    stress_event: str | None = None
    medication_change: str | None = None
    exercise_type: str | None = None
    exercise_rpe: int | None = Field(default=None, ge=1, le=10)


class ContextualDataUpdate(BaseModel):
    barometric_pressure: float | None = None
    temperature: float | None = None
    humidity: float | None = None
    menstrual_phase: str | None = None
    stress_event: str | None = None
    medication_change: str | None = None
    exercise_type: str | None = None
    exercise_rpe: int | None = Field(default=None, ge=1, le=10)


class ContextualDataResponse(BaseModel):
    date: str
    barometric_pressure: float | None
    temperature: float | None
    humidity: float | None
    menstrual_phase: str | None
    stress_event: str | None
    medication_change: str | None
    exercise_type: str | None
    exercise_rpe: int | None
    created_at: str
    updated_at: str

    model_config = {"from_attributes": True}
