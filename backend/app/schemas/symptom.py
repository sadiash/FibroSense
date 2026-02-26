import json

from pydantic import BaseModel, Field, model_validator


class PainLocationEntry(BaseModel):
    location: str
    severity: int = Field(ge=1, le=10, default=5)
    descriptors: list[str] = []
    note: str | None = None


class SymptomLogCreate(BaseModel):
    date: str
    pain_severity: int | None = Field(default=None, ge=0, le=10)
    pain_locations: list[PainLocationEntry]
    fatigue_severity: int = Field(ge=0, le=10)
    brain_fog: int = Field(ge=0, le=10)
    mood: int = Field(ge=0, le=10)
    is_flare: bool = False
    flare_severity: int | None = Field(default=None, ge=1, le=10)
    notes: str | None = None
    missed_medications: list[int] | None = None
    menstrual_phase: str | None = None
    stress_event: str | None = None
    medication_change: str | None = None
    exercise_type: str | None = None
    exercise_rpe: int | None = Field(default=None, ge=1, le=10)
    diet_flags: str | None = None


class SymptomLogUpdate(BaseModel):
    pain_severity: int | None = Field(default=None, ge=0, le=10)
    pain_locations: list[PainLocationEntry] | None = None
    fatigue_severity: int | None = Field(default=None, ge=0, le=10)
    brain_fog: int | None = Field(default=None, ge=0, le=10)
    mood: int | None = Field(default=None, ge=0, le=10)
    is_flare: bool | None = None
    flare_severity: int | None = Field(default=None, ge=1, le=10)
    notes: str | None = None
    missed_medications: list[int] | None = None


class SymptomLogResponse(BaseModel):
    id: int
    date: str
    pain_severity: int
    pain_locations: list[PainLocationEntry]
    fatigue_severity: int
    brain_fog: int
    mood: int
    is_flare: bool
    flare_severity: int | None
    notes: str | None
    missed_medications: list[int] | None
    created_at: str
    updated_at: str

    model_config = {"from_attributes": True}

    @model_validator(mode="before")
    @classmethod
    def parse_json_fields(cls, data):  # type: ignore[no-untyped-def]
        if hasattr(data, "__dict__"):
            locs = getattr(data, "pain_locations", None)
            if isinstance(locs, str):
                object.__setattr__(data, "pain_locations", json.loads(locs))
            meds = getattr(data, "missed_medications", None)
            if isinstance(meds, str):
                object.__setattr__(data, "missed_medications", json.loads(meds))
        return data
