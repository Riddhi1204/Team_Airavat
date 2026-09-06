from typing import Optional
from pydantic import BaseModel, Field


class ReverseGeocodeRequest(BaseModel):
    latitude: float = Field(..., ge=-90.0, le=90.0, description="Latitude between -90 and 90")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="Longitude between -180 and 180")


class ReverseGeocodeResponse(BaseModel):
    address: str
    locality: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = "India"
