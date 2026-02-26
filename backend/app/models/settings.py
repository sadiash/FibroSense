from sqlalchemy import ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin


class AppSetting(TimestampMixin, Base):
    __tablename__ = "app_settings"

    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), primary_key=True)
    key: Mapped[str] = mapped_column(Text, primary_key=True)
    value: Mapped[str] = mapped_column(Text, nullable=False)
