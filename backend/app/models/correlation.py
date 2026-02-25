from sqlalchemy import Float, Index, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class CorrelationCache(Base):
    __tablename__ = "correlation_cache"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    computed_at: Mapped[str] = mapped_column(Text, nullable=False)
    metric_a: Mapped[str] = mapped_column(Text, nullable=False)
    metric_b: Mapped[str] = mapped_column(Text, nullable=False)
    lag_days: Mapped[int] = mapped_column(Integer, nullable=False)
    correlation_coefficient: Mapped[float] = mapped_column(Float, nullable=False)
    p_value: Mapped[float] = mapped_column(Float, nullable=False)
    sample_size: Mapped[int] = mapped_column(Integer, nullable=False)
    date_range_start: Mapped[str] = mapped_column(Text, nullable=False)
    date_range_end: Mapped[str] = mapped_column(Text, nullable=False)
    method: Mapped[str] = mapped_column(Text, default="pearson")

    __table_args__ = (
        Index("idx_correlation_cache_metrics", "metric_a", "metric_b", "lag_days"),
        Index("idx_correlation_cache_computed", "computed_at"),
    )
