
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.email_service import send_verification_email
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_email_verification_token,
    verify_email_verification_token,
)
from app.schemas.user import (
    UserLogin,
    Token,
    UserCreate,
    UserResponse,
    EmailVerificationRequest,
)
from app.models.user import User

router = APIRouter()


def send_user_verification_email(user: User) -> None:
    token = create_email_verification_token(user.id)

    verification_url = (
        f"{settings.FRONTEND_URL.rstrip('/')}"
        f"/verify-email?token={token}"
    )

    send_verification_email(user.email, verification_url)


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
):
    existing_user = db.query(User).filter(
        User.email == user_data.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    new_user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        hashed_password=hash_password(user_data.password),
        is_verified=False,
    )

    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not create your account",
        )

    try:
        send_user_verification_email(new_user)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "Your account was created, but the verification email "
                "could not be sent. Please request another email."
            ),
        )

    return new_user


@router.get("/verify-email")
def verify_email(
    token: str,
    db: Session = Depends(get_db),
):
    user_id = verify_email_verification_token(token)

    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification link",
        )

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if user.is_verified:
        return {"message": "Email is already verified"}

    user.is_verified = True
    db.commit()

    return {"message": "Email verified successfully"}


@router.post("/resend-verification")
def resend_verification(
    request: EmailVerificationRequest,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(
        User.email == request.email
    ).first()

    if user and not user.is_verified and user.is_active:
        try:
            send_user_verification_email(user)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Unable to send the verification email right now",
            )

    return {
        "message": (
            "If an unverified account exists for this email, "
            "a verification link has been sent."
        )
    }


@router.post("/login", response_model=Token)
def login_user(
    user_data: UserLogin,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(
        User.email == user_data.email
    ).first()

    if not user or not verify_password(
        user_data.password,
        user.hashed_password,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is inactive",
        )

    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email before logging in",
        )

    token = create_access_token(user.id)

    return {
        "access_token": token,
        "token_type": "bearer",
    }


@router.get("/me", response_model=UserResponse)
def get_my_profile(
    current_user: User = Depends(get_current_user),
):
    return current_user
