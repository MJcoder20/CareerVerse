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


@pytest.fixture
def ownership_setup():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    tables = [
        User.__table__,
        SimulationSession.__table__,
    ]

    Base.metadata.create_all(bind=engine, tables=tables)

    TestingSessionLocal = sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=engine,
    )

    db = TestingSessionLocal()

    user_a = User(
        email="usera@example.com",
        full_name="User A",
        hashed_password=hash_password("StrongPassword123!"),
        is_active=True,
        is_verified=True,
    )

    user_b = User(
        email="userb@example.com",
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
        status="in_progress",
        current_step=1,
        score=0,
        state={},
    )

    db.add(foreign_session)
    db.commit()
    db.refresh(foreign_session)

    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as client:
        yield {
            "client": client,
            "user_a": user_a,
            "user_b": user_b,
            "foreign_session": foreign_session,
        }

    app.dependency_overrides.clear()
    db.close()
    Base.metadata.drop_all(bind=engine, tables=tables)
    engine.dispose()


def test_user_cannot_retrieve_another_users_simulation(ownership_setup):
    client = ownership_setup["client"]
    user_a = ownership_setup["user_a"]
    foreign_session = ownership_setup["foreign_session"]

    token = create_access_token(user_a.id)

    response = client.get(
        f"/api/v1/simulations/{foreign_session.id}",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Simulation session not found."


def test_user_cannot_submit_decision_to_another_users_simulation(
    ownership_setup,
):
    client = ownership_setup["client"]
    user_a = ownership_setup["user_a"]
    foreign_session = ownership_setup["foreign_session"]

    token = create_access_token(user_a.id)

    response = client.post(
        f"/api/v1/simulations/{foreign_session.id}/decisions",
        json={"option_id": "any-option"},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Simulation session not found."


def test_user_cannot_access_another_users_assessment(ownership_setup):
    client = ownership_setup["client"]
    user_a = ownership_setup["user_a"]
    foreign_session = ownership_setup["foreign_session"]

    token = create_access_token(user_a.id)

    response = client.get(
        f"/api/v1/simulations/{foreign_session.id}/assessment",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Simulation session not found."
