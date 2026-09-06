import datetime
from typing import Optional, Tuple
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.logging import logger
from app.models.report import Report
from app.repositories.report_repository import ReportRepository


class DuplicateService:
    @staticmethod
    def calculate_text_similarity(text1: str, text2: str) -> float:
        """Simple token-based Jaccard similarity between descriptions."""
        tokens1 = set(text1.lower().split())
        tokens2 = set(text2.lower().split())
        if not tokens1 or not tokens2:
            return 0.0
        intersection = tokens1.intersection(tokens2)
        union = tokens1.union(tokens2)
        return len(intersection) / len(union)

    @classmethod
    def check_duplicate(
        cls,
        db: Session,
        latitude: float,
        longitude: float,
        category_id: int,
        description: str,
        exclude_report_id: Optional[int] = None,
    ) -> Tuple[bool, Optional[int]]:
        """
        Checks if a report is likely a duplicate of a nearby, recent report with similar issue.
        Does not delete; marks potential duplicate and links original report ID.
        """
        time_threshold = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(
            hours=settings.DUPLICATE_MAX_HOURS
        )

        nearby_reports = ReportRepository.find_nearby_reports(
            db=db,
            latitude=latitude,
            longitude=longitude,
            radius_meters=settings.DUPLICATE_MAX_DISTANCE_METERS,
            category_id=category_id,
            time_threshold=time_threshold,
            exclude_report_id=exclude_report_id,
        )

        for candidate in nearby_reports:
            # Check description similarity or same category close by
            sim = cls.calculate_text_similarity(description, candidate.english_description)
            if sim > 0.25 or candidate.category_id == category_id:
                logger.info(
                    f"Report at ({latitude}, {longitude}) identified as potential duplicate of report {candidate.id}"
                )
                return True, candidate.id

        return False, None
