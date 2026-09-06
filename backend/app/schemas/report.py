import datetime
from typing import List, Optional, Any
from pydantic import BaseModel, Field, ConfigDict
from app.models.report import ReportStatus
from app.schemas.media import MediaRead
from app.schemas.ai import AIAnalysisRead
from app.schemas.priority import PriorityScoreRead


class ReportCreate(BaseModel):
    category: str = Field(..., description="Category name (e.g., 'Pothole', 'Flooding') or category ID")
    category_id: Optional[int] = None
    original_description: str = Field(..., min_length=5, max_length=5000)
    english_description: Optional[str] = Field(None, max_length=5000)
    original_language: str = Field("en", min_length=2, max_length=10)
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    address: Optional[str] = None
    locality: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = "India"


class ReportCreateResponse(BaseModel):
    id: int
    public_reference: str
    status: str
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


class ReportPublicRead(BaseModel):
    id: int
    public_reference: str
    category: str
    english_description: str
    status: str
    latitude: float
    longitude: float
    address: Optional[str] = None
    locality: Optional[str] = None
    district: Optional[str] = None
    created_at: datetime.datetime
    media: List[MediaRead] = []

    model_config = ConfigDict(from_attributes=True)


class StatusHistoryRead(BaseModel):
    id: int
    report_id: int
    old_status: Optional[str] = None
    new_status: str
    changed_by: str
    note: Optional[str] = None
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


class AssignmentRead(BaseModel):
    id: int
    report_id: int
    department: str
    assigned_to: str
    assigned_at: datetime.datetime
    completed_at: Optional[datetime.datetime] = None

    model_config = ConfigDict(from_attributes=True)


class ReportContextRead(BaseModel):
    estimated_population: Optional[int] = None
    population_radius_meters: int = 500
    population_source: Optional[str] = None
    population_available: bool = False
    nearby_infrastructure: List[Any] = []
    infrastructure_available: bool = False
    weather_condition: Optional[str] = None
    temperature_celsius: Optional[float] = None
    precipitation_mm: Optional[float] = None
    wind_speed_kmh: Optional[float] = None
    weather_available: bool = False

    model_config = ConfigDict(from_attributes=True)


class ReportDetailAdminRead(BaseModel):
    id: int
    public_reference: str
    category: str
    category_id: int
    original_description: str
    english_description: str
    original_language: str
    status: str
    severity: int
    latitude: float
    longitude: float
    address: Optional[str] = None
    locality: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    is_duplicate: bool
    duplicate_of_id: Optional[int] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime
    resolved_at: Optional[datetime.datetime] = None

    media: List[MediaRead] = []
    ai_analysis: Optional[AIAnalysisRead] = None
    priority_score: Optional[PriorityScoreRead] = None
    status_history: List[StatusHistoryRead] = []
    assignments: List[AssignmentRead] = []
    context_data: Optional[ReportContextRead] = None

    model_config = ConfigDict(from_attributes=True)


class ReportStatusUpdate(BaseModel):
    status: ReportStatus
    note: Optional[str] = None


class ReportAssignRequest(BaseModel):
    department: str = Field(..., min_length=2, max_length=150)
    assigned_to: str = Field(..., min_length=2, max_length=255)
    note: Optional[str] = None


class PaginatedReportsResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    page_size: int
    total_pages: int
