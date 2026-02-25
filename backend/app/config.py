from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite+aiosqlite:///./fibrosense.db"
    oura_api_key: str = ""
    weather_latitude: float = 40.7128
    weather_longitude: float = -74.0060
    cors_origins: list[str] = ["http://localhost:3000"]

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
