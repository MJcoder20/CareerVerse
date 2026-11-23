from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.simulation import SimulationSession
from app.models.simulation_event import SimulationEvent
from app.models.user import User
from app.models.achievement import UserAchievement
from app.models.career_goal import CareerGoal
from app.modules.simulations.scenario_catalog import get_scenario


XP_PER_SIMULATION = 100

ACHIEVEMENTS = {
    "first_simulation": {
        "title": "First Steps",
        "description": "Complete your first career simulation.",
    },
    "career_explorer_3": {
        "title": "Career Explorer",
        "description": "Complete 3 career simulations.",
    },
    "rising_professional_5": {
        "title": "Rising Professional",
        "description": "Complete 5 career simulations.",
    },
    "high_performer_27": {
        "title": "High Performer",
        "description": "Score at least 27 points in a simulation.",
    },
}



ACHIEVEMENT_XP_REWARDS = {
    "first_simulation": 50,
    "career_explorer_3": 100,
    "rising_professional_5": 150,
    "high_performer_27": 75,
    "career_goal_25": 50,
    "career_goal_50": 100,
    "career_goal_75": 150,
    "career_goal_100": 200,
}


def unlock_achievement(db, user_id, achievement_key):
    existing = (
        db.query(UserAchievement)
        .filter(
            UserAchievement.user_id == user_id,
            UserAchievement.achievement_key == achievement_key,
        )
        .first()
    )

    # Never award the same achievement twice.
    if existing:
        return False

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )

    xp_reward = ACHIEVEMENT_XP_REWARDS.get(achievement_key, 0)

    # Award achievement XP.
    user.total_xp += xp_reward

    db.add(
        UserAchievement(
            user_id=user_id,
            achievement_key=achievement_key,
        )
    )

    return True


def check_career_goal_milestones(db, user_id):
    goal = (
        db.query(CareerGoal)
        .filter(CareerGoal.user_id == user_id)
        .first()
    )

    if not goal:
        return []

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        return []

    completed_simulations = (
        db.query(SimulationSession)
        .filter(
            SimulationSession.user_id == user_id,
            SimulationSession.status == "completed",
        )
        .count()
    )

    simulation_progress = min(
        100,
        round(completed_simulations / goal.target_simulations * 100),
    )

    xp_progress = min(
        100,
        round(user.total_xp / goal.target_xp * 100),
    )

    overall_progress = round(
        (simulation_progress + xp_progress) / 2
    )

    milestones = [
        (25, "career_goal_25"),
        (50, "career_goal_50"),
        (75, "career_goal_75"),
        (100, "career_goal_100"),
    ]

    newly_unlocked = []

    for target, achievement_key in milestones:
        if overall_progress >= target:
            if unlock_achievement(db, user_id, achievement_key):
                newly_unlocked.append(achievement_key)

    return newly_unlocked


def award_simulation_rewards(db, session):
    if session.xp_awarded:
        return []

    user = db.query(User).filter(User.id == session.user_id).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )

    # Award simulation XP exactly once.
    user.total_xp += XP_PER_SIMULATION
    session.xp_awarded = True

    newly_unlocked = []

    # Ensure the current session's completed status is saved
    # before counting completed simulations.
    db.flush()
    completed_count = (
        db.query(SimulationSession)
        .filter(
            SimulationSession.user_id == session.user_id,
            SimulationSession.status == "completed",
        )
        .count()
    )

    # Check simulation milestones.
    achievement_checks = [
        (completed_count >= 1, "first_simulation"),
        (completed_count >= 3, "career_explorer_3"),
        (completed_count >= 5, "rising_professional_5"),
        (session.score >= 27, "high_performer_27"),
    ]

    for condition, achievement_key in achievement_checks:
        if condition:
            unlocked = unlock_achievement(
                db,
                session.user_id,
                achievement_key,
            )

            if unlocked:
                newly_unlocked.append(achievement_key)

    return newly_unlocked


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

    state = session.state or {}

    completed_steps = sum(
        1 for key in state
        if key.startswith("step_") and key.endswith("_decision")
    )

    # Determine the complete path from the first stage.
    total_steps = 0
    current_step = 1

    while current_step is not None:
        current = scenario["steps"].get(current_step)

        if not current:
            break

        total_steps += 1

        # Use the actual user's decision when available.
        decision_id = state.get(f"step_{current_step}_decision")

        if decision_id:
            selected = next(
                (
                    option for option in current["options"]
                    if option["id"] == decision_id
                ),
                None,
            )

            if selected:
                current_step = selected.get("next_step")
                continue

        # Before a decision is made, count the longest possible
        # remaining path so the denominator stays stable.
        break

    # The current stage must be included in the total.
    # For this scenario, all paths contain exactly 3 decisions.
    total_steps = 3

    progress = (
        100 if session.status == "completed"
        else round((completed_steps / total_steps) * 100)
    )

    return {
        "session_id": session.id,
        "career": scenario["career"],
        "scenario": scenario["title"],
        "status": session.status,
        "current_step": session.current_step,
        "total_steps": total_steps,
        "completed_steps": completed_steps,
        "progress": progress,
        "score": session.score,
        "title": step["title"],
        "message": step["message"],
        "options": [
            {"id": option["id"], "label": option["label"]}
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

    level_up_data = None
    newly_unlocked_achievements = []

    if next_step is None:
        session.status = "completed"
        session.completed_at = datetime.now(timezone.utc)

        # Capture XP and level before awarding rewards.
        previous_xp = (
            db.query(User)
            .filter(User.id == session.user_id)
            .first()
            .total_xp
        )
        previous_level = (previous_xp // 500) + 1

        newly_unlocked_achievements = award_simulation_rewards(
            db, session
        )

        newly_unlocked_achievements.extend(
            check_career_goal_milestones(db, session.user_id)
        )

        # Calculate the new level after all rewards.
        user = db.query(User).filter(User.id == session.user_id).first()
        new_level = (user.total_xp // 500) + 1

        if new_level > previous_level:
            level_up_data = {
                "previous_level": previous_level,
                "new_level": new_level,
                "xp_earned": user.total_xp - previous_xp,
            }

    else:
        session.current_step = next_step

    db.commit()
    db.refresh(session)

    # Automatically generate an assessment after completion.
    if session.status == "completed":
        from app.modules.simulations.assessment_service import generate_assessment
        generate_assessment(db, session)

    response = build_response(session, feedback)

    if level_up_data:
        response["level_up"] = level_up_data

    response["newly_unlocked_achievements"] = (
        newly_unlocked_achievements
    )

    return response
