from datetime import datetime

from pydantic import BaseModel, ConfigDict


class SiteCreate(BaseModel):
    name: str
    geometry: dict


class SiteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    project_id: int
    name: str
    geometry: dict
    created_at: datetime
