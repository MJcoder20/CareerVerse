
from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.simulation import SimulationSession
from app.models.simulation_event import SimulationEvent
from app.modules.simulations.scenario_catalog import get_scenario


def get_session_scenario(session):
    scenario = get_scenario(session.scenario_id)

    if not scenario:
        raise HTTPException(
            status_code=404,
            detail="Simulation scenario not found.",
        )

    return scenario


def get_step(session, scenario):
    if session.status == "completed":
        return {
            "title": "Simulation completed",
            "message": "You have completed this investigation.",
            "options": [],
        }

    step = scenario["steps"].get(session.current_step)

    if not step:
        raise HTTPException(
            status_code=400,
            detail="Invalid simulation step.",
        )

    return step


def build_response(session, feedback=None):
    scenario = get_session_scenario(session)
    step = get_step(session, scenario)

    return {
        "session_id": session.id,
        "career": scenario["career"],
        "scenario": scenario["title"],
        "status": session.status,
        "current_step": session.current_step,
        "score": session.score,
        "title": step["title"],
        "message": step["message"],
        "options": [
            {
                "id": option["id"],
                "label": option["label"],
            }
            for option in step["options"]
        ],
        "feedback": feedback,
    }


def start_simulation(db, user_id, career_slug, scenario_id):
    scenario = get_scenario(scenario_id)

    if not scenario or scenario["career_slug"] != career_slug:
        raise HTTPException(
            status_code=404,
            detail="Simulation scenario not found.",
        )

    session = SimulationSession(
        user_id=user_id,
        career_slug=career_slug,
        scenario_id=scenario_id,
        status="in_progress",
        current_step=1,
        score=0,
        state={"skill_scores": {}},
    )

    db.add(session)
    db.flush()

    db.add(
        SimulationEvent(
            session_id=session.id,
            event_type="simulation_started",
            payload={"scenario_id": scenario_id},
        )
    )

    db.commit()
    db.refresh(session)

    return build_response(session)



def submit_decision(db, session, option_id):
    if session.status != "in_progress":
        raise HTTPException(
            status_code=400,
            detail="This simulation has already been completed.",
        )

    scenario = get_session_scenario(session)
    step = get_step(session, scenario)

    option = next(
        (item for item in step["options"] if item["id"] == option_id),
        None,
    )

    if not option:
        raise HTTPException(
            status_code=400,
            detail="Invalid decision option.",
        )

    previous_step = session.current_step
    session.score += option["score"]

    state = dict(session.state or {})
    skill_scores = dict(state.get("skill_scores", {}))

    for skill, points in option.get("skills", {}).items():
        skill_scores[skill] = skill_scores.get(skill, 0) + points

    state[f"step_{previous_step}_decision"] = option_id
    state["skill_scores"] = skill_scores

    # Save scenario-specific consequences.
    state.update(option.get("state_updates", {}))

    session.state = state

    feedback = option["feedback"]
    next_step = option.get("next_step")

    db.add(
        SimulationEvent(
            session_id=session.id,
            event_type="decision_submitted",
            payload={
                "step": previous_step,
                "option_id": option_id,
                "score_awarded": option["score"],
                "feedback": feedback,
                "skills": option.get("skills", {}),
                "state_updates": option.get("state_updates", {}),
                "next_step": next_step,
            },
        )
    )

    if next_step is None:
        session.status = "completed"
        session.completed_at = datetime.now(timezone.utc)
    else:
        session.current_step = next_step

    db.commit()
    db.refresh(session)

    return build_response(session, feedback)
