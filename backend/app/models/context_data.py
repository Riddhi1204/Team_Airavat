import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


class ReportContextData(Base):
    __tablename__ = "report_context_data"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("reports.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)

    # Population
    estimated_population = Column(Integer, nullable=True)
    population_radius_meters = Column(Integer, default=500, nullable=False)
    population_source = Column(String(100), nullable=True)
    population_available = Column(Boolean, default=False, nullable=False)

    # Infrastructure
    nearby_infrastructure = Column(JSON, default=list, nullable=False)
    infrastructure_available = Column(Boolean, default=False, nullable=False)

    # Weather
    weather_condition = Column(String(100), nullable=True)
    temperature_celsius = Column(Float, nullable=True)
    precipitation_mm = Column(Float, nullable=True)
    wind_speed_kmh = Column(Float, nullable=True)
    weather_available = Column(Boolean, default=False, nullable=False)

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.datetime.now(datetime.timezone.utc),
        nullable=False,
    )

    report = relationship("Report", back_populates="context_data")
