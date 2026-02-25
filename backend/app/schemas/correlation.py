from pydantic import BaseModel


class CorrelationResponse(BaseModel):
    metric_a: str
    metric_b: str
    lag_days: int
    correlation_coefficient: float
    p_value: float
    sample_size: int
    method: str

    model_config = {"from_attributes": True}


class CorrelationComputeRequest(BaseModel):
    method: str = "spearman"
    max_lag: int = 0
