from typing import List, Dict, Any
import httpx
from app.core.config import settings
from app.core.logging import logger
from app.utils.geo import haversine_distance_meters


class InfrastructureService:
    @classmethod
    async def find_nearby_infrastructure(cls, latitude: float, longitude: float, radius_meters: int = 1500) -> Dict[str, Any]:
        """
        Finds critical infrastructure near the incident coordinates.
        Supports Overpass API (OpenStreetMap) with fallback.
        """
        if settings.INFRASTRUCTURE_PROVIDER == "overpass":
            try:
                # Overpass QL query for hospitals, schools, police, fire stations, transport
                query = f"""
                [out:json][timeout:5];
                (
                  node["amenity"="hospital"](around:{radius_meters},{latitude},{longitude});
                  node["amenity"="school"](around:{radius_meters},{latitude},{longitude});
                  node["amenity"="police"](around:{radius_meters},{latitude},{longitude});
                  node["amenity"="fire_station"](around:{radius_meters},{latitude},{longitude});
                  node["railway"="station"](around:{radius_meters},{latitude},{longitude});
                );
                out body 15;
                """
                async with httpx.AsyncClient(timeout=4.0) as client:
                    resp = await client.post(settings.OVERPASS_API_URL, data={"data": query})
                    if resp.status_code == 200:
                        elements = resp.json().get("elements", [])
                        items = []
                        for elem in elements:
                            tags = elem.get("tags", {})
                            name = tags.get("name") or tags.get("amenity") or "Infrastructure"
                            infra_type = tags.get("amenity") or tags.get("railway") or "facility"
                            elem_lat = elem.get("lat")
                            elem_lon = elem.get("lon")
                            if elem_lat is not None and elem_lon is not None:
                                dist = haversine_distance_meters(latitude, longitude, elem_lat, elem_lon)
                                items.append({
                                    "name": name,
                                    "type": infra_type,
                                    "distance_meters": round(dist, 1),
                                })
                        items.sort(key=lambda x: x["distance_meters"])
                        return {
                            "infrastructure_available": True,
                            "items": items[:10],
                        }
            except Exception as e:
                logger.warning(f"Overpass infrastructure query failed for ({latitude}, {longitude}): {e}")

        # Local fallback / mock response
        return cls._fallback_infrastructure(latitude, longitude)

    @classmethod
    def _fallback_infrastructure(cls, latitude: float, longitude: float) -> Dict[str, Any]:
        """Returns baseline or empty infrastructure if external service fails."""
        return {
            "infrastructure_available": False,
            "items": [],
        }
