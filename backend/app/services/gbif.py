from collections import Counter
from typing import Any

import httpx

GBIF_SEARCH_URL = "https://api.gbif.org/v1/occurrence/search"

PAGE_SIZE = 300
MAX_RECORDS = 10_000


def polygon_to_wkt(coordinates: list[list[float]]) -> str:
    points = ", ".join(
        f"{longitude} {latitude}"
        for longitude, latitude in coordinates
    )

    return f"POLYGON(({points}))"


def get_gbif_occurrences(
    coordinates: list[list[float]],
) -> dict[str, Any]:
    geometry = polygon_to_wkt(coordinates)

    species_keys: set[int] = set()
    species_names: Counter[str] = Counter()
    years: Counter[int] = Counter()
    kingdoms: Counter[str] = Counter()
    basis_of_record: Counter[str] = Counter()

    records_processed = 0
    total_occurrences = 0

    with httpx.Client(timeout=30) as client:
        first_params = {
            "geometry": geometry,
            "has_coordinate": "true",
            "limit": PAGE_SIZE,
            "offset": 0,
        }

        first_response = client.get(
            GBIF_SEARCH_URL,
            params=first_params,
        )

        first_response.raise_for_status()

        first_data = first_response.json()

        total_occurrences = first_data.get("count", 0)

        while records_processed < min(
            total_occurrences,
            MAX_RECORDS,
        ):
            params = {
                "geometry": geometry,
                "has_coordinate": "true",
                "limit": PAGE_SIZE,
                "offset": records_processed,
            }

            response = client.get(
                GBIF_SEARCH_URL,
                params=params,
            )

            response.raise_for_status()

            data = response.json()
            results = data.get("results", [])

            if not results:
                break

            for occurrence in results:
                species_key = occurrence.get("speciesKey")

                if species_key is not None:
                    species_keys.add(species_key)

                species_name = occurrence.get("species")

                if species_name:
                    species_names[species_name] += 1

                year = occurrence.get("year")

                if year:
                    years[year] += 1

                kingdom = occurrence.get("kingdom")

                if kingdom:
                    kingdoms[kingdom] += 1

                record_type = occurrence.get("basisOfRecord")

                if record_type:
                    basis_of_record[record_type] += 1

            records_processed += len(results)

            if len(results) < PAGE_SIZE:
                break

    top_species = [
        {
            "name": name,
            "records": count,
        }
        for name, count in species_names.most_common(10)
    ]

    observations_by_year = [
        {
            "year": year,
            "records": count,
        }
        for year, count in sorted(years.items())
    ]

    taxonomic_composition = [
        {
            "kingdom": kingdom,
            "records": count,
        }
        for kingdom, count in kingdoms.most_common()
    ]

    record_sources = [
        {
            "type": record_type,
            "records": count,
        }
        for record_type, count in basis_of_record.most_common()
    ]

    return {
        "total_occurrences": total_occurrences,
        "species_richness": len(species_keys),
        "records_processed": records_processed,
        "records_available_for_query": total_occurrences,
        "sampling_limit": MAX_RECORDS,
        "top_species": top_species,
        "observations_by_year": observations_by_year,
        "taxonomic_composition": taxonomic_composition,
        "record_sources": record_sources,
    }