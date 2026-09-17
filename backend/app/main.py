from fastapi import FastAPI
from sqlalchemy import text

from app.db.session import engine

app = FastAPI(
    title="Darukaa.Earth API",
    description="Geospatial analytics platform for carbon and biodiversity projects.",
    version="0.1.0",
)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/health/db")
def database_health_check() -> dict[str, str]:
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
        result = connection.execute(
            text("SELECT PostGIS_Version()")
        )
        postgis_version = result.scalar_one()

    return {
        "database": "ok",
        "postgis": postgis_version,
    }