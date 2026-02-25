from pydantic import BaseModel


class MedicationCreate(BaseModel):
    name: str
    dosage: str | None = None
    frequency: str | None = None


class MedicationUpdate(BaseModel):
    name: str | None = None
    dosage: str | None = None
    frequency: str | None = None
    is_active: bool | None = None


class MedicationResponse(BaseModel):
    id: int
    name: str
    dosage: str | None
    frequency: str | None
    is_active: bool
    created_at: str
    updated_at: str

    model_config = {"from_attributes": True}
