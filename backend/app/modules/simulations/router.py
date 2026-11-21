from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user

from app.models.achievement import UserAchievement
from app.models.user import User
from app.models.simulation import SimulationSession

from app.services.ai_service import generate_manager_dialogue
from app.modules.simulations.scenario_catalog import get_scenario
from app.modules.simulations.assessment_service import generate_assessment
from app.models.assessment import Assessment
from app.schemas.simulation import (
    SimulationStartRequest,
    DecisionRequest,
    SimulationResponse,
)

from app.schemas.simulation import SimulationHistoryItem
from app.modules.simulations.service import (
    start_simulation,
    submit_decision,
    build_response,
)

router = APIRouter()


@router.post("/start", response_model=SimulationResponse)
def start(
    data: SimulationStartRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return start_simulation(
        db,
        current_user.id,
        data.career_slug,
        data.scenario_id,
    )

@router.get("/history", response_model=list[SimulationHistoryItem])
def get_simulation_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sessions = (
        db.query(SimulationSession)
        .filter(SimulationSession.user_id == current_user.id)
        .order_by(SimulationSession.created_at.desc())
        .all()
    )

    return [
        {
            "session_id": session.id,
            "career": "Software Engineer",
            "scenario": "The NexaTech Login Outage",
            "status": session.status,
            "score": session.score,
            "created_at": session.created_at,
        }
        for session in sessions
    ]

ACHIEVEMENT_CATALOG = {
    "first_simulation": {
        "title": "First Steps",
        "description": "Complete your first career simulation.",
        "target": 1,
        "type": "simulations",
        "xp_reward": 50,
    },
    "career_explorer_3": {
        "title": "Career Explorer",
        "description": "Complete 3 career simulations.",
        "target": 3,
        "type": "simulations",
        "xp_reward": 100,
    },
    "rising_professional_5": {
        "title": "Rising Professional",
        "description": "Complete 5 career simulations.",
        "target": 5,
        "type": "simulations",
        "xp_reward": 150,
    },
    "high_performer_27": {
        "title": "High Performer",
        "description": "Score at least 27 points in a simulation.",
        "target": 27,
        "type": "score",
        "xp_reward": 75,
    },
}


@router.get("/progress")
def get_user_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    completed_count = (
        db.query(SimulationSession)
        .filter(
            SimulationSession.user_id == current_user.id,
            SimulationSession.status == "completed",
        )
        .count()
    )

    achievements = (
        db.query(UserAchievement)
        .filter(UserAchievement.user_id == current_user.id)
        .order_by(UserAchievement.unlocked_at.desc())
        .all()
    )


    total_xp = current_user.total_xp
    level = (total_xp // 500) + 1
    xp_in_level = total_xp % 500

    return {
        "total_xp": total_xp,
        "level": level,
        "xp_in_level": xp_in_level,
        "xp_to_next_level": 500 - xp_in_level,
        "level_progress": (xp_in_level / 500) * 100,
        "completed_simulations": completed_count,
        "achievements": [
            {
                "key": key,
                **details,
                "unlocked": any(
                    achievement.achievement_key == key
                    for achievement in achievements
                ),
                "unlocked_at": next(
                    (
                        achievement.unlocked_at
                        for achievement in achievements
                        if achievement.achievement_key == key
                    ),
                    None,
                ),
                "progress": (
                    min(completed_count, details["target"])
                    if details["type"] == "simulations"
                    else (
                        details["target"]
                        if any(
                            achievement.achievement_key == key
                            for achievement in achievements
                        )
                        else 0
                    )
                ),
            }
            for key, details in ACHIEVEMENT_CATALOG.items()
        ],
    }

@router.get("/{session_id}", response_model=SimulationResponse)
def get_simulation(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = db.query(SimulationSession).filter(
        SimulationSession.id == session_id,
        SimulationSession.user_id == current_user.id,
    ).first()

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Simulation session not found.",
        )

    return build_response(session)



@router.post(
    "/{session_id}/decisions",
    response_model=SimulationResponse,
)
async def make_decision(
    session_id: int,
    data: DecisionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = (
        db.query(SimulationSession)
        .filter(
            SimulationSession.id == session_id,
            SimulationSession.user_id == current_user.id,
        )
        .with_for_update()
        .first()
    )

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Simulation session not found.",
        )

    # Capture the selected option before advancing the session.
    scenario = get_scenario(session.scenario_id)
    step = scenario["steps"].get(session.current_step)
    selected_option = next(
        (
            option for option in step["options"]
            if option["id"] == data.option_id
        ),
        None,
    )

    if not selected_option:
        raise HTTPException(
            status_code=400,
            detail="Invalid decision option.",
        )

    # Backend remains responsible for decisions and scoring.
    result = submit_decision(db, session, data.option_id)

    # AI generates dialogue only after the decision is validated.
    result["manager_dialogue"] = await generate_manager_dialogue(
        career=result["career"],
        scenario=result["scenario"],
        decision=selected_option["label"],
        decision_feedback=result.get("feedback") or "",
        next_situation=result["message"],
        employee_name=current_user.full_name,
    )

    return result



@router.get("/{session_id}/assessment")
def get_simulation_assessment(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = db.query(SimulationSession).filter(
        SimulationSession.id == session_id,
        SimulationSession.user_id == current_user.id,
    ).first()

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Simulation session not found.",
        )

    assessment = generate_assessment(db, session)

    return {
        "session_id": assessment.session_id,
        "overall_score": assessment.overall_score,
        "max_score": assessment.max_score,
        "percentage": assessment.percentage,
        "skill_scores": assessment.skill_scores,
        "strengths": assessment.strengths,
        "improvement_areas": assessment.improvement_areas,
        "recommendations": assessment.recommendations,
        "summary": assessment.summary,
        "created_at": assessment.created_at,
    }