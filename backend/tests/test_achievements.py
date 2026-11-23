import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base
from app.models.user import User
from app.models.career_goal import CareerGoal
from app.models.simulation import SimulationSession
from app.models.achievement import UserAchievement
from app.modules.simulations.service import check_career_goal_milestones


@pytest.fixture
def db():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    tables = [
        User.__table__,
        CareerGoal.__table__,
        SimulationSession.__table__,
        UserAchievement.__table__,
    ]

    Base.metadata.create_all(bind=engine, tables=tables)

    TestingSessionLocal = sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=engine,
    )

    session = TestingSessionLocal()

    yield session

    session.close()
    Base.metadata.drop_all(bind=engine, tables=tables)
    engine.dispose()


def create_user_with_goal(db, total_xp=0, target_simulations=4, target_xp=1000):
    user = User(
        email="test@example.com",
        full_name="Test User",
        hashed_password="test-password",
        total_xp=total_xp,
    )

    db.add(user)
    db.flush()

    goal = CareerGoal(
        user_id=user.id,
        career_role="Python Developer",
        target_simulations=target_simulations,
        target_xp=target_xp,
    )

    db.add(goal)
    db.commit()

    return user


def test_no_goal_returns_empty_list(db):
    user = User(
        email="no-goal@example.com",
        full_name="No Goal User",
        hashed_password="test-password",
        total_xp=0,
    )

    db.add(user)
    db.commit()

    result = check_career_goal_milestones(db, user.id)

    assert result == []


def test_unlocks_25_percent_milestone(db):
    user = create_user_with_goal(
        db,
        target_simulations=2,
    )

    for _ in range(1):
        db.add(
            SimulationSession(
                user_id=user.id,
                career_slug="python",
                scenario_id="test-scenario",
                status="completed",
                score=20,
            )
        )

    db.commit()

    result = check_career_goal_milestones(db, user.id)

    assert "career_goal_25" in result

    db.commit()

    achievement = (
        db.query(UserAchievement)
        .filter_by(
            user_id=user.id,
            achievement_key="career_goal_25",
        )
        .first()
    )

    assert achievement is not None
    assert user.total_xp == 50


def test_milestone_reward_is_not_awarded_twice(db):
    user = create_user_with_goal(
        db,
        target_simulations=2,
    )

    db.add(
        SimulationSession(
            user_id=user.id,
            career_slug="python",
            scenario_id="test-scenario",
            status="completed",
            score=20,
        )
    )

    db.commit()

    first_result = check_career_goal_milestones(db, user.id)
    db.commit()

    xp_after_first_check = user.total_xp

    second_result = check_career_goal_milestones(db, user.id)
    db.commit()

    assert "career_goal_25" in first_result
    assert "career_goal_25" not in second_result
    assert user.total_xp == xp_after_first_check


def test_multiple_milestones_can_unlock_in_one_check(db):
    user = create_user_with_goal(
        db,
        total_xp=0,
        target_simulations=4,
        target_xp=1000,
    )

    for index in range(4):
        db.add(
            SimulationSession(
                user_id=user.id,
                career_slug="python",
                scenario_id=f"test-scenario-{index}",
                status="completed",
                score=20,
            )
        )

    db.commit()

    result = check_career_goal_milestones(db, user.id)

    assert "career_goal_25" in result
    assert "career_goal_50" in result

    db.commit()

    assert user.total_xp == 150
