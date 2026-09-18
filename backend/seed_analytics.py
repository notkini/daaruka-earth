from datetime import date

from app.db.session import SessionLocal
from app.models.site import Site
from app.models.site_analytics import SiteAnalytics


def seed_analytics() -> None:
    db = SessionLocal()

    try:
        sites = db.query(Site).all()

        if not sites:
            print("No sites found. Create a site first.")
            return

        records_created = 0

        for site in sites:
            existing_count = (
                db.query(SiteAnalytics)
                .filter(SiteAnalytics.site_id == site.id)
                .count()
            )

            if existing_count > 0:
                print(
                    f"Site {site.id} ({site.name}) already has "
                    f"{existing_count} analytics records."
                )
                continue

            records = [
                SiteAnalytics(
                    site_id=site.id,
                    recorded_date=date(2025, 1, 1),
                    carbon_sequestration=120.5,
                    biodiversity_index=0.61,
                    species_count=42,
                ),
                SiteAnalytics(
                    site_id=site.id,
                    recorded_date=date(2025, 4, 1),
                    carbon_sequestration=135.2,
                    biodiversity_index=0.64,
                    species_count=45,
                ),
                SiteAnalytics(
                    site_id=site.id,
                    recorded_date=date(2025, 7, 1),
                    carbon_sequestration=149.8,
                    biodiversity_index=0.68,
                    species_count=49,
                ),
                SiteAnalytics(
                    site_id=site.id,
                    recorded_date=date(2025, 10, 1),
                    carbon_sequestration=167.3,
                    biodiversity_index=0.71,
                    species_count=53,
                ),
                SiteAnalytics(
                    site_id=site.id,
                    recorded_date=date(2026, 1, 1),
                    carbon_sequestration=184.6,
                    biodiversity_index=0.74,
                    species_count=57,
                ),
            ]

            db.add_all(records)
            records_created += len(records)

            print(
                f"Seeded analytics for site {site.id} ({site.name})."
            )

        db.commit()

        print(
            f"Done. Created {records_created} analytics records."
        )

    finally:
        db.close()


if __name__ == "__main__":
    seed_analytics()