from typing import List, Dict, Any, Optional
from pydantic import BaseModel


class DashboardOverviewResponse(BaseModel):
    total_reports: int
    pending: int
    resolved: int
    critical: int
    high: int
    medium: int
    low: int
    informational: int
    average_resolution_time_hours: Optional[float] = None


class GroupCount(BaseModel):
    name: str
    count: int


class DashboardStatisticsResponse(BaseModel):
    reports_over_time: List[Dict[str, Any]]
    category_distribution: List[GroupCount]
    status_distribution: List[GroupCount]
    priority_distribution: List[GroupCount]
    district_distribution: List[GroupCount]
