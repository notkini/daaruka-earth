import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.dependencies import get_current_user
from app.core.passwords import validate_password
from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.db.dependencies import get_db
from app.models.password_reset_token import PasswordResetToken
from app.models.user import User
from app.schemas.auth import (
    ChangePasswordRequest,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    LoginRequest,
    RegisterRequest,
    ResetPasswordRequest,
    ResetPasswordResponse,
    TokenResponse,
)

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"],
)


def hash_token(token: str) -> str:
    return hashlib.sha256(
        token.encode("utf-8")
    ).hexdigest()


def create_token() -> str:
    return secrets.token_urlsafe(48)


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def create_password_reset_token(
    user_id: int,
    db: Session,
) -> str:
    existing_tokens = (
        db.query(PasswordResetToken)
        .filter(
            PasswordResetToken.user_id == user_id,
            PasswordResetToken.used_at.is_(None),
        )
        .all()
    )

    for existing_token in existing_tokens:
        existing_token.used_at = utc_now()

    raw_token = create_token()

    reset_token = PasswordResetToken(
        user_id=user_id,
        token_hash=hash_token(raw_token),
        expires_at=utc_now()
        + timedelta(
            minutes=settings.password_reset_expire_minutes
        ),
    )

    db.add(reset_token)

    return raw_token


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    payload: RegisterRequest,
    db: Session = Depends(get_db),
) -> TokenResponse:
    email = payload.email.lower().strip()

    password_errors = validate_password(payload.password)

    if password_errors:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=password_errors,
        )

    existing_user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if existing_user is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    user = User(
        email=email,
        password_hash=hash_password(payload.password),
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    access_token = create_access_token(user.id)

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
    )


@router.post(
    "/login",
    response_model=TokenResponse,
)
def login(
    payload: LoginRequest,
    db: Session = Depends(get_db),
) -> TokenResponse:
    email = payload.email.lower().strip()

    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if user is None or not verify_password(
        payload.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={
                "WWW-Authenticate": "Bearer",
            },
        )

    access_token = create_access_token(user.id)

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
    )


@router.get("/me")
def get_me(
    current_user: User = Depends(get_current_user),
) -> dict:
    return {
        "id": current_user.id,
        "email": current_user.email,
        "created_at": current_user.created_at,
    }


@router.post("/change-password")
def change_password(
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, str]:
    if not verify_password(
        payload.current_password,
        current_user.password_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect.",
        )

    password_errors = validate_password(
        payload.new_password
    )

    if password_errors:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=password_errors,
        )

    if verify_password(
        payload.new_password,
        current_user.password_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be different from your current password.",
        )

    current_user.password_hash = hash_password(
        payload.new_password
    )

    db.commit()

    return {
        "message": "Password changed successfully."
    }


@router.post(
    "/forgot-password",
    response_model=ForgotPasswordResponse,
)
def forgot_password(
    payload: ForgotPasswordRequest,
    db: Session = Depends(get_db),
) -> ForgotPasswordResponse:
    email = payload.email.lower().strip()

    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if user is not None:
        raw_token = create_password_reset_token(
            user.id,
            db,
        )

        db.commit()

        # Development-only behavior.
        # We intentionally do not send an email.
        print(
            f"PASSWORD RESET TOKEN for {email}: {raw_token}"
        )

    return ForgotPasswordResponse(
        message=(
            "If an account exists for that email, "
            "password reset instructions have been generated."
        )
    )


@router.post(
    "/reset-password",
    response_model=ResetPasswordResponse,
)
def reset_password(
    payload: ResetPasswordRequest,
    db: Session = Depends(get_db),
) -> ResetPasswordResponse:
    token_hash = hash_token(payload.token)

    reset_token = (
        db.query(PasswordResetToken)
        .filter(
            PasswordResetToken.token_hash == token_hash,
            PasswordResetToken.used_at.is_(None),
        )
        .first()
    )

    if reset_token is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset token.",
        )

    if reset_token.expires_at < utc_now():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset token.",
        )

    password_errors = validate_password(
        payload.new_password
    )

    if password_errors:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=password_errors,
        )

    user = (
        db.query(User)
        .filter(User.id == reset_token.user_id)
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid password reset token.",
        )

    user.password_hash = hash_password(
        payload.new_password
    )

    reset_token.used_at = utc_now()

    db.commit()

    return ResetPasswordResponse(
        message="Password reset successfully.",
    )