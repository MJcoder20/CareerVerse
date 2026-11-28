
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.assessment import Assessment
from app.models.simulation import SimulationSession
from app.modules.simulations.assessment_service import SKILL_ROADMAPS


router = APIRouter(prefix="/simulations", tags=["Roadmap Progress"])


class RoadmapProgressUpdate(BaseModel):
    completed_tasks: dict[str, bool]


def get_owned_assessment(
    session_id: int,
    db: Session,
    current_user
):
    simulation = (
        db.query(SimulationSession)
        .filter(
            SimulationSession.id == session_id,
            SimulationSession.user_id == current_user.id
        )
        .first()
    )

    if not simulation:
        raise HTTPException(status_code=404, detail="Simulation not found.")

    assessment = (
        db.query(Assessment)
        .filter(Assessment.session_id == session_id)
        .first()
    )

    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found.")

    return assessment


def get_valid_task_ids(assessment: Assessment):
    valid_ids = set()

    for recommendation in assessment.recommendations or []:
        skill = recommendation.get("skill")
        tasks = recommendation.get("learning_tasks", [])

        if not skill:
            continue

        for index, _ in enumerate(tasks):
            valid_ids.add(f"{skill}-{index}")

    return valid_ids

@router.get("/{session_id}/roadmap-progress")
def get_roadmap_progress(
    session_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    assessment = get_owned_assessment(session_id, db, current_user)

    return {
        "completed_tasks": assessment.roadmap_progress or {}
    }


@router.put("/{session_id}/roadmap-progress")
def update_roadmap_progress(
    session_id: int,
    data: RoadmapProgressUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    assessment = get_owned_assessment(session_id, db, current_user)

    valid_task_ids = get_valid_task_ids(assessment)
    submitted_task_ids = set(data.completed_tasks.keys())

    invalid_task_ids = submitted_task_ids - valid_task_ids

    if invalid_task_ids:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid roadmap task IDs: {sorted(invalid_task_ids)}"
        )

    assessment.roadmap_progress = {
        **(assessment.roadmap_progress or {}),
        **data.completed_tasks,
    }

    db.add(assessment)
    db.commit()
    db.refresh(assessment)

    return {
        "message": "Roadmap progress saved successfully.",
        "completed_tasks": assessment.roadmap_progress
    }
