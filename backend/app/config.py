from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite+aiosqlite:///./fibrosense.db"
    oura_api_key: str = ""
    weather_latitude: float = 40.7128
    weather_longitude: float = -74.0060
    cors_origins: str = "http://localhost:3000"
    secret_key: str = "dev-only-change-me-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7

    model_config = {"env_file": ".env", "extra": "ignore"}

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",")]


settings = Settings()
