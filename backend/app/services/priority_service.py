from typing import Dict, Any, Optional, Tuple
import datetime
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.logging import logger
from app.models.report import Report
from app.models.priority import PriorityScore, PriorityLevel
from app.models.context_data import ReportContextData


class PriorityService:
    @classmethod
    def calculate_from_components(
        cls,
        severity_score: float,
        population_score: float,
        infrastructure_score: float,
        weather_score: float,
        duration_score: float,
        recurrence_score: float,
    ) -> Tuple[float, PriorityLevel, str]:
        """
        Directly calculates final score, priority level, and explanation from normalized (0-100) component scores.
        """
        w_sev = settings.WEIGHT_SEVERITY
        w_pop = settings.WEIGHT_POPULATION
        w_inf = settings.WEIGHT_INFRASTRUCTURE
        w_wea = settings.WEIGHT_WEATHER
        w_dur = settings.WEIGHT_DURATION
        w_rec = settings.WEIGHT_RECURRENCE

        total_weight = w_sev + w_pop + w_inf + w_wea + w_dur + w_rec

        final_raw = (
            w_sev * severity_score
            + w_pop * population_score
            + w_inf * infrastructure_score
            + w_wea * weather_score
            + w_dur * duration_score
            + w_rec * recurrence_score
        ) / total_weight

        final_score = round(final_raw, 1)

        if final_score >= settings.THRESHOLD_CRITICAL:
            priority_level = PriorityLevel.CRITICAL
        elif final_score >= settings.THRESHOLD_HIGH:
            priority_level = PriorityLevel.HIGH
        elif final_score >= settings.THRESHOLD_MEDIUM:
            priority_level = PriorityLevel.MEDIUM
        elif final_score >= settings.THRESHOLD_LOW:
            priority_level = PriorityLevel.LOW
        else:
            priority_level = PriorityLevel.INFORMATIONAL

        explanation = cls.generate_explanation(
            priority_level=priority_level,
            final_score=final_score,
            severity_score=severity_score,
            population_score=population_score,
            infrastructure_score=infrastructure_score,
            weather_score=weather_score,
            duration_score=duration_score,
            recurrence_score=recurrence_score,
        )

        return final_score, priority_level, explanation

    @classmethod
    def compute_scores(
        cls,
        severity_val: float,
        population_val: Optional[int],
        infrastructure_items: list,
        weather_condition: Optional[str],
        precipitation_mm: Optional[float],
        created_at: datetime.datetime,
        duplicate_count: int = 0,
    ) -> Tuple[Dict[str, float], float, PriorityLevel, str]:
        """
        Pure deterministic priority calculation function.
        Completely reproducible and unit-testable.
        """
        # 1. Severity component (0 - 100)
        # severity_val is 1-10 or 0-100
        if severity_val <= 10.0:
            severity_score = min(100.0, max(0.0, severity_val * 10.0))
        else:
            severity_score = min(100.0, max(0.0, severity_val))

        # 2. Population component (0 - 100)
        if population_val is not None:
            if population_val <= 0:
                population_score = 10.0
            elif population_val < 500:
                population_score = 30.0
            elif population_val < 2000:
                population_score = 55.0
            elif population_val < 8000:
                population_score = 75.0
            else:
                population_score = 95.0
        else:
            # When population data is unavailable, use baseline neutral
            population_score = 25.0

        # 3. Infrastructure component (0 - 100)
        # Closer proximity to critical amenities increases score
        infrastructure_score = 20.0
        if infrastructure_items:
            min_dist = min(item.get("distance_meters", 9999) for item in infrastructure_items)
            if min_dist < 150:
                infrastructure_score = 95.0
            elif min_dist < 400:
                infrastructure_score = 80.0
            elif min_dist < 800:
                infrastructure_score = 60.0
            elif min_dist < 1500:
                infrastructure_score = 40.0

        # 4. Weather / environmental context component (0 - 100)
        weather_score = 20.0
        precip = precipitation_mm or 0.0
        cond = (weather_condition or "").lower()
        if precip > 10.0 or any(w in cond for w in ["thunderstorm", "violent", "heavy rain", "flood"]):
            weather_score = 90.0
        elif precip > 2.0 or any(w in cond for w in ["rain", "drizzle", "shower"]):
            weather_score = 65.0
        elif precip > 0.1:
            weather_score = 40.0

        # 5. Duration component (0 - 100)
        # Age of unresolved report
        now = datetime.datetime.now(datetime.timezone.utc)
        if created_at.tzinfo is None:
            report_time = created_at.replace(tzinfo=datetime.timezone.utc)
        else:
            report_time = created_at
        age_hours = max(0.0, (now - report_time).total_seconds() / 3600.0)

        if age_hours > 168.0:  # > 7 days
            duration_score = 95.0
        elif age_hours > 72.0:  # > 3 days
            duration_score = 75.0
        elif age_hours > 24.0:  # > 1 day
            duration_score = 55.0
        elif age_hours > 6.0:  # > 6 hours
            duration_score = 35.0
        else:
            duration_score = 15.0

        # 6. Recurrence component (0 - 100)
        if duplicate_count >= 3:
            recurrence_score = 90.0
        elif duplicate_count == 2:
            recurrence_score = 65.0
        elif duplicate_count == 1:
            recurrence_score = 40.0
        else:
            recurrence_score = 15.0

        # Configurable weights
        w_sev = settings.WEIGHT_SEVERITY
        w_pop = settings.WEIGHT_POPULATION
        w_inf = settings.WEIGHT_INFRASTRUCTURE
        w_wea = settings.WEIGHT_WEATHER
        w_dur = settings.WEIGHT_DURATION
        w_rec = settings.WEIGHT_RECURRENCE

        total_weight = w_sev + w_pop + w_inf + w_wea + w_dur + w_rec

        final_raw = (
            w_sev * severity_score
            + w_pop * population_score
            + w_inf * infrastructure_score
            + w_wea * weather_score
            + w_dur * duration_score
            + w_rec * recurrence_score
        ) / total_weight

        final_score = round(final_raw, 1)

        # Thresholds
        if final_score >= settings.THRESHOLD_CRITICAL:
            priority_level = PriorityLevel.CRITICAL
        elif final_score >= settings.THRESHOLD_HIGH:
            priority_level = PriorityLevel.HIGH
        elif final_score >= settings.THRESHOLD_MEDIUM:
            priority_level = PriorityLevel.MEDIUM
        elif final_score >= settings.THRESHOLD_LOW:
            priority_level = PriorityLevel.LOW
        else:
            priority_level = PriorityLevel.INFORMATIONAL

        # Human readable explanation
        explanation = cls.generate_explanation(
            priority_level=priority_level,
            final_score=final_score,
            severity_score=severity_score,
            population_score=population_score,
            infrastructure_score=infrastructure_score,
            weather_score=weather_score,
            duration_score=duration_score,
            recurrence_score=recurrence_score,
        )

        components = {
            "severity_score": severity_score,
            "population_score": population_score,
            "infrastructure_score": infrastructure_score,
            "weather_score": weather_score,
            "duration_score": duration_score,
            "recurrence_score": recurrence_score,
        }

        return components, final_score, priority_level, explanation

    @classmethod
    def generate_explanation(
        cls,
        priority_level: PriorityLevel,
        final_score: float,
        severity_score: float,
        population_score: float,
        infrastructure_score: float,
        weather_score: float,
        duration_score: float,
        recurrence_score: float,
    ) -> str:
        reasons = []
        if severity_score >= 70:
            reasons.append("high assessed physical severity")
        if infrastructure_score >= 70:
            reasons.append("close proximity to critical public infrastructure")
        if population_score >= 70:
            reasons.append("significant affected local population")
        if weather_score >= 70:
            reasons.append("adverse weather conditions compounding the hazard")
        if duration_score >= 70:
            reasons.append("prolonged unresolved issue duration")
        if recurrence_score >= 60:
            reasons.append("multiple repeated citizen reports in the vicinity")

        level_str = priority_level.value
        if reasons:
            return f"{level_str.capitalize()} priority ({final_score}) because of {' and '.join(reasons)}."
        return f"{level_str.capitalize()} priority ({final_score}) based on standard evaluation criteria."

    @classmethod
    def calculate(cls, db: Session, report_id: int) -> Optional[PriorityScore]:
        """
        Calculates or updates priority score for a report in the database.
        Can be called independently or in a background job.
        """
        report = db.query(Report).filter(Report.id == report_id).first()
        if not report:
            return None

        # Severity from AI analysis if present, else report severity
        sev_val = float(report.severity)
        if report.ai_analysis and report.ai_analysis.detected_severity is not None:
            sev_val = float(report.ai_analysis.detected_severity)

        # Context data
        context = report.context_data
        pop_val = context.estimated_population if (context and context.population_available) else None
        infra_items = context.nearby_infrastructure if context else []
        weather_cond = context.weather_condition if context else None
        precip = context.precipitation_mm if context else None

        # Recurrence count
        dup_count = len(report.duplicate_reports) if report.duplicate_reports else 0

        components, final_score, priority_level, explanation = cls.compute_scores(
            severity_val=sev_val,
            population_val=pop_val,
            infrastructure_items=infra_items,
            weather_condition=weather_cond,
            precipitation_mm=precip,
            created_at=report.created_at,
            duplicate_count=dup_count,
        )

        # OVERRIDE: If AI Analysis provided a direct priority assessment (e.g. Gemini), use it over the mathematical formula
        if report.ai_analysis and report.ai_analysis.detected_priority:
            ai_priority_str = report.ai_analysis.detected_priority.upper()
            ai_level = None
            ai_score = final_score
            
            if ai_priority_str == "CRITICAL":
                ai_level = PriorityLevel.CRITICAL
                ai_score = max(final_score, settings.THRESHOLD_CRITICAL)
            elif ai_priority_str == "HIGH":
                ai_level = PriorityLevel.HIGH
                ai_score = max(final_score, settings.THRESHOLD_HIGH)
            elif ai_priority_str == "MEDIUM":
                ai_level = PriorityLevel.MEDIUM
                ai_score = max(final_score, settings.THRESHOLD_MEDIUM)
            elif ai_priority_str == "LOW":
                ai_level = PriorityLevel.LOW
                ai_score = max(final_score, settings.THRESHOLD_LOW)
                
            if ai_level:
                priority_level = ai_level
                final_score = ai_score
                explanation = f"AI OVERRIDE: {ai_level.value}. {report.ai_analysis.reasoning_summary}\n\nMathematical fallback was: {explanation}"

        existing = db.query(PriorityScore).filter(PriorityScore.report_id == report_id).first()
        if existing:
            existing.severity_score = components["severity_score"]
            existing.population_score = components["population_score"]
            existing.infrastructure_score = components["infrastructure_score"]
            existing.weather_score = components["weather_score"]
            existing.duration_score = components["duration_score"]
            existing.recurrence_score = components["recurrence_score"]
            existing.final_score = final_score
            existing.priority_level = priority_level
            existing.scoring_version = settings.SCORING_VERSION
            existing.explanation = explanation
            db.commit()
            db.refresh(existing)
            return existing

        p_score = PriorityScore(
            report_id=report.id,
            severity_score=components["severity_score"],
            population_score=components["population_score"],
            infrastructure_score=components["infrastructure_score"],
            weather_score=components["weather_score"],
            duration_score=components["duration_score"],
            recurrence_score=components["recurrence_score"],
            final_score=final_score,
            priority_level=priority_level,
            scoring_version=settings.SCORING_VERSION,
            explanation=explanation,
        )
        db.add(p_score)
        db.commit()
        db.refresh(p_score)
        return p_score
