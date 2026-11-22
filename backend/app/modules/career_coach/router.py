
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.career_goal import CareerGoal
from app.models.simulation import SimulationSession
from app.models.assessment import Assessment
from app.services.ai_service import generate_career_coaching


router = APIRouter()


@router.get("/insights")
async def get_career_coaching(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    goal = db.query(CareerGoal).filter(
        CareerGoal.user_id == current_user.id
    ).first()

    if not goal:
        raise HTTPException(
            status_code=404,
            detail="Please create a career goal before requesting coaching.",
        )

    assessment_rows = (
        db.query(Assessment, SimulationSession)
        .join(
            SimulationSession,
            Assessment.session_id == SimulationSession.id,
        )
        .filter(
            SimulationSession.user_id == current_user.id,
            SimulationSession.status == "completed",
        )
        .order_by(
            SimulationSession.completed_at.asc().nullslast(),
            Assessment.created_at.asc(),
        )
        .all()
    )

    completed_simulations = db.query(SimulationSession).filter(
        SimulationSession.user_id == current_user.id,
        SimulationSession.status == "completed",
    ).count()

    current_xp = current_user.total_xp or 0

    assessments = []

    for assessment, session in assessment_rows:
        assessments.append({
            "session_id": session.id,
            "career": session.career_slug,
            "overall_percentage": assessment.percentage,
            "skill_scores": assessment.skill_scores or {},
            "strengths": assessment.strengths or [],
            "improvement_areas": assessment.improvement_areas or [],
            "recommendations": assessment.recommendations or [],
            "completed_at": session.completed_at or assessment.created_at,
        })

    context = {
        "target_career": goal.career_role,
        "progress": {
            "completed_simulations": completed_simulations,
            "target_simulations": goal.target_simulations,
            "current_xp": current_xp,
            "target_xp": goal.target_xp,
            "simulation_progress": min(
                100,
                round(
                    completed_simulations
                    / goal.target_simulations * 100
                ),
            ),
            "xp_progress": min(
                100,
                round(current_xp / goal.target_xp * 100),
            ),
        },
        "assessment_count": len(assessments),
        "assessment_history": assessments,
    }

    coaching = await generate_career_coaching(context)

    return {
        "career_role": goal.career_role,
        "assessment_count": len(assessments),
        "completed_simulations": completed_simulations,
        "current_xp": current_xp,
        "coaching": coaching,
    }
