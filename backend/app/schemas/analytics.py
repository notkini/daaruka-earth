from datetime import date

from pydantic import BaseModel, ConfigDict


class SiteAnalyticsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    site_id: int
    recorded_date: date
    carbon_sequestration: float
    biodiversity_index: float
    species_count: int