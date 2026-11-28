from datetime import datetime, timedelta, timezone
import jwt

from app.core.config import settings
from app.core.rate_limiter import limiter
from urllib.parse import urlparse, parse_qs

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.database import Base, get_db
from app.core.security import (
    hash_password,
    create_email_verification_token,
    create_access_token,
)
from app.models.user import User


@pytest.fixture
def test_db():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    Base.metadata.create_all(
        bind=engine,
        tables=[User.__table__],
    )

    TestingSessionLocal = sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=engine,
    )

    db = TestingSessionLocal()

    yield db

    db.close()
    Base.metadata.drop_all(
        bind=engine,
        tables=[User.__table__],
    )
    engine.dispose()


@pytest.fixture
def client(test_db):
    def override_get_db():
        try:
            yield test_db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture
def verified_user(test_db):
    user = User(
        email="verified@example.com",
        full_name="Test User",
        hashed_password=hash_password("StrongPassword123!"),
        is_active=True,
        is_verified=True,
    )

    test_db.add(user)
    test_db.commit()
    test_db.refresh(user)

    return user


@pytest.fixture
def unverified_user(test_db):
    user = User(
        email="unverified@example.com",
        full_name="Unverified User",
        hashed_password=hash_password("StrongPassword123!"),
        is_active=True,
        is_verified=False,
    )

    test_db.add(user)
    test_db.commit()
    test_db.refresh(user)

    return user


def test_register_user(client, monkeypatch):
    sent_emails = []

    def fake_send_email(email, verification_url):
        sent_emails.append((email, verification_url))

    monkeypatch.setattr(
        "app.modules.auth.router.send_verification_email",
        fake_send_email,
    )

    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "new@example.com",
            "full_name": "New User",
            "password": "StrongPassword123!",
        },
    )

    assert response.status_code == 201
    assert response.json()["email"] == "new@example.com"
    assert response.json()["is_verified"] is False
    assert len(sent_emails) == 1
    assert sent_emails[0][0] == "new@example.com"
    assert "/verify-email?token=" in sent_emails[0][1]


def test_register_duplicate_email(client, verified_user):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": verified_user.email,
            "full_name": "Another User",
            "password": "StrongPassword123!",
        },
    )

    assert response.status_code == 409
    assert response.json()["detail"] == "Email already registered"


def test_register_email_failure(client, monkeypatch):
    def fake_send_email(email, verification_url):
        raise Exception("SMTP unavailable")

    monkeypatch.setattr(
        "app.modules.auth.router.send_verification_email",
        fake_send_email,
    )

    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "failure@example.com",
            "full_name": "Email Failure",
            "password": "StrongPassword123!",
        },
    )

    assert response.status_code == 503


def test_verify_email_success(client, unverified_user):
    token = create_email_verification_token(unverified_user.id)

    response = client.get(
        "/api/v1/auth/verify-email",
        params={"token": token},
    )

    assert response.status_code == 200
    assert response.json()["message"] == "Email verified successfully"

    user_response = client.get("/api/v1/auth/me")

    # Verification succeeds; authentication is still required for /me.
    assert user_response.status_code == 401


def test_verify_email_invalid_token(client):
    response = client.get(
        "/api/v1/auth/verify-email",
        params={"token": "invalid-token"},
    )

    assert response.status_code == 400


def test_verify_email_unknown_user(client):
    token = create_email_verification_token(99999)

    response = client.get(
        "/api/v1/auth/verify-email",
        params={"token": token},
    )

    assert response.status_code == 404


def test_login_unverified_user(client, unverified_user):
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": unverified_user.email,
            "password": "StrongPassword123!",
        },
    )

    assert response.status_code == 403
    assert "verify your email" in response.json()["detail"]


def test_login_success(client, verified_user):
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": verified_user.email,
            "password": "StrongPassword123!",
        },
    )

    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"


def test_login_wrong_password(client, verified_user):
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": verified_user.email,
            "password": "WrongPassword123!",
        },
    )

    assert response.status_code == 401


def test_resend_verification(client, unverified_user, monkeypatch):
    sent_emails = []

    def fake_send_email(email, verification_url):
        sent_emails.append(email)

    monkeypatch.setattr(
        "app.modules.auth.router.send_verification_email",
        fake_send_email,
    )

    response = client.post(
        "/api/v1/auth/resend-verification",
        json={"email": unverified_user.email},
    )

    assert response.status_code == 200
    assert sent_emails == [unverified_user.email]


def test_resend_unknown_email(client, monkeypatch):
    sent_emails = []

    def fake_send_email(email, verification_url):
        sent_emails.append(email)

    monkeypatch.setattr(
        "app.modules.auth.router.send_verification_email",
        fake_send_email,
    )

    response = client.post(
        "/api/v1/auth/resend-verification",
        json={"email": "unknown@example.com"},
    )

    assert response.status_code == 200
    assert sent_emails == []


def test_get_profile_without_token(client):
    response = client.get("/api/v1/auth/me")

    assert response.status_code == 401


def test_get_profile_with_token(client, verified_user):
    token = create_access_token(verified_user.id)

    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    assert response.json()["email"] == verified_user.email
    assert response.json()["is_verified"] is True



def test_get_profile_rejects_token_without_type(client, verified_user):
    token = jwt.encode(
        {
            "sub": str(verified_user.id),
            "exp": datetime.now(timezone.utc) + timedelta(minutes=5),
        },
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )

    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid or expired token"


def test_login_inactive_user(client, test_db):
    user = User(
        email="inactive@example.com",
        full_name="Inactive User",
        hashed_password=hash_password("StrongPassword123!"),
        is_active=False,
        is_verified=True,
    )

    test_db.add(user)
    test_db.commit()

    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": user.email,
            "password": "StrongPassword123!",
        },
    )

    assert response.status_code == 403
    assert response.json()["detail"] == "Your account is inactive"


def test_login_rate_limit(client, verified_user):
    limiter.reset()

    try:
        payload = {
            "email": verified_user.email,
            "password": "WrongPassword123!",
        }

        responses = [
            client.post("/api/v1/auth/login", json=payload)
            for _ in range(6)
        ]

        assert all(
            response.status_code == 401
            for response in responses[:5]
        )
        assert responses[5].status_code == 429

    finally:
        limiter.reset()



@pytest.mark.parametrize(
    ("field", "value"),
    [
        ("password", "Short1!"),
        ("password", "A" * 129),
        ("full_name", "A"),
        ("full_name", "A" * 151),
        ("full_name", "   "),
    ],
)
def test_register_rejects_invalid_input(client, field, value):
    payload = {
        "email": "validation@example.com",
        "full_name": "Validation User",
        "password": "StrongPassword123!",
    }
    payload[field] = value

    response = client.post(
        "/api/v1/auth/register",
        json=payload,
    )

    assert response.status_code == 422


def test_register_trims_full_name(client, monkeypatch):
    monkeypatch.setattr(
        "app.modules.auth.router.send_verification_email",
        lambda email, url: None,
    )

    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "trimmed@example.com",
            "full_name": "  Trimmed User  ",
            "password": "StrongPassword123!",
        },
    )

    assert response.status_code == 201
    assert response.json()["full_name"] == "Trimmed User"
