from typing import Dict, Any, Optional
import httpx
from app.core.config import settings
from app.core.logging import logger
from app.schemas.location import ReverseGeocodeResponse


class GeocodingService:
    @classmethod
    async def reverse_geocode(cls, latitude: float, longitude: float) -> ReverseGeocodeResponse:
        """
        Reverse geocodes latitude and longitude coordinates.
        Supports Nominatim provider with graceful fallback.
        """
        if settings.GEOCODING_PROVIDER == "nominatim":
            try:
                headers = {"User-Agent": "CivicPulse-V1-Platform/1.0 (civicpulse@example.org)"}
                url = f"{settings.GEOCODING_API_URL}/reverse"
                params = {
                    "lat": latitude,
                    "lon": longitude,
                    "format": "jsonv2",
                    "addressdetails": 1,
                }
                async with httpx.AsyncClient(timeout=4.0) as client:
                    resp = await client.get(url, params=params, headers=headers)
                    if resp.status_code == 200:
                        data = resp.json()
                        address_details = data.get("address", {})
                        display_name = data.get("display_name", "")

                        locality = (
                            address_details.get("suburb")
                            or address_details.get("neighbourhood")
                            or address_details.get("city_district")
                            or address_details.get("town")
                            or address_details.get("village")
                            or address_details.get("city")
                        )
                        district = (
                            address_details.get("county")
                            or address_details.get("state_district")
                            or address_details.get("city")
                        )
                        state = address_details.get("state")
                        country = address_details.get("country", "India")

                        return ReverseGeocodeResponse(
                            address=display_name or f"Lat: {latitude}, Lng: {longitude}",
                            locality=locality,
                            district=district,
                            state=state,
                            country=country,
                        )
            except Exception as e:
                logger.warning(f"Nominatim reverse-geocoding failed for ({latitude}, {longitude}): {e}")

        # Fallback / Mock provider when offline or API unreachable
        return cls._fallback_geocode(latitude, longitude)

    @classmethod
    def _fallback_geocode(cls, latitude: float, longitude: float) -> ReverseGeocodeResponse:
        return ReverseGeocodeResponse(
            address=f"Location ({latitude:.4f}, {longitude:.4f})",
            locality="Municipal Area",
            district="Central District",
            state="State",
            country="India",
        )
