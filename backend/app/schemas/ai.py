import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class AIEvaluationResult(BaseModel):
    category: str = Field(..., description="Suggested civic issue category")
    severity: int = Field(..., ge=1, le=10, description="Severity rating 1-10")
    priority: str = Field(..., description="Priority level: LOW, MEDIUM, HIGH, CRITICAL")
    immediate_danger: bool = Field(..., description="True if there is an immediate threat to life, safety, or property")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score 0.0-1.0")
    risk_indicators: List[str] = Field(default_factory=list, description="Specific risk indicators identified")
    reasoning_summary: str = Field(..., description="Brief explanation of findings")
    recommended_action: Optional[str] = Field(None, description="Recommended immediate action")


class AIAnalysisRead(BaseModel):
    id: int
    report_id: int
    detected_category: Optional[str]
    detected_severity: Optional[int]
    detected_priority: Optional[str]
    immediate_danger: Optional[bool]
    confidence: Optional[float]
    risk_indicators: List[str]
    reasoning_summary: Optional[str]
    recommended_action: Optional[str]
    model_name: str
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)
