import os
import subprocess
from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from starlette.middleware.gzip import GZipMiddleware

from app.config import settings
from app.database import engine
from app.models.base import Base
from app.routers import biometrics, contextual, correlations, demo_data, export, medications, settings_router, symptoms, sync
from app.services.scheduler import start_scheduler


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Auto-seed demo data if DB is empty (e.g. fresh Render deploy)
    if os.getenv("AUTO_SEED_DEMO", "").lower() in ("1", "true", "yes"):
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT COUNT(*) FROM symptom_logs"))
            count = result.scalar()
        if count == 0:
            seed_script = os.path.join(os.path.dirname(__file__), "..", "scripts", "seed_fictitious_data.py")
            subprocess.run(["python", seed_script], check=True)

    start_scheduler()
    yield


app = FastAPI(title="FibroSense", version="0.1.0", lifespan=lifespan)

app.add_middleware(GZipMiddleware, minimum_size=500)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(symptoms.router)
app.include_router(medications.router)
app.include_router(biometrics.router)
app.include_router(contextual.router)
app.include_router(correlations.router)
app.include_router(sync.router)
app.include_router(export.router)
app.include_router(settings_router.router)
app.include_router(demo_data.router)


@app.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "healthy"}
