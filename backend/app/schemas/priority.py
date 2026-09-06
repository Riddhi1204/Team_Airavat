import datetime
from pydantic import BaseModel, ConfigDict


class PriorityScoreRead(BaseModel):
    id: int
    report_id: int
    severity_score: float
    population_score: float
    infrastructure_score: float
    weather_score: float
    duration_score: float
    recurrence_score: float
    final_score: float
    priority_level: str
    scoring_version: str
    explanation: str
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)
