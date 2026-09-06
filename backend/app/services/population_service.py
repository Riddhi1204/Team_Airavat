from typing import Dict, Any, Optional
import datetime
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.config import settings
from app.core.logging import logger


class PopulationService:
    @classmethod
    def estimate_affected_population(
        cls,
        db: Session,
        latitude: float,
        longitude: float,
        radius_meters: int = 500,
    ) -> Dict[str, Any]:
        """
        Estimates the population within radius_meters using local PostGIS gridded dataset.
        If the dataset has not been installed, returns population_available=False without fabricating numbers.
        """
        try:
            # Check if local_population_grid table exists in PostGIS
            check_table = db.execute(
                text("SELECT to_regclass('public.local_population_grid');")
            ).scalar()

            if check_table:
                # Query population within radius buffer
                query = text("""
                    SELECT COALESCE(SUM(pop_count), 0)
                    FROM local_population_grid
                    WHERE ST_DWithin(
                        geom::geography,
                        ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
                        :radius
                    )
                """)
                total_pop = db.execute(
                    query, {"lng": longitude, "lat": latitude, "radius": radius_meters}
                ).scalar()

                if total_pop is not None and total_pop > 0:
                    return {
                        "population_available": True,
                        "estimated_population": int(total_pop),
                        "radius_meters": radius_meters,
                        "source": "Local Gridded Population Dataset (PostGIS)",
                        "calculation_date": datetime.datetime.now(datetime.timezone.utc),
                    }
        except Exception as e:
            logger.warning(f"Error querying local population grid: {e}")

        # Clean fallback implementation when dataset is not installed
        return {
            "population_available": False,
            "estimated_population": None,
            "radius_meters": radius_meters,
            "source": "Local WorldPop / Gridded Dataset (Not Installed)",
            "calculation_date": datetime.datetime.now(datetime.timezone.utc),
        }
