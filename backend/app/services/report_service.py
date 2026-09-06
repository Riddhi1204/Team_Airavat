from typing import Optional, Dict, Any
from sqlalchemy.orm import Session

from app.core.errors import NotFoundError, AppException
from app.core.logging import logger
from app.models.category import Category
from app.models.report import Report, ReportStatus
from app.models.status_history import StatusHistory
from app.models.context_data import ReportContextData
from app.repositories.report_repository import ReportRepository
from app.repositories.category_repository import CategoryRepository
from app.schemas.report import ReportCreate
from app.utils.geo import create_point_element, is_valid_coordinate
from app.utils.validation import generate_public_reference, sanitize_text
from app.services.geocoding_service import GeocodingService
from app.services.translation_service import TranslationService
from app.services.population_service import PopulationService
from app.services.infrastructure_service import InfrastructureService
from app.services.weather_service import WeatherService
from app.services.ai_service import AIService
from app.services.priority_service import PriorityService
from app.services.duplicate_service import DuplicateService


class ReportService:
    @classmethod
    async def create_report(cls, db: Session, payload: ReportCreate) -> Report:
        """
        Full workflow for citizen report creation:
        1. Validate coordinates and category
        2. Process translation (preserves original text)
        3. Reverse geocode location
        4. Check duplicates
        5. Persist report & initial status history
        6. Enrich context (weather, infrastructure, population)
        7. Run AI analysis
        8. Compute deterministic priority score
        All external API calls fail gracefully without breaking report creation.
        """
        # Validate coordinates
        if not is_valid_coordinate(payload.latitude, payload.longitude):
            raise AppException("Coordinates out of valid range", code="INVALID_COORDINATES", status_code=400)

        # Resolve category
        category = None
        if payload.category_id:
            category = CategoryRepository.get_by_id(db, payload.category_id)
        if not category and payload.category:
            category = CategoryRepository.get_by_name(db, payload.category)
        if not category:
            # Fallback to 'Other'
            category = CategoryRepository.get_by_name(db, "Other")
            if not category:
                category = db.query(Category).first()
        if not category:
            raise AppException("Invalid category specified", code="INVALID_CATEGORY", status_code=400)

        clean_original = sanitize_text(payload.original_description)
        original_lang = (payload.original_language or "en").lower()

        # Handle translation: Never discard original language text
        if payload.english_description and payload.english_description.strip():
            clean_english = sanitize_text(payload.english_description)
        else:
            trans_res = await TranslationService.translate_to_english(
                text=clean_original,
                source_language=original_lang,
                target_language="en",
            )
            clean_english = trans_res.translated_text or clean_original

        # Reverse geocode if address details are missing
        address = payload.address
        locality = payload.locality
        district = payload.district
        state = payload.state
        country = payload.country or "India"

        if not address or not district:
            geo_info = await GeocodingService.reverse_geocode(payload.latitude, payload.longitude)
            address = address or geo_info.address
            locality = locality or geo_info.locality
            district = district or geo_info.district
            state = state or geo_info.state
            country = country or geo_info.country

        # Duplicate check
        is_dup, dup_of_id = DuplicateService.check_duplicate(
            db=db,
            latitude=payload.latitude,
            longitude=payload.longitude,
            category_id=category.id,
            description=clean_english,
        )

        public_ref = generate_public_reference()
        point_geom = create_point_element(payload.latitude, payload.longitude)

        # Create Report model
        report = Report(
            public_reference=public_ref,
            category_id=category.id,
            original_description=clean_original,
            english_description=clean_english,
            original_language=original_lang,
            status=ReportStatus.SUBMITTED,
            severity=5,  # initial baseline, updated by AI analysis / admin
            latitude=payload.latitude,
            longitude=payload.longitude,
            location=point_geom,
            address=address,
            locality=locality,
            district=district,
            state=state,
            country=country,
            is_duplicate=is_dup,
            duplicate_of_id=dup_of_id,
        )
        db.add(report)
        db.flush()

        # Add initial Status History record
        history = StatusHistory(
            report_id=report.id,
            old_status=None,
            new_status=ReportStatus.SUBMITTED.value,
            changed_by="citizen_public",
            note="Report submitted via public portal.",
        )
        db.add(history)
        db.commit()
        db.refresh(report)

        # Enrich context (population, infrastructure, weather)
        await cls._enrich_context_data(db, report)

        # Run AI analysis (optional & fail-tolerant)
        ai_res = await AIService.analyze_report(db, report.id)
        if ai_res and ai_res.detected_severity:
            report.severity = ai_res.detected_severity
            db.commit()
            db.refresh(report)

        # Calculate reproducible priority score
        PriorityService.calculate(db, report.id)

        # Transition status to PRIORITIZED or VERIFIED automatically for initial processing
        ReportRepository.update_status(
            db=db,
            report=report,
            new_status=ReportStatus.PRIORITIZED,
            changed_by="system",
            note="Automated context enrichment and priority calculation completed.",
        )

        db.refresh(report)
        return report

    @classmethod
    async def _enrich_context_data(cls, db: Session, report: Report) -> ReportContextData:
        """Fetches population, infrastructure, and weather context safely."""
        # 1. Population
        pop_data = PopulationService.estimate_affected_population(
            db=db, latitude=report.latitude, longitude=report.longitude, radius_meters=500
        )

        # 2. Infrastructure
        infra_data = await InfrastructureService.find_nearby_infrastructure(
            latitude=report.latitude, longitude=report.longitude, radius_meters=1500
        )

        # 3. Weather
        weather_data = await WeatherService.get_weather(
            latitude=report.latitude, longitude=report.longitude
        )

        context = ReportContextData(
            report_id=report.id,
            estimated_population=pop_data.get("estimated_population"),
            population_radius_meters=pop_data.get("radius_meters", 500),
            population_source=pop_data.get("source"),
            population_available=pop_data.get("population_available", False),
            nearby_infrastructure=infra_data.get("items", []),
            infrastructure_available=infra_data.get("infrastructure_available", False),
            weather_condition=weather_data.get("weather_condition"),
            temperature_celsius=weather_data.get("temperature_celsius"),
            precipitation_mm=weather_data.get("precipitation_mm"),
            wind_speed_kmh=weather_data.get("wind_speed_kmh"),
            weather_available=weather_data.get("weather_available", False),
        )
        db.add(context)
        db.commit()
        db.refresh(context)
        return context

    @staticmethod
    def get_public_report(db: Session, identifier: str) -> Report:
        """Gets report by id or public_reference for public safe consumption."""
        report = None
        if identifier.isdigit():
            report = ReportRepository.get_by_id(db, int(identifier))
        if not report:
            report = ReportRepository.get_by_public_reference(db, identifier)
        if not report:
            raise NotFoundError(f"Report '{identifier}' not found", code="REPORT_NOT_FOUND")
        return report

    @staticmethod
    def get_admin_report_detail(db: Session, report_id: int) -> Report:
        report = ReportRepository.get_by_id(db, report_id)
        if not report:
            raise NotFoundError(f"Report ID {report_id} not found", code="REPORT_NOT_FOUND")
        return report
