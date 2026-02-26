import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite+aiosqlite:///./fibrosense.db"
    oura_api_key: str = ""
    weather_latitude: float = 40.7128
    weather_longitude: float = -74.0060
    cors_origins: list[str] = ["http://localhost:3000"]

    model_config = {"env_file": ".env", "extra": "ignore"}

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        env_origins = os.getenv("CORS_ORIGINS")
        if env_origins:
            self.cors_origins = [o.strip() for o in env_origins.split(",")]


settings = Settings()
