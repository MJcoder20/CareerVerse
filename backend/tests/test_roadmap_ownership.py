import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.database import Base, get_db
from app.core.security import hash_password, create_access_token
from app.models.user import User
from app.models.simulation import SimulationSession
from app.models.assessment import Assessment


@pytest.fixture
def roadmap_setup():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    tables = [
        User.__table__,
        SimulationSession.__table__,
        Assessment.__table__,
    ]

    Base.metadata.create_all(bind=engine, tables=tables)

    TestingSessionLocal = sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=engine,
    )

    db = TestingSessionLocal()

    user_a = User(
        email="roadmap-a@example.com",
        full_name="User A",
        hashed_password=hash_password("StrongPassword123!"),
        is_active=True,
        is_verified=True,
    )

    user_b = User(
        email="roadmap-b@example.com",
        full_name="User B",
        hashed_password=hash_password("StrongPassword123!"),
        is_active=True,
        is_verified=True,
    )

    db.add_all([user_a, user_b])
    db.commit()
    db.refresh(user_a)
    db.refresh(user_b)

    foreign_session = SimulationSession(
        user_id=user_b.id,
        career_slug="software-engineer",
        scenario_id="nexatech-login-outage",
        status="completed",
        current_step=5,
        score=25,
        state={},
    )

    db.add(foreign_session)
    db.commit()
    db.refresh(foreign_session)

    assessment = Assessment(
        session_id=foreign_session.id,
        overall_score=25,
        max_score=30,
        percentage=83,
        skill_scores={},
        strengths=[],
        improvement_areas=[],
        recommendations=[
            {
                "skill": "problem-solving",
                "learning_tasks": ["Practice debugging"],
            }
        ],
        roadmap_progress={"problem-solving-0": True},
        summary="Test assessment",
    )

    db.add(assessment)
    db.commit()
    db.refresh(assessment)

    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as client:
        yield {
            "client": client,
            "user_a": user_a,
            "assessment": assessment,
            "foreign_session": foreign_session,
            "db": db,
        }

    app.dependency_overrides.clear()
    db.close()
    Base.metadata.drop_all(bind=engine, tables=tables)
    engine.dispose()


def test_user_cannot_view_another_users_roadmap(roadmap_setup):
    client = roadmap_setup["client"]
    user_a = roadmap_setup["user_a"]
    foreign_session = roadmap_setup["foreign_session"]

    token = create_access_token(user_a.id)

    response = client.get(
        f"/api/v1/simulations/{foreign_session.id}/roadmap-progress",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Simulation not found."


def test_user_cannot_update_another_users_roadmap(roadmap_setup):
    client = roadmap_setup["client"]
    user_a = roadmap_setup["user_a"]
    foreign_session = roadmap_setup["foreign_session"]
    assessment = roadmap_setup["assessment"]
    db = roadmap_setup["db"]

    original_progress = dict(assessment.roadmap_progress)

    token = create_access_token(user_a.id)

    response = client.put(
        f"/api/v1/simulations/{foreign_session.id}/roadmap-progress",
        json={"completed_tasks": {"problem-solving-0": False}},
        headers={"Authorization": f"Bearer {token}"},
    )

    db.refresh(assessment)

    assert response.status_code == 404
    assert assessment.roadmap_progress == original_progress
