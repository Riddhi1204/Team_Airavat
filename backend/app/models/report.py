import datetime
import enum
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Enum,
    Index,
)
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from app.core.database import Base


class ReportStatus(str, enum.Enum):
    SUBMITTED = "SUBMITTED"
    VERIFIED = "VERIFIED"
    PRIORITIZED = "PRIORITIZED"
    ASSIGNED = "ASSIGNED"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"
    REJECTED = "REJECTED"
    DUPLICATE = "DUPLICATE"


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    public_reference = Column(String(32), unique=True, index=True, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="RESTRICT"), nullable=False, index=True)

    original_description = Column(Text, nullable=False)
    english_description = Column(Text, nullable=False)
    original_language = Column(String(10), default="en", nullable=False)
    detected_language = Column(String(10), nullable=True)
    transcription_confidence = Column(Float, nullable=True)

    status = Column(
        Enum(ReportStatus, name="report_status_enum"),
        default=ReportStatus.SUBMITTED,
        nullable=False,
        index=True,
    )
    severity = Column(Integer, default=5, nullable=False, index=True)

    # Coordinates & Geospatial
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    location = Column(Geometry(geometry_type="POINT", srid=4326, spatial_index=False), nullable=False)

    # Reverse-geocoded location fields
    address = Column(String(500), nullable=True)
    locality = Column(String(150), nullable=True)
    district = Column(String(150), nullable=True, index=True)
    state = Column(String(150), nullable=True)
    country = Column(String(100), nullable=True, default="India")

    # Duplication tracking
    is_duplicate = Column(Boolean, default=False, nullable=False)
    duplicate_of_id = Column(Integer, ForeignKey("reports.id", ondelete="SET NULL"), nullable=True)

    # Timestamps
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.datetime.now(datetime.timezone.utc),
        nullable=False,
        index=True,
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.datetime.now(datetime.timezone.utc),
        onupdate=lambda: datetime.datetime.now(datetime.timezone.utc),
        nullable=False,
    )
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    category = relationship("Category", back_populates="reports")
    media = relationship("ReportMedia", back_populates="report", cascade="all, delete-orphan")
    ai_analysis = relationship("AIAnalysis", back_populates="report", uselist=False, cascade="all, delete-orphan")
    priority_score = relationship("PriorityScore", back_populates="report", uselist=False, cascade="all, delete-orphan")
    status_history = relationship("StatusHistory", back_populates="report", cascade="all, delete-orphan", order_by="StatusHistory.created_at.desc()")
    assignments = relationship("Assignment", back_populates="report", cascade="all, delete-orphan", order_by="Assignment.assigned_at.desc()")
    context_data = relationship("ReportContextData", back_populates="report", uselist=False, cascade="all, delete-orphan")

    duplicate_of = relationship("Report", remote_side=[id], backref="duplicate_reports")


# Composite and status indexes
Index("idx_reports_status_category", Report.status, Report.category_id)
Index("idx_reports_created_at_status", Report.created_at, Report.status)
