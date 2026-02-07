import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

class Settings:
    DEDALUS_API_KEY = os.getenv("DEDALUS_API_KEY", "")
    DEFAULT_MODEL = os.getenv("DEFAULT_MODEL", "anthropic/claude-sonnet-4-20250514")
    
settings = Settings()
