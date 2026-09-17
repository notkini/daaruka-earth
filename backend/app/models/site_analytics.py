from datetime import date

from sqlalchemy import Date, Float, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class SiteAnalytics(Base):
    __tablename__ = "site_analytics"

    id: Mapped[int] = mapped_column(primary_key=True)

    site_id: Mapped[int] = mapped_column(
        ForeignKey("sites.id"),
        index=True,
    )

    recorded_date: Mapped[date] = mapped_column(Date)

    carbon_sequestration: Mapped[float] = mapped_column(Float)
    biodiversity_index: Mapped[float] = mapped_column(Float)
    species_count: Mapped[int] = mapped_column()

    site = relationship("Site", back_populates="analytics")
