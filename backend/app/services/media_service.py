from sqlalchemy.orm import Session
from fastapi import UploadFile
from app.models.media import ReportMedia
from app.models.report import Report
from app.utils.files import validate_file_upload, save_upload_file
from app.core.errors import NotFoundError, AppException
from app.core.logging import logger


class MediaService:
    @staticmethod
    async def upload_report_media(db: Session, report_id: int, file: UploadFile) -> ReportMedia:
        report = db.query(Report).filter(Report.id == report_id).first()
        if not report:
            raise NotFoundError(f"Report with ID {report_id} not found", code="REPORT_NOT_FOUND")

        content = await file.read()
        if not content:
            raise AppException("Uploaded file is empty", code="EMPTY_FILE", status_code=400)

        # Validate file MIME, extension, size, and header magic bytes
        validated_mime = validate_file_upload(file.filename or "upload.jpg", content)

        # Save to storage (local disk or extensible backend)
        relative_path, secure_filename = save_upload_file(content, file.filename or "upload.jpg")

        media = ReportMedia(
            report_id=report.id,
            file_path=relative_path,
            original_filename=file.filename or secure_filename,
            mime_type=validated_mime,
            file_size=len(content),
        )
        db.add(media)
        db.commit()
        db.refresh(media)

        logger.info(f"Media {media.id} uploaded successfully for report {report_id}")
        return media
