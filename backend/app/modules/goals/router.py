from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.career_goal import CareerGoal
from app.models.simulation import SimulationSession
from app.schemas.career_goal import CareerGoalCreate
from app.modules.simulations.service import check_career_goal_milestones


router = APIRouter()


@router.get("")
def get_career_goal(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    goal = db.query(CareerGoal).filter(
        CareerGoal.user_id == current_user.id
    ).first()

    if not goal:
        return None

    completed_simulations = db.query(SimulationSession).filter(
        SimulationSession.user_id == current_user.id,
        SimulationSession.status == "completed",
    ).count()

    current_xp = current_user.total_xp

    return {
        "id": goal.id,
        "career_role": goal.career_role,
        "target_simulations": goal.target_simulations,
        "target_xp": goal.target_xp,
        "completed_simulations": completed_simulations,
        "current_xp": current_xp,
        "simulation_progress": min(
            100,
            round(completed_simulations / goal.target_simulations * 100),
        ),
        "xp_progress": min(
            100,
            round(current_xp / goal.target_xp * 100),
        ),
        "is_completed": (
            completed_simulations >= goal.target_simulations
            and current_xp >= goal.target_xp
        ),
        "created_at": goal.created_at,
        "updated_at": goal.updated_at,
    }


@router.post("", status_code=status.HTTP_201_CREATED)
def create_career_goal(
    goal_data: CareerGoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing_goal = db.query(CareerGoal).filter(
        CareerGoal.user_id == current_user.id
    ).first()

    if existing_goal:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You already have a career goal. Update it instead.",
        )

    goal = CareerGoal(
        user_id=current_user.id,
        career_role=goal_data.career_role,
        target_simulations=goal_data.target_simulations,
        target_xp=goal_data.target_xp,
    )

    db.add(goal)
    db.commit()
    db.refresh(goal)

    db.add(goal)

    check_career_goal_milestones(db, current_user.id)

    db.commit()
    db.refresh(goal)

    return goal


@router.put("")
def update_career_goal(
    goal_data: CareerGoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    goal = db.query(CareerGoal).filter(
        CareerGoal.user_id == current_user.id
    ).first()

    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No career goal found. Create one first.",
        )

    goal.career_role = goal_data.career_role
    goal.target_simulations = goal_data.target_simulations
    goal.target_xp = goal_data.target_xp

    check_career_goal_milestones(db, current_user.id)
    db.commit()
    db.refresh(goal)

    return goal
