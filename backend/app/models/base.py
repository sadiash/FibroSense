from datetime import datetime, timezone

from sqlalchemy import Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class TimestampMixin:
    created_at: Mapped[str] = mapped_column(
        Text,
        default=lambda: datetime.now(timezone.utc).isoformat(),
        nullable=False,
    )
    updated_at: Mapped[str] = mapped_column(
        Text,
        default=lambda: datetime.now(timezone.utc).isoformat(),
        onupdate=lambda: datetime.now(timezone.utc).isoformat(),
        nullable=False,
    )
