from fastapi import FastAPI
from app.core.config import settings
from app.modules.auth.router import router as auth_router
from app.modules.discovery.router import router as discovery_router
from app.modules.simulations.router import router as simulations_router
from app.modules.goals.router import router as goals_router
from app.modules.simulations.roadmap_router import router as roadmap_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG,
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Welcome to CareerVerse!", "status": "running"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}