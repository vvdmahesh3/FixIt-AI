from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from app.core.config import settings, UPLOAD_DIR
from app.core.database import engine, Base
from app.seed_data import seed_database
from app.api.diagnosis import router as diagnosis_router
from app.api.technicians import router as technicians_router
from app.api.service_requests import router as service_requests_router
from app.api.warranty import router as warranty_router
from app.api.community import router as community_router
from app.api.billing import router as billing_router
from app.api.social import router as social_router
from app.api.websocket import router as websocket_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-seed database tables and initial records
    await seed_database()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="FixIt AI — Point your camera at the problem. Get an answer. Multi-modal diagnosis, safety triage, repair-vs-replace decision engine & real-time verified technician dispatch.",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads static directory
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# Include Routers
app.include_router(diagnosis_router, prefix=settings.API_V1_STR)
app.include_router(technicians_router, prefix=settings.API_V1_STR)
app.include_router(service_requests_router, prefix=settings.API_V1_STR)
app.include_router(warranty_router, prefix=settings.API_V1_STR)
app.include_router(community_router, prefix=settings.API_V1_STR)
app.include_router(billing_router, prefix=settings.API_V1_STR)
app.include_router(social_router, prefix=settings.API_V1_STR)
app.include_router(websocket_router)

@app.get("/")
async def root():
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "tagline": "Point your camera at the problem. Get an answer.",
        "docs_url": "/docs"
    }
