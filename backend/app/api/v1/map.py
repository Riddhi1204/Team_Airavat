import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.repositories.report_repository import ReportRepository
from app.schemas.map import MapReportMarker

router = APIRouter(prefix="/map", tags=["Map"])


@router.get("/reports", response_model=List[MapReportMarker])
def get_map_reports(
    status: Optional[str] = Query(None, description="Filter by report status"),
    category: Optional[str] = Query(None, description="Filter by category name"),
    priority: Optional[str] = Query(None, description="Filter by priority level (CRITICAL, HIGH, etc.)"),
    severity: Optional[int] = Query(None, ge=1, le=10, description="Minimum severity"),
    district: Optional[str] = Query(None, description="Filter by district"),
    start_date: Optional[datetime.datetime] = Query(None, description="Start date timestamp"),
    end_date: Optional[datetime.datetime] = Query(None, description="End date timestamp"),
    min_lat: Optional[float] = Query(None, ge=-90.0, le=90.0, description="Bounding box minimum latitude"),
    max_lat: Optional[float] = Query(None, ge=-90.0, le=90.0, description="Bounding box maximum latitude"),
    min_lng: Optional[float] = Query(None, ge=-180.0, le=180.0, description="Bounding box minimum longitude"),
    max_lng: Optional[float] = Query(None, ge=-180.0, le=180.0, description="Bounding box maximum longitude"),
    limit: int = Query(500, ge=1, le=2000, description="Maximum number of markers to return"),
    db: Session = Depends(get_db),
):
    """
    High-performance geospatial endpoint returning lightweight markers for map visualization.
    Leverages PostGIS ST_MakeEnvelope spatial indexing when bounding box parameters are specified.
    """
    markers = ReportRepository.get_map_reports(
        db=db,
        status=status,
        category=category,
        priority=priority,
        severity=severity,
        district=district,
        start_date=start_date,
        end_date=end_date,
        min_lat=min_lat,
        max_lat=max_lat,
        min_lng=min_lng,
        max_lng=max_lng,
        limit=limit,
    )
    return markers
