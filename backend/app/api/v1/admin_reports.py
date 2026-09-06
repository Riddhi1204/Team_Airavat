import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.models.report import ReportStatus
from app.schemas.report import (
    ReportDetailAdminRead,
    ReportStatusUpdate,
    ReportAssignRequest,
    AssignmentRead,
    PaginatedReportsResponse,
)
from app.services.auth_service import (
    require_viewer_or_higher,
    require_operator_or_higher,
    require_admin_or_higher,
)
from app.repositories.report_repository import ReportRepository
from app.services.report_service import ReportService
from app.services.priority_service import PriorityService
from app.services.ai_service import AIService

router = APIRouter(prefix="/admin/reports", tags=["Admin Reports"])


@router.get("", response_model=PaginatedReportsResponse)
def list_admin_reports(
    status: Optional[str] = Query(None, description="Filter by status (SUBMITTED, VERIFIED, PRIORITIZED, ASSIGNED, IN_PROGRESS, RESOLVED, CLOSED, REJECTED, DUPLICATE)"),
    category_id: Optional[int] = Query(None, description="Filter by category ID"),
    category_name: Optional[str] = Query(None, description="Filter by category name"),
    priority_level: Optional[str] = Query(None, description="Filter by priority level (CRITICAL, HIGH, MEDIUM, LOW, INFORMATIONAL)"),
    min_severity: Optional[int] = Query(None, ge=1, le=10, description="Minimum severity"),
    max_severity: Optional[int] = Query(None, ge=1, le=10, description="Maximum severity"),
    district: Optional[str] = Query(None, description="Filter by district"),
    search: Optional[str] = Query(None, description="Search term in description or reference"),
    is_duplicate: Optional[bool] = Query(None, description="Filter duplicates"),
    start_date: Optional[datetime.datetime] = Query(None, description="Start date (ISO 8601)"),
    end_date: Optional[datetime.datetime] = Query(None, description="End date (ISO 8601)"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_viewer_or_higher),
):
    """
    List civic reports with multi-criteria filtering, search, and pagination.
    Requires VIEWER role or higher.
    """
    items, total = ReportRepository.list_reports(
        db=db,
        status=status,
        category_id=category_id,
        category_name=category_name,
        priority_level=priority_level,
        min_severity=min_severity,
        max_severity=max_severity,
        district=district,
        search=search,
        is_duplicate=is_duplicate,
        start_date=start_date,
        end_date=end_date,
        page=page,
        page_size=page_size,
    )

    total_pages = (total + page_size - 1) // page_size if total > 0 else 1

    formatted_items = []
    for r in items:
        # Serialized view
        formatted_items.append({
            "id": r.id,
            "public_reference": r.public_reference,
            "category": r.category.name if r.category else "Other",
            "category_id": r.category_id,
            "original_description": r.original_description,
            "english_description": r.english_description,
            "original_language": r.original_language,
            "status": r.status.value if hasattr(r.status, "value") else str(r.status),
            "severity": r.severity,
            "latitude": r.latitude,
            "longitude": r.longitude,
            "address": r.address,
            "locality": r.locality,
            "district": r.district,
            "state": r.state,
            "country": r.country,
            "is_duplicate": r.is_duplicate,
            "duplicate_of_id": r.duplicate_of_id,
            "created_at": r.created_at,
            "updated_at": r.updated_at,
            "resolved_at": r.resolved_at,
            "priority_score": r.priority_score.final_score if r.priority_score else None,
            "priority_level": r.priority_score.priority_level.value if (r.priority_score and hasattr(r.priority_score.priority_level, "value")) else None,
            "media_count": len(r.media),
        })

    return PaginatedReportsResponse(
        items=formatted_items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/{id}", response_model=ReportDetailAdminRead)
def get_admin_report_detail(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_viewer_or_higher),
):
    """
    Get full incident details including AI analysis, deterministic priority breakdown,
    population & infrastructure context, status history, and media attachments.
    """
    report = ReportService.get_admin_report_detail(db, id)
    return ReportDetailAdminRead(
        id=report.id,
        public_reference=report.public_reference,
        category=report.category.name if report.category else "Other",
        category_id=report.category_id,
        original_description=report.original_description,
        english_description=report.english_description,
        original_language=report.original_language,
        status=report.status.value if hasattr(report.status, "value") else str(report.status),
        severity=report.severity,
        latitude=report.latitude,
        longitude=report.longitude,
        address=report.address,
        locality=report.locality,
        district=report.district,
        state=report.state,
        country=report.country,
        is_duplicate=report.is_duplicate,
        duplicate_of_id=report.duplicate_of_id,
        created_at=report.created_at,
        updated_at=report.updated_at,
        resolved_at=report.resolved_at,
        media=report.media,
        ai_analysis=report.ai_analysis,
        priority_score=report.priority_score,
        status_history=report.status_history,
        assignments=report.assignments,
        context_data=report.context_data,
    )


@router.patch("/{id}/status")
def update_report_status(
    id: int,
    payload: ReportStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_operator_or_higher),
):
    """
    Update report lifecycle status.
    Automatically generates a status history record with the admin user's identity and note.
    Requires OPERATOR role or higher.
    """
    report = ReportService.get_admin_report_detail(db, id)
    updated = ReportRepository.update_status(
        db=db,
        report=report,
        new_status=payload.status,
        changed_by=current_user.email,
        note=payload.note,
    )
    return {
        "id": updated.id,
        "public_reference": updated.public_reference,
        "status": updated.status.value if hasattr(updated.status, "value") else str(updated.status),
        "message": f"Status updated to {payload.status.value}",
    }


@router.post("/{id}/assign", response_model=AssignmentRead, status_code=status.HTTP_201_CREATED)
def assign_report(
    id: int,
    payload: ReportAssignRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_operator_or_higher),
):
    """
    Assign report to a specific department and personnel.
    Transitions status to ASSIGNED if previously submitted/verified.
    Requires OPERATOR role or higher.
    """
    report = ReportService.get_admin_report_detail(db, id)
    assignment = ReportRepository.assign_report(
        db=db,
        report=report,
        department=payload.department,
        assigned_to=payload.assigned_to,
        note=payload.note,
        changed_by=current_user.email,
    )
    return AssignmentRead.model_validate(assignment)


@router.post("/{id}/recalculate-priority")
def recalculate_report_priority(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_operator_or_higher),
):
    """
    Manually trigger priority recalculation for a report.
    """
    report = ReportService.get_admin_report_detail(db, id)
    priority = PriorityService.calculate(db, report.id)
    return {
        "report_id": report.id,
        "final_score": priority.final_score if priority else None,
        "priority_level": priority.priority_level.value if priority else None,
        "explanation": priority.explanation if priority else None,
    }


@router.post("/{id}/run-ai")
async def run_ai_analysis(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_operator_or_higher),
):
    """
    Manually trigger AI analysis on an existing report.
    """
    report = ReportService.get_admin_report_detail(db, id)
    analysis = await AIService.analyze_report(db, report.id)
    if analysis and analysis.detected_severity:
        report.severity = analysis.detected_severity
        db.commit()
        PriorityService.calculate(db, report.id)

    return {
        "report_id": report.id,
        "detected_category": analysis.detected_category if analysis else None,
        "detected_severity": analysis.detected_severity if analysis else None,
        "confidence": analysis.confidence if analysis else None,
        "risk_indicators": analysis.risk_indicators if analysis else [],
        "reasoning_summary": analysis.reasoning_summary if analysis else None,
    }
