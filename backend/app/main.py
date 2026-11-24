import logging

from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from fastapi.responses import JSONResponse
from app.core.database import engine
from fastapi import FastAPI
from app.core.config import settings
from app.modules.auth.router import router as auth_router
from app.modules.discovery.router import router as discovery_router
from app.modules.simulations.router import router as simulations_router
from app.modules.goals.router import router as goals_router
from app.modules.career_coach.router import router as career_coach_router
from app.modules.simulations.roadmap_router import router as roadmap_router
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.core.rate_limiter import limiter
from app.core.logging_config import setup_logging
from app.core.security_headers import SecurityHeadersMiddleware
from app.core.error_handlers import (
    http_exception_handler,
    validation_exception_handler,
    general_exception_handler,
)
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

setup_logging(settings.LOG_LEVEL)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG,
)

app.add_middleware(SecurityHeadersMiddleware)

app.state.limiter = limiter
app.add_exception_handler(
    RateLimitExceeded,
    _rate_limit_exceeded_handler,
)
app.add_exception_handler(
    StarletteHTTPException,
    http_exception_handler,
)

app.add_exception_handler(
    RequestValidationError,
    validation_exception_handler,
)

app.add_exception_handler(
    Exception,
    general_exception_handler,
)

app.include_router(auth_router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(
    discovery_router,
    prefix="/api/v1/discovery",
    tags=["Career Discovery"],
)
app.include_router(
    simulations_router,
    prefix="/api/v1/simulations",
    tags=["Career Simulations"],
)
app.include_router(
    roadmap_router,
    prefix="/api/v1",
)
app.include_router(
    goals_router,
    prefix="/api/v1/goals",
    tags=["Career Goals"],
)
app.include_router(
    career_coach_router,
    prefix="/api/v1/career-coach",
    tags=["AI Career Coach"],
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL.rstrip("/")],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

@app.get("/")
def root():
    return {"message": "Welcome to CareerVerse!", "status": "running"}


@app.get("/health")
def health_check():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "status": "healthy",
            "database": "connected",
        }

    except SQLAlchemyError:
        logging.getLogger(__name__).exception(
            "Health check failed: database unavailable"
        )

        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "database": "unavailable",
            },
        )