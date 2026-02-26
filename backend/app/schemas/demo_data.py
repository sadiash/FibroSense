from pydantic import BaseModel


class DemoDataStatusResponse(BaseModel):
    has_demo_data: bool
    biometric_readings_count: int = 0
    symptom_logs_count: int = 0
    contextual_data_count: int = 0
    medications_count: int = 0
    sync_log_count: int = 0


class DemoDataClearResponse(BaseModel):
    status: str
    records_deleted: int = 0
    error_message: str | None = None
