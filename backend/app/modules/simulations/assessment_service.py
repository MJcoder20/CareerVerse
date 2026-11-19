
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.assessment import Assessment
from app.models.simulation import SimulationSession


SKILL_LABELS = {
    "problem_solving": "Problem-solving",
    "technical_diagnosis": "Technical diagnosis",
    "risk_management": "Risk management",
}

MAX_SKILL_SCORES = {
    "problem_solving": 15,
    "technical_diagnosis": 15,
    "risk_management": 15,
}

SKILL_RECOMMENDATIONS = {
    "problem_solving": {
        "advanced": "Practice unfamiliar incidents with incomplete evidence and multiple possible root causes.",
        "intermediate": "Practice breaking complex problems into smaller investigation steps.",
        "beginner": "Work through structured debugging exercises and explain your reasoning at each step.",
    },
    "technical_diagnosis": {
        "advanced": "Explore distributed tracing, application observability, database profiling, and performance analysis.",
        "intermediate": "Practice reading application logs, database metrics, and error traces.",
        "beginner": "Strengthen your understanding of application architecture, databases, and debugging fundamentals.",
    },
    "risk_management": {
        "advanced": "Practice incident communication, recovery planning, rollback strategies, and post-incident reviews.",
        "intermediate": "Evaluate the operational risks and consequences of technical decisions before acting.",
        "beginner": "Practice identifying production risks and choosing safe investigation steps before making changes.",
    },
}


SKILL_ROADMAPS = {
    "problem_solving": {
        "tasks": [
            "Solve three debugging challenges with incomplete information.",
            "Practice identifying root causes using the 5 Whys technique.",
            "Analyze two technical incidents and document alternative solutions."
        ],
        "project": "Build a Python incident investigation tool that analyzes errors and suggests possible root causes.",
        "goal": "Complete three incident investigations and explain the reasoning behind each solution."
    },
    "technical_diagnosis": {
        "tasks": [
            "Practice reading application logs and identifying errors.",
            "Learn how to inspect database connections and query performance.",
            "Explore application monitoring and distributed tracing fundamentals."
        ],
        "project": "Build a Python application monitoring dashboard that tracks errors, response times, and database performance.",
        "goal": "Identify and explain at least three performance or reliability problems in a test application."
    },
    "risk_management": {
        "tasks": [
            "Study production deployment and rollback strategies.",
            "Practice evaluating the risks of restarting services and modifying databases.",
            "Write an incident communication and recovery plan."
        ],
        "project": "Create an incident response simulator with recovery options, risk levels, and decision outcomes.",
        "goal": "Create a recovery plan for three simulated production incidents."
    }
}



def generate_assessment(db: Session, session: SimulationSession):
    if session.status != "completed":
        raise HTTPException(
            status_code=400,
            detail="Assessment is only available for completed simulations.",
        )

    existing = (
        db.query(Assessment)
        .filter(Assessment.session_id == session.id)
        .first()
    )

    if existing:
        return existing

    state = session.state or {}
    skill_scores = state.get("skill_scores", {})

    evaluated_skills = {}
    strengths = []
    improvement_areas = []
    recommendations = []

    for skill, maximum in MAX_SKILL_SCORES.items():
        score = min(max(skill_scores.get(skill, 0), 0), maximum)
        percentage = round((score / maximum) * 100)

        label = SKILL_LABELS[skill]

        evaluated_skills[skill] = {
            "label": label,
            "score": score,
            "max_score": maximum,
            "percentage": percentage,
        }

        if percentage >= 85:
            level = "advanced"
            strengths.append(
                f"Strong {label.lower()} demonstrated during the simulation."
            )
            improvement_areas.append(
                f"Continue challenging your {label.lower()} skills with more complex scenarios."
            )

        elif percentage >= 65:
            level = "intermediate"
            strengths.append(
                f"Developing competence in {label.lower()}."
            )
            improvement_areas.append(
                f"Improve consistency in {label.lower()} when handling complex situations."
            )

        else:
            level = "beginner"
            improvement_areas.append(
                f"{label} needs further development."
            )

        recommendations.append({
            "skill": skill,
            "title": f"Improve {label}",
            "level": level,
            "action": SKILL_RECOMMENDATIONS[skill][level],
            "learning_tasks": SKILL_ROADMAPS[skill]["tasks"],
            "portfolio_project": SKILL_ROADMAPS[skill]["project"],
            "completion_goal": SKILL_ROADMAPS[skill]["goal"],
        })

    overall_score = session.score
    max_score = 30
    overall_percentage = round(
        (overall_score / max_score) * 100
    )

    if overall_percentage >= 90:
        summary = (
            "Excellent performance. You demonstrated strong technical "
            "reasoning and professional decision-making."
        )
    elif overall_percentage >= 75:
        summary = (
            "Good performance. You demonstrated solid professional "
            "judgment with opportunities for further improvement."
        )
    elif overall_percentage >= 50:
        summary = (
            "Developing performance. You demonstrated useful "
            "problem-solving skills but should strengthen your approach."
        )
    else:
        summary = (
            "Your performance indicates that more practice is needed "
            "with technical investigation and professional decisions."
        )

    assessment = Assessment(
        session_id=session.id,
        overall_score=overall_score,
        max_score=max_score,
        percentage=overall_percentage,
        skill_scores=evaluated_skills,
        strengths=strengths,
        improvement_areas=improvement_areas,
        recommendations=recommendations,
        summary=summary,
    )

    db.add(assessment)
    db.commit()
    db.refresh(assessment)

    return assessment
