import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings
from pydantic import Field
from functools import lru_cache

# Load .env file
load_dotenv()


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Existing - use Field alias for backwards compatibility with uppercase
    DEDALUS_API_KEY: str = Field(default="", alias="DEDALUS_API_KEY")
    DEFAULT_MODEL: str = Field(default="anthropic/claude-sonnet-4-20250514", alias="DEFAULT_MODEL")
    
    # MongoDB
    MONGODB_URI: str = Field(default="", alias="MONGODB_URI")
    DATABASE_NAME: str = Field(default="cloudcode", alias="DATABASE_NAME")
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        populate_by_name = True  # Allow both alias and field name


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


# Backwards compatibility
settings = get_settings()
