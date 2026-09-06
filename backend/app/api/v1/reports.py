from typing import Any
from fastapi import APIRouter, Depends, UploadFile, File, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.report import ReportCreate, ReportCreateResponse, ReportPublicRead
from app.schemas.media import MediaRead
from app.services.report_service import ReportService
from app.services.media_service import MediaService

router = APIRouter(prefix="/reports", tags=["Public Reports"])


@router.post("", response_model=ReportCreateResponse, status_code=status.HTTP_201_CREATED)
async def create_public_report(payload: ReportCreate, db: Session = Depends(get_db)):
    """
    Submit a new public civic issue report.
    Citizens can provide description, location (lat/long), and category.
    Handles automated translation, location geocoding, AI severity estimation, and priority scoring.
    """
    report = await ReportService.create_report(db, payload)
    return ReportCreateResponse(
        id=report.id,
        public_reference=report.public_reference,
        status=report.status.value if hasattr(report.status, "value") else str(report.status),
        created_at=report.created_at,
    )


@router.get("/{id}", response_model=ReportPublicRead)
def get_public_report(id: str, db: Session = Depends(get_db)):
    """
    Retrieve public-safe information for a civic report by internal ID or public reference (e.g. CP-1002).
    """
    report = ReportService.get_public_report(db, id)
    return ReportPublicRead(
        id=report.id,
        public_reference=report.public_reference,
        category=report.category.name if report.category else "General",
        english_description=report.english_description,
        status=report.status.value if hasattr(report.status, "value") else str(report.status),
        latitude=report.latitude,
        longitude=report.longitude,
        address=report.address,
        locality=report.locality,
        district=report.district,
        created_at=report.created_at,
        media=[MediaRead.model_validate(m) for m in report.media],
    )


@router.post("/{id}/media", response_model=MediaRead, status_code=status.HTTP_201_CREATED)
async def upload_report_media(
    id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Upload one or more evidence photos for a civic issue report.
    Validates file headers, format, and size limit.
    """
    media = await MediaService.upload_report_media(db=db, report_id=id, file=file)
    return MediaRead.model_validate(media)
