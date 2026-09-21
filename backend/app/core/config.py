import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

class Settings:
    PROJECT_NAME: str = "FixIt AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite+aiosqlite:///{BASE_DIR}/fixit.db")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    HUGGINGFACE_API_KEY: str = os.getenv("HUGGINGFACE_API_KEY", "")
    
    # HuggingFace model endpoints
    HF_TEXT_MODEL: str = "mistralai/Mistral-7B-Instruct-v0.3"
    HF_VISION_MODEL: str = "Salesforce/blip-image-captioning-large"
    
    # Household Tiers
    FREE_TIER_MONTHLY_LIMIT: int = 3
    PRO_TIER_MONTHLY_LIMIT: int = 1000
    
    # Technician Lead Pricing
    LEAD_BASE_PRICE_INR: float = 99.0
    PRO_TECH_DISCOUNT: float = 0.20 # 20% off
    
    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "*"
    ]

settings = Settings()
