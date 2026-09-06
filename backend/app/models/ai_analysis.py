import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base


class AIAnalysis(Base):
    __tablename__ = "ai_analyses"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("reports.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    detected_category = Column(String(100), nullable=True)
    detected_severity = Column(Integer, nullable=True)
    detected_priority = Column(String(50), nullable=True)
    immediate_danger = Column(Boolean, nullable=True, default=False)
    confidence = Column(Float, nullable=True)
    risk_indicators = Column(JSON, default=list, nullable=False)
    reasoning_summary = Column(Text, nullable=True)
    recommended_action = Column(Text, nullable=True)
    model_name = Column(String(100), nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.datetime.now(datetime.timezone.utc),
        nullable=False,
    )

    report = relationship("Report", back_populates="ai_analysis")
