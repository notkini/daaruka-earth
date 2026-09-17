from uuid import uuid4

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_register_user() -> None:
    email = f"test-{uuid4()}@example.com"

    response = client.post(
        "/api/auth/register",
        json={
            "email": email,
            "password": "password123",
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["email"] == email
    assert "id" in data
    assert "password" not in data
    assert "password_hash" not in data


def test_register_duplicate_email() -> None:
    email = f"duplicate-{uuid4()}@example.com"

    payload = {
        "email": email,
        "password": "password123",
    }

    first_response = client.post(
        "/api/auth/register",
        json=payload,
    )

    assert first_response.status_code == 201

    second_response = client.post(
        "/api/auth/register",
        json=payload,
    )

    assert second_response.status_code == 400
    assert second_response.json()["detail"] == "Email already registered"


def test_login_user() -> None:
    email = f"login-{uuid4()}@example.com"

    client.post(
        "/api/auth/register",
        json={
            "email": email,
            "password": "password123",
        },
    )

    response = client.post(
        "/api/auth/login",
        json={
            "email": email,
            "password": "password123",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password() -> None:
    email = f"wrong-password-{uuid4()}@example.com"

    client.post(
        "/api/auth/register",
        json={
            "email": email,
            "password": "password123",
        },
    )

    response = client.post(
        "/api/auth/login",
        json={
            "email": email,
            "password": "wrongpassword",
        },
    )

    assert response.status_code == 401


def test_get_current_user() -> None:
    email = f"me-{uuid4()}@example.com"

    client.post(
        "/api/auth/register",
        json={
            "email": email,
            "password": "password123",
        },
    )

    login_response = client.post(
        "/api/auth/login",
        json={
            "email": email,
            "password": "password123",
        },
    )

    assert login_response.status_code == 200

    token = login_response.json()["access_token"]

    response = client.get(
        "/api/auth/me",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["email"] == email


def test_get_current_user_without_token() -> None:
    response = client.get("/api/auth/me")

    assert response.status_code == 401
