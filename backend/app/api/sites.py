from fastapi import APIRouter, Depends, HTTPException, status
from geoalchemy2.shape import from_shape, to_shape
from shapely.geometry import shape
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.dependencies import get_db
from app.models.project import Project
from app.models.site import Site
from app.models.user import User
from app.schemas.site import SiteCreate, SiteResponse

router = APIRouter(
    prefix="/api",
    tags=["Sites"],
)


def site_to_response(site: Site) -> SiteResponse:
    geometry = to_shape(site.geometry)

    return SiteResponse(
        id=site.id,
        project_id=site.project_id,
        name=site.name,
        geometry={
            "type": "Polygon",
            "coordinates": [list(geometry.exterior.coords)],
        },
        created_at=site.created_at,
    )


def get_owned_project(
    project_id: int,
    db: Session,
    current_user: User,
) -> Project:
    project = (
        db.query(Project)
        .filter(
            Project.id == project_id,
            Project.owner_id == current_user.id,
        )
        .first()
    )

    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    return project


def get_owned_site(
    site_id: int,
    db: Session,
    current_user: User,
) -> Site:
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
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Site not found",
        )

    return site


@router.post(
    "/projects/{project_id}/sites",
    response_model=SiteResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_site(
    project_id: int,
    site_data: SiteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SiteResponse:
    get_owned_project(project_id, db, current_user)

    try:
        geometry = shape(site_data.geometry)
    except (TypeError, ValueError) as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid GeoJSON geometry",
        ) from error

    if geometry.geom_type != "Polygon":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Site geometry must be a Polygon",
        )

    if not geometry.is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Site polygon is invalid",
        )

    site = Site(
        project_id=project_id,
        name=site_data.name,
        geometry=from_shape(geometry, srid=4326),
    )

    db.add(site)
    db.commit()
    db.refresh(site)

    return site_to_response(site)


@router.get(
    "/projects/{project_id}/sites",
    response_model=list[SiteResponse],
)
def list_sites(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[SiteResponse]:
    get_owned_project(project_id, db, current_user)

    sites = (
        db.query(Site)
        .filter(Site.project_id == project_id)
        .order_by(Site.created_at.desc())
        .all()
    )

    return [site_to_response(site) for site in sites]


@router.get(
    "/sites/{site_id}",
    response_model=SiteResponse,
)
def get_site(
    site_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SiteResponse:
    site = get_owned_site(site_id, db, current_user)

    return site_to_response(site)


@router.put(
    "/sites/{site_id}",
    response_model=SiteResponse,
)
def update_site(
    site_id: int,
    site_data: SiteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SiteResponse:
    site = get_owned_site(site_id, db, current_user)

    try:
        geometry = shape(site_data.geometry)
    except (TypeError, ValueError) as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid GeoJSON geometry",
        ) from error

    if geometry.geom_type != "Polygon":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Site geometry must be a Polygon",
        )

    if not geometry.is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Site polygon is invalid",
        )

    site.name = site_data.name
    site.geometry = from_shape(geometry, srid=4326)

    db.commit()
    db.refresh(site)

    return site_to_response(site)


@router.delete(
    "/sites/{site_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_site(
    site_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    site = get_owned_site(site_id, db, current_user)

    db.delete(site)
    db.commit()
