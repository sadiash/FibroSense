"""Create all database tables (sync, for use in build steps)."""
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent.parent / "fibrosense.db"

# Import all models so Base.metadata has them registered
from app.models.base import Base  # noqa: E402
from app.models import symptom, medication, biometric, contextual, correlation, sync_log, settings  # noqa: E402, F401

from sqlalchemy import create_engine

engine = create_engine(f"sqlite:///{DB_PATH}")
Base.metadata.create_all(engine)
print(f"Tables created at {DB_PATH}")
