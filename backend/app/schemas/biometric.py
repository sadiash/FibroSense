from pydantic import BaseModel, Field


class BiometricReadingCreate(BaseModel):
    date: str
    sleep_duration: float = Field(ge=0)
    sleep_efficiency: float = Field(ge=0, le=100)
    deep_sleep_pct: float = Field(ge=0, le=100)
    rem_sleep_pct: float = Field(ge=0, le=100)
    hrv_rmssd: float = Field(ge=0)
    resting_hr: float = Field(ge=0)
    temperature_deviation: float
    activity_score: int = Field(ge=0)
    activity_calories: int = Field(ge=0)
    spo2: float | None = None
    source: str = "oura"


class BiometricReadingResponse(BaseModel):
    date: str
    sleep_duration: float
    sleep_efficiency: float
    deep_sleep_pct: float
    rem_sleep_pct: float
    hrv_rmssd: float
    resting_hr: float
    temperature_deviation: float
    activity_score: int
    activity_calories: int
    spo2: float | None
    source: str
    created_at: str
    updated_at: str

    model_config = {"from_attributes": True}
