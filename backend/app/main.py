import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.exceptions import RequestValidationError
from sqlalchemy import text

from app.core.config import settings
from app.core.database import SessionLocal
from app.core.logging import setup_logging, logger
from app.core.errors import (
    AppException,
    app_exception_handler,
    generic_exception_handler,
)
from app.api.v1 import api_v1_router

# Initialize Logging
setup_logging()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("CivicPulse backend starting up...")
    yield
    logger.info("CivicPulse backend shutting down...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan,
    description="CivicPulse - Public Civic Issue Reporting & Authority Operations Platform",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    openapi_tags=[
        {"name": "Public Reports", "description": "Endpoints for citizens to submit and view civic complaints"},
        {"name": "Processing", "description": "Speech-to-text and multi-lingual translation services"},
        {"name": "Location", "description": "Reverse-geocoding and spatial coordinate processing"},
        {"name": "Map", "description": "Optimized spatial bounding-box markers for map visualization"},
        {"name": "Admin Reports", "description": "Administrative complaint triage, status transition, and assignment"},
        {"name": "Admin Authentication", "description": "JWT authentication and admin user management"},
        {"name": "Dashboard", "description": "Operations analytics, KPI counts, and statistical distributions"},
        {"name": "Categories", "description": "Active municipal issue categories"},
    ],
)

# CORS Middleware
origins = settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else [settings.CORS_ORIGINS]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Error Handlers
app.add_exception_handler(AppException, app_exception_handler)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    msg = "; ".join([f"{'.'.join(str(l) for l in err['loc'])}: {err['msg']}" for err in errors])
    logger.warning(f"Validation error on {request.method} {request.url.path}: {msg}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"error": {"code": "VALIDATION_ERROR", "message": msg}},
    )


# Health Check (Section 33)
@app.get("/health", tags=["Health"])
def health_check():
    """
    Health check endpoint.
    Verifies API and PostgreSQL / PostGIS database connectivity.
    """
    db_connected = False
    try:
        db = SessionLocal()
        res = db.execute(text("SELECT 1;")).scalar()
        if res == 1:
            db_connected = True
        db.close()
    except Exception as e:
        logger.error(f"Health check database connection failed: {e}")
        db_connected = False

    if db_connected:
        return {"status": "ok", "database": "connected"}
    return JSONResponse(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        content={"status": "error", "database": "disconnected"},
    )


# Mount static uploads
upload_dir = settings.UPLOAD_DIRECTORY
if not os.path.isabs(upload_dir):
    upload_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", upload_dir))
os.makedirs(upload_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=upload_dir), name="uploads")

# Include API Routers
app.include_router(api_v1_router, prefix=settings.API_V1_STR)
