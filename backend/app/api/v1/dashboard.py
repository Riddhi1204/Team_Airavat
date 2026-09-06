import datetime
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, text

from app.core.database import get_db
from app.models.report import Report, ReportStatus
from app.models.category import Category
from app.models.priority import PriorityScore, PriorityLevel
from app.schemas.dashboard import DashboardOverviewResponse, DashboardStatisticsResponse, GroupCount
from app.schemas.report import ReportDetailAdminRead
from app.services.auth_service import require_viewer_or_higher
from app.models.user import User

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/overview", response_model=DashboardOverviewResponse)
def get_dashboard_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_viewer_or_higher),
):
    """
    Returns top-level overview statistics:
    Total reports, pending, resolved, priority level counts, and average resolution time.
    """
    total = db.query(func.count(Report.id)).scalar() or 0

    pending_statuses = [
        ReportStatus.SUBMITTED,
        ReportStatus.VERIFIED,
        ReportStatus.PRIORITIZED,
        ReportStatus.ASSIGNED,
        ReportStatus.IN_PROGRESS,
    ]
    pending = (
        db.query(func.count(Report.id))
        .filter(Report.status.in_(pending_statuses))
        .scalar()
        or 0
    )

    resolved_statuses = [ReportStatus.RESOLVED, ReportStatus.CLOSED]
    resolved = (
        db.query(func.count(Report.id))
        .filter(Report.status.in_(resolved_statuses))
        .scalar()
        or 0
    )

    # Priority counts
    critical = (
        db.query(func.count(PriorityScore.id))
        .filter(PriorityScore.priority_level == PriorityLevel.CRITICAL)
        .scalar()
        or 0
    )
    high = (
        db.query(func.count(PriorityScore.id))
        .filter(PriorityScore.priority_level == PriorityLevel.HIGH)
        .scalar()
        or 0
    )
    medium = (
        db.query(func.count(PriorityScore.id))
        .filter(PriorityScore.priority_level == PriorityLevel.MEDIUM)
        .scalar()
        or 0
    )
    low = (
        db.query(func.count(PriorityScore.id))
        .filter(PriorityScore.priority_level == PriorityLevel.LOW)
        .scalar()
        or 0
    )
    informational = (
        db.query(func.count(PriorityScore.id))
        .filter(PriorityScore.priority_level == PriorityLevel.INFORMATIONAL)
        .scalar()
        or 0
    )

    # Average resolution time in hours
    res_times = (
        db.query(
            func.avg(
                func.extract("epoch", Report.resolved_at)
                - func.extract("epoch", Report.created_at)
            )
        )
        .filter(Report.resolved_at.isnot(None))
        .scalar()
    )

    avg_resolution_hours = round(float(res_times) / 3600.0, 2) if res_times else None

    return DashboardOverviewResponse(
        total_reports=total,
        pending=pending,
        resolved=resolved,
        critical=critical,
        high=high,
        medium=medium,
        low=low,
        informational=informational,
        average_resolution_time_hours=avg_resolution_hours,
    )


@router.get("/statistics", response_model=DashboardStatisticsResponse)
def get_dashboard_statistics(
    start_date: Optional[datetime.datetime] = Query(None),
    end_date: Optional[datetime.datetime] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_viewer_or_higher),
):
    """
    Returns aggregation breakdowns:
    - Reports timeline (grouped by date)
    - Category distribution
    - Status distribution
    - Priority distribution
    - District distribution
    """
    base_q = db.query(Report)
    if start_date:
        base_q = base_q.filter(Report.created_at >= start_date)
    if end_date:
        base_q = base_q.filter(Report.created_at <= end_date)

    # 1. Timeline (daily)
    timeline_rows = (
        db.query(
            func.date_trunc("day", Report.created_at).label("day"),
            func.count(Report.id).label("count"),
        )
        .filter(
            Report.created_at >= (start_date or (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=30)))
        )
        .group_by("day")
        .order_by("day")
        .all()
    )
    reports_over_time = [
        {"date": row.day.strftime("%Y-%m-%d") if row.day else "", "count": row.count}
        for row in timeline_rows
    ]

    # 2. Category distribution
    category_rows = (
        db.query(Category.name, func.count(Report.id))
        .join(Report, Report.category_id == Category.id)
        .group_by(Category.name)
        .order_by(func.count(Report.id).desc())
        .all()
    )
    cat_dist = [GroupCount(name=row[0], count=row[1]) for row in category_rows]

    # 3. Status distribution
    status_rows = (
        db.query(Report.status, func.count(Report.id))
        .group_by(Report.status)
        .order_by(func.count(Report.id).desc())
        .all()
    )
    stat_dist = [
        GroupCount(
            name=row[0].value if hasattr(row[0], "value") else str(row[0]),
            count=row[1],
        )
        for row in status_rows
    ]

    # 4. Priority distribution
    priority_rows = (
        db.query(PriorityScore.priority_level, func.count(PriorityScore.id))
        .group_by(PriorityScore.priority_level)
        .order_by(func.count(PriorityScore.id).desc())
        .all()
    )
    prio_dist = [
        GroupCount(
            name=row[0].value if hasattr(row[0], "value") else str(row[0]),
            count=row[1],
        )
        for row in priority_rows
    ]

    # 5. District distribution
    district_rows = (
        db.query(func.coalesce(Report.district, "Unspecified"), func.count(Report.id))
        .group_by(func.coalesce(Report.district, "Unspecified"))
        .order_by(func.count(Report.id).desc())
        .limit(10)
        .all()
    )
    distr_dist = [GroupCount(name=row[0], count=row[1]) for row in district_rows]

    return DashboardStatisticsResponse(
        reports_over_time=reports_over_time,
        category_distribution=cat_dist,
        status_distribution=stat_dist,
        priority_distribution=prio_dist,
        district_distribution=distr_dist,
    )


@router.get("/priority")
def get_highest_priority_reports(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_viewer_or_higher),
):
    """
    Returns highest-priority unresolved reports for administrative action.
    """
    unresolved_statuses = [
        ReportStatus.SUBMITTED,
        ReportStatus.VERIFIED,
        ReportStatus.PRIORITIZED,
        ReportStatus.ASSIGNED,
        ReportStatus.IN_PROGRESS,
    ]
    reports = (
        db.query(Report)
        .join(PriorityScore, Report.id == PriorityScore.report_id)
        .filter(Report.status.in_(unresolved_statuses))
        .order_by(PriorityScore.final_score.desc())
        .limit(limit)
        .all()
    )

    results = []
    for r in reports:
        results.append({
            "id": r.id,
            "public_reference": r.public_reference,
            "category": r.category.name if r.category else "Other",
            "english_description": r.english_description,
            "status": r.status.value if hasattr(r.status, "value") else str(r.status),
            "severity": r.severity,
            "priority_score": r.priority_score.final_score if r.priority_score else None,
            "priority_level": r.priority_score.priority_level.value if (r.priority_score and hasattr(r.priority_score.priority_level, "value")) else None,
            "explanation": r.priority_score.explanation if r.priority_score else None,
            "locality": r.locality,
            "district": r.district,
            "latitude": r.latitude,
            "longitude": r.longitude,
            "created_at": r.created_at,
        })
    return results


@router.get("/public-overview", response_model=DashboardOverviewResponse)
def get_public_dashboard_overview(
    db: Session = Depends(get_db),
):
    """
    Returns top-level overview statistics for the public homepage (No auth required).
    """
    total = db.query(func.count(Report.id)).scalar() or 0

    pending_statuses = [
        ReportStatus.SUBMITTED,
        ReportStatus.VERIFIED,
        ReportStatus.PRIORITIZED,
        ReportStatus.ASSIGNED,
        ReportStatus.IN_PROGRESS,
    ]
    pending = (
        db.query(func.count(Report.id))
        .filter(Report.status.in_(pending_statuses))
        .scalar()
        or 0
    )

    resolved_statuses = [ReportStatus.RESOLVED, ReportStatus.CLOSED]
    resolved = (
        db.query(func.count(Report.id))
        .filter(Report.status.in_(resolved_statuses))
        .scalar()
        or 0
    )

    critical = (
        db.query(func.count(PriorityScore.id))
        .filter(PriorityScore.priority_level == PriorityLevel.CRITICAL)
        .scalar()
        or 0
    )
    high = (
        db.query(func.count(PriorityScore.id))
        .filter(PriorityScore.priority_level == PriorityLevel.HIGH)
        .scalar()
        or 0
    )
    medium = (
        db.query(func.count(PriorityScore.id))
        .filter(PriorityScore.priority_level == PriorityLevel.MEDIUM)
        .scalar()
        or 0
    )
    low = (
        db.query(func.count(PriorityScore.id))
        .filter(PriorityScore.priority_level == PriorityLevel.LOW)
        .scalar()
        or 0
    )
    informational = (
        db.query(func.count(PriorityScore.id))
        .filter(PriorityScore.priority_level == PriorityLevel.INFORMATIONAL)
        .scalar()
        or 0
    )

    res_times = (
        db.query(
            func.avg(
                func.extract("epoch", Report.resolved_at)
                - func.extract("epoch", Report.created_at)
            )
        )
        .filter(Report.resolved_at.isnot(None))
        .scalar()
    )

    avg_resolution_hours = round(float(res_times) / 3600.0, 2) if res_times else None

    return DashboardOverviewResponse(
        total_reports=total,
        pending=pending,
        resolved=resolved,
        critical=critical,
        high=high,
        medium=medium,
        low=low,
        informational=informational,
        average_resolution_time_hours=avg_resolution_hours,
    )
