from pydantic import BaseModel


class ExportRequest(BaseModel):
    format: str = "csv"
    start_date: str | None = None
    end_date: str | None = None
