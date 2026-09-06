import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class MapReportMarker(BaseModel):
    id: int
    public_reference: str
    latitude: float
    longitude: float
    category: str
    status: str
    priority_score: Optional[float] = None
    priority_level: Optional[str] = None
    severity: int
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)
