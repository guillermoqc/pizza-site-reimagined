from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    database_url: str = "postgresql+asyncpg://user:password@localhost:5432/db"
    secret_key: str = "change-this-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 480  # 8 hours

    # First admin seeded on startup
    first_admin_email: str = "admin@pizza.com"
    first_admin_password: str = "changeme123"
    first_admin_full_name: str = "Administrator"

    # CORS
    frontend_url: str = "http://localhost:5173"


settings = Settings()
