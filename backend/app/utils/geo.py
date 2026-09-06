import math
from typing import Tuple
from geoalchemy2.elements import WKTElement


def create_point_element(latitude: float, longitude: float) -> WKTElement:
    """Create a WKTElement for PostGIS geometry with SRID 4326."""
    # Note in WKT / PostGIS: POINT(longitude latitude)
    return WKTElement(f"POINT({longitude} {latitude})", srid=4326)


def haversine_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great circle distance between two points on the earth in meters."""
    R = 6371000.0  # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c


def is_valid_coordinate(latitude: float, longitude: float) -> bool:
    """Validate latitude and longitude ranges."""
    return -90.0 <= latitude <= 90.0 and -180.0 <= longitude <= 180.0
