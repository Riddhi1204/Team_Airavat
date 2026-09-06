from fastapi import APIRouter
from app.schemas.location import ReverseGeocodeRequest, ReverseGeocodeResponse
from app.services.geocoding_service import GeocodingService

router = APIRouter(prefix="/location", tags=["Location"])


@router.post("/reverse-geocode", response_model=ReverseGeocodeResponse)
async def reverse_geocode(payload: ReverseGeocodeRequest):
    """
    Reverse geocode GPS coordinates to an administrative address hierarchy.
    Returns address, locality, district, state, and country.
    """
    return await GeocodingService.reverse_geocode(payload.latitude, payload.longitude)
