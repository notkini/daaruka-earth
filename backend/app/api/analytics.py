from fastapi import APIRouter, Depends, HTTPException
from geoalchemy2.shape import to_shape
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.dependencies import get_db
from app.models.project import Project
from app.models.site import Site
from app.models.user import User
from app.services.gbif import get_gbif_occurrences

router = APIRouter(prefix="/api/sites", tags=["Analytics"])


@router.get("/{site_id}/analytics")
def get_site_analytics(
    site_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """Return real biodiversity analytics for a site from GBIF."""

    site = (
        db.query(Site)
        .join(Project)
        .filter(
            Site.id == site_id,
            Project.owner_id == current_user.id,
        )
        .first()
    )

    if site is None:
        raise HTTPException(
            status_code=404,
            detail="Site not found",
        )

    geometry = to_shape(site.geometry)

    if geometry.geom_type != "Polygon":
        raise HTTPException(
            status_code=400,
            detail="Site geometry must be a Polygon",
        )

    coordinates = [
        [float(longitude), float(latitude)]
        for longitude, latitude in geometry.exterior.coords
    ]

    try:
        gbif_data = get_gbif_occurrences(coordinates)
    except Exception as error:
        raise HTTPException(
            status_code=502,
            detail=f"GBIF request failed: {error}",
        ) from error

    return {
        "site_id": site.id,
        "site_name": site.name,
        "sources": {
            "gbif": {
                "name": "Global Biodiversity Information Facility",
                "url": "https://www.gbif.org/",
            }
        },
        "biodiversity": gbif_data,
    }