import pytest
from app.services.priority_service import PriorityService
from app.models.priority import PriorityLevel


def test_exact_priority_specification_example():
    """
    Test exact formula requirement from Section 27 of CIVICPULSE_PLAN.md:
    Given:
    severity = 90
    population = 80
    infrastructure = 70
    weather = 50
    duration = 60
    recurrence = 40
    verify final score exactly:
    0.35 * 90 + 0.25 * 80 + 0.15 * 70 + 0.10 * 50 + 0.10 * 60 + 0.05 * 40
    = 31.5 + 20.0 + 10.5 + 5.0 + 6.0 + 2.0 = 75.0
    Priority Level: HIGH
    """
    final_score, priority_level, explanation = PriorityService.calculate_from_components(
        severity_score=90.0,
        population_score=80.0,
        infrastructure_score=70.0,
        weather_score=50.0,
        duration_score=60.0,
        recurrence_score=40.0,
    )

    assert final_score == 75.0
    assert priority_level == PriorityLevel.HIGH
    assert "High priority" in explanation


def test_priority_threshold_ranges():
    """
    Section 15 thresholds:
    0-24 = INFORMATIONAL
    25-49 = LOW
    50-74 = MEDIUM
    75-89 = HIGH
    90-100 = CRITICAL
    """
    # 1. Critical
    s_crit, l_crit, _ = PriorityService.calculate_from_components(95, 95, 95, 95, 95, 95)
    assert s_crit == 95.0
    assert l_crit == PriorityLevel.CRITICAL

    # 2. High (boundary at 75)
    s_high, l_high, _ = PriorityService.calculate_from_components(75, 75, 75, 75, 75, 75)
    assert s_high == 75.0
    assert l_high == PriorityLevel.HIGH

    # 3. Medium (boundary at 50)
    s_med, l_med, _ = PriorityService.calculate_from_components(50, 50, 50, 50, 50, 50)
    assert s_med == 50.0
    assert l_med == PriorityLevel.MEDIUM

    # 4. Low (boundary at 25)
    s_low, l_low, _ = PriorityService.calculate_from_components(25, 25, 25, 25, 25, 25)
    assert s_low == 25.0
    assert l_low == PriorityLevel.LOW

    # 5. Informational (< 25)
    s_info, l_info, _ = PriorityService.calculate_from_components(10, 10, 10, 10, 10, 10)
    assert s_info == 10.0
    assert l_info == PriorityLevel.INFORMATIONAL


def test_explanation_generation_content():
    final_score, priority_level, explanation = PriorityService.calculate_from_components(
        severity_score=95.0,
        population_score=85.0,
        infrastructure_score=90.0,
        weather_score=80.0,
        duration_score=20.0,
        recurrence_score=10.0,
    )
    assert priority_level == PriorityLevel.HIGH
    assert "High priority" in explanation
    assert "severity" in explanation
    assert "infrastructure" in explanation
