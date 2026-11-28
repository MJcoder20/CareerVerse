from fastapi.testclient import TestClient

from app.main import app


def test_security_headers_are_present():
    with TestClient(app) as client:
        response = client.get("/openapi.json")

    assert response.headers["X-Content-Type-Options"] == "nosniff"
    assert response.headers["X-Frame-Options"] == "DENY"
    assert response.headers["Referrer-Policy"] == "strict-origin-when-cross-origin"
    assert response.headers["Permissions-Policy"] == (
        "camera=(), microphone=(), geolocation=()"
    )
