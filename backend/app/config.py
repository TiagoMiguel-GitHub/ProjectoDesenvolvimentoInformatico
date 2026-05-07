from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_ENV: str = "development"
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    DATABASE_URL: str = "postgresql+asyncpg://agrowood:password@localhost:5432/agrowood_db"
    REDIS_URL: str = "redis://localhost:6379/0"

    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    MULTIBANCO_ENTITY: str = "11249"
    EASYPAY_WEBHOOK_SECRET: str = ""

    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:8081"
    PUBLIC_BASE_URL: str = "http://localhost:8000"
    FIRST_ADMIN_EMAIL: str = "admin@agrowood.pt"
    FIRST_ADMIN_PASSWORD: str = "changeme"

    @property
    def allowed_origins_list(self) -> list[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]


settings = Settings()
