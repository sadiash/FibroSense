from pydantic import BaseModel


class SyncTriggerResponse(BaseModel):
    status: str
    records_synced: int = 0
    error_message: str | None = None


class SyncStatusResponse(BaseModel):
    id: int
    source: str
    sync_type: str
    started_at: str
    completed_at: str | None
    status: str
    records_synced: int
    error_message: str | None

    model_config = {"from_attributes": True}
