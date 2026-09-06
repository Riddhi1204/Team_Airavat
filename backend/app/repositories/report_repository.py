import datetime
from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, text, and_, or_, cast
from geoalchemy2 import Geography
from geoalchemy2.functions import ST_DWithin, ST_MakeEnvelope, ST_Within, ST_SetSRID, ST_MakePoint
from geoalchemy2.elements import WKTElement

from app.models.report import Report, ReportStatus
from app.models.status_history import StatusHistory
from app.models.assignment import Assignment
from app.models.priority import PriorityScore, PriorityLevel
from app.models.category import Category


class ReportRepository:
    @staticmethod
    def create(db: Session, report: Report) -> Report:
        db.add(report)
        db.commit()
        db.refresh(report)
        return report

    @staticmethod
    def get_by_id(db: Session, report_id: int) -> Optional[Report]:
        return (
            db.query(Report)
            .options(
                joinedload(Report.category),
                joinedload(Report.media),
                joinedload(Report.ai_analysis),
                joinedload(Report.priority_score),
                joinedload(Report.status_history),
                joinedload(Report.assignments),
                joinedload(Report.context_data),
            )
            .filter(Report.id == report_id)
            .first()
        )

    @staticmethod
    def get_by_public_reference(db: Session, public_ref: str) -> Optional[Report]:
        return (
            db.query(Report)
            .options(
                joinedload(Report.category),
                joinedload(Report.media),
                joinedload(Report.priority_score),
            )
            .filter(Report.public_reference == public_ref)
            .first()
        )

    @staticmethod
    def list_reports(
        db: Session,
        status: Optional[str] = None,
        category_id: Optional[int] = None,
        category_name: Optional[str] = None,
        priority_level: Optional[str] = None,
        min_severity: Optional[int] = None,
        max_severity: Optional[int] = None,
        district: Optional[str] = None,
        search: Optional[str] = None,
        start_date: Optional[datetime.datetime] = None,
        end_date: Optional[datetime.datetime] = None,
        is_duplicate: Optional[bool] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> Tuple[List[Report], int]:
        q = (
            db.query(Report)
            .join(Report.category)
            .outerjoin(Report.priority_score)
            .options(
                joinedload(Report.category),
                joinedload(Report.priority_score),
                joinedload(Report.media),
                joinedload(Report.assignments),
            )
        )

        if status:
            q = q.filter(Report.status == status)
        if category_id:
            q = q.filter(Report.category_id == category_id)
        if category_name:
            q = q.filter(Category.name.ilike(f"%{category_name}%"))
        if priority_level:
            q = q.filter(PriorityScore.priority_level == priority_level)
        if min_severity is not None:
            q = q.filter(Report.severity >= min_severity)
        if max_severity is not None:
            q = q.filter(Report.severity <= max_severity)
        if district:
            q = q.filter(Report.district.ilike(f"%{district}%"))
        if is_duplicate is not None:
            q = q.filter(Report.is_duplicate == is_duplicate)
        if start_date:
            q = q.filter(Report.created_at >= start_date)
        if end_date:
            q = q.filter(Report.created_at <= end_date)
        if search:
            term = f"%{search.strip()}%"
            q = q.filter(
                or_(
                    Report.public_reference.ilike(term),
                    Report.english_description.ilike(term),
                    Report.original_description.ilike(term),
                    Report.address.ilike(term),
                    Report.locality.ilike(term),
                )
            )

        total = q.count()
        offset = (page - 1) * page_size
        items = q.order_by(Report.created_at.desc()).offset(offset).limit(page_size).all()
        return items, total

    @staticmethod
    def get_map_reports(
        db: Session,
        status: Optional[str] = None,
        category: Optional[str] = None,
        priority: Optional[str] = None,
        severity: Optional[int] = None,
        district: Optional[str] = None,
        start_date: Optional[datetime.datetime] = None,
        end_date: Optional[datetime.datetime] = None,
        min_lat: Optional[float] = None,
        max_lat: Optional[float] = None,
        min_lng: Optional[float] = None,
        max_lng: Optional[float] = None,
        limit: int = 500,
    ) -> List[Dict[str, Any]]:
        """
        Efficient lightweight query for map marker rendering.
        Utilizes PostGIS ST_MakeEnvelope and spatial index for bounding box filtering.
        """
        q = (
            db.query(
                Report.id,
                Report.public_reference,
                Report.latitude,
                Report.longitude,
                Category.name.label("category"),
                Report.status,
                PriorityScore.final_score.label("priority_score"),
                PriorityScore.priority_level.label("priority_level"),
                Report.severity,
                Report.created_at,
            )
            .join(Category, Report.category_id == Category.id)
            .outerjoin(PriorityScore, Report.id == PriorityScore.report_id)
        )

        # Bounding box spatial filter
        if min_lat is not None and max_lat is not None and min_lng is not None and max_lng is not None:
            # Envelope coordinates: xmin (min_lng), ymin (min_lat), xmax (max_lng), ymax (max_lat)
            bbox = ST_MakeEnvelope(min_lng, min_lat, max_lng, max_lat, 4326)
            q = q.filter(ST_Within(Report.location, bbox))

        if status:
            q = q.filter(Report.status == status)
        if category:
            q = q.filter(Category.name.ilike(category))
        if priority:
            q = q.filter(PriorityScore.priority_level == priority)
        if severity is not None:
            q = q.filter(Report.severity >= severity)
        if district:
            q = q.filter(Report.district.ilike(f"%{district}%"))
        if start_date:
            q = q.filter(Report.created_at >= start_date)
        if end_date:
            q = q.filter(Report.created_at <= end_date)

        rows = q.order_by(Report.created_at.desc()).limit(limit).all()

        results = []
        for r in rows:
            results.append({
                "id": r.id,
                "public_reference": r.public_reference,
                "latitude": r.latitude,
                "longitude": r.longitude,
                "category": r.category,
                "status": r.status.value if hasattr(r.status, "value") else str(r.status),
                "priority_score": r.priority_score,
                "priority_level": r.priority_level.value if hasattr(r.priority_level, "value") else str(r.priority_level) if r.priority_level else None,
                "severity": r.severity,
                "created_at": r.created_at,
            })
        return results

    @staticmethod
    def update_status(
        db: Session,
        report: Report,
        new_status: ReportStatus,
        changed_by: str = "admin",
        note: Optional[str] = None,
    ) -> Report:
        old_status = report.status.value if hasattr(report.status, "value") else str(report.status)
        new_status_str = new_status.value if hasattr(new_status, "value") else str(new_status)

        report.status = new_status
        if new_status in [ReportStatus.RESOLVED, ReportStatus.CLOSED]:
            report.resolved_at = datetime.datetime.now(datetime.timezone.utc)
        elif new_status != ReportStatus.RESOLVED and new_status != ReportStatus.CLOSED:
            report.resolved_at = None

        history = StatusHistory(
            report_id=report.id,
            old_status=old_status,
            new_status=new_status_str,
            changed_by=changed_by,
            note=note,
        )
        db.add(history)
        db.commit()
        db.refresh(report)
        return report

    @staticmethod
    def assign_report(
        db: Session,
        report: Report,
        department: str,
        assigned_to: str,
        note: Optional[str] = None,
        changed_by: str = "admin",
    ) -> Assignment:
        assignment = Assignment(
            report_id=report.id,
            department=department,
            assigned_to=assigned_to,
        )
        db.add(assignment)

        # Update status to ASSIGNED if currently in initial states
        if report.status in [ReportStatus.SUBMITTED, ReportStatus.VERIFIED, ReportStatus.PRIORITIZED]:
            ReportRepository.update_status(
                db=db,
                report=report,
                new_status=ReportStatus.ASSIGNED,
                changed_by=changed_by,
                note=f"Assigned to {assigned_to} ({department}). Note: {note or 'N/A'}",
            )
        else:
            db.commit()

        db.refresh(assignment)
        return assignment

    @staticmethod
    def find_nearby_reports(
        db: Session,
        latitude: float,
        longitude: float,
        radius_meters: float,
        category_id: Optional[int] = None,
        time_threshold: Optional[datetime.datetime] = None,
        exclude_report_id: Optional[int] = None,
    ) -> List[Report]:
        """
        Uses PostGIS geography ST_DWithin to find nearby reports within radius_meters.
        """
        # Create geography point (longitude latitude)
        pt = func.ST_SetSRID(func.ST_MakePoint(longitude, latitude), 4326)
        q = db.query(Report).filter(
            func.ST_DWithin(
                cast(Report.location, Geography),
                cast(pt, Geography),
                radius_meters,
            )
        )

        if category_id:
            q = q.filter(Report.category_id == category_id)
        if time_threshold:
            q = q.filter(Report.created_at >= time_threshold)
        if exclude_report_id:
            q = q.filter(Report.id != exclude_report_id)

        return q.all()
