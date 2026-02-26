from sqlalchemy import Boolean, ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin


class Medication(TimestampMixin, Base):
    __tablename__ = "medications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    dosage: Mapped[str | None] = mapped_column(Text, nullable=True)
    frequency: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
