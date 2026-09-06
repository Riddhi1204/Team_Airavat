import datetime
import enum
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.core.database import Base


class PriorityLevel(str, enum.Enum):
    INFORMATIONAL = "INFORMATIONAL"
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class PriorityScore(Base):
    __tablename__ = "priority_scores"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("reports.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)

    severity_score = Column(Float, default=0.0, nullable=False)
    population_score = Column(Float, default=0.0, nullable=False)
    infrastructure_score = Column(Float, default=0.0, nullable=False)
    weather_score = Column(Float, default=0.0, nullable=False)
    duration_score = Column(Float, default=0.0, nullable=False)
    recurrence_score = Column(Float, default=0.0, nullable=False)

    final_score = Column(Float, default=0.0, nullable=False, index=True)
    priority_level = Column(
        Enum(PriorityLevel, name="priority_level_enum"),
        default=PriorityLevel.LOW,
        nullable=False,
        index=True,
    )
    scoring_version = Column(String(50), default="v1.0", nullable=False)
    explanation = Column(Text, nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.datetime.now(datetime.timezone.utc),
        nullable=False,
    )

    report = relationship("Report", back_populates="priority_score")
