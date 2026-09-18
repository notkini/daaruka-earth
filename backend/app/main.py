from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.api.analytics import router as analytics_router
from app.api.auth import router as auth_router
from app.api.projects import router as projects_router
from app.api.sites import router as sites_router
from app.db.session import engine

app = FastAPI(
    title="Darukaa.Earth API",
    description="Geospatial analytics platform for carbon and biodiversity projects.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(projects_router)
app.include_router(sites_router)
app.include_router(analytics_router)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/health/db")
def database_health_check() -> dict[str, str]:
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
        result = connection.execute(text("SELECT PostGIS_Version()"))
        postgis_version = result.scalar_one()

    return {
        "database": "ok",
        "postgis": postgis_version,
    }
