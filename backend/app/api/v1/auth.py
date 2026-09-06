from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.errors import AuthenticationError
from app.schemas.auth import LoginRequest, TokenResponse, UserRead
from app.services.auth_service import AuthService, get_current_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Admin Authentication"])


@router.post("/login", response_model=TokenResponse)
def login_for_access_token(
    payload: LoginRequest,
    db: Session = Depends(get_db),
):
    """
    Admin authentication endpoint.
    Accepts email and password, returns signed JWT access token.
    """
    user = AuthService.authenticate_user(db, payload.email, payload.password)
    if not user:
        raise AuthenticationError("Invalid email or password", code="INVALID_CREDENTIALS")

    return AuthService.generate_auth_token(user)


@router.post("/token", response_model=TokenResponse, include_in_schema=False)
def login_form(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """OAuth2 compatible form endpoint for Swagger UI Authorize button."""
    user = AuthService.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise AuthenticationError("Invalid email or password", code="INVALID_CREDENTIALS")

    return AuthService.generate_auth_token(user)


@router.get("/me", response_model=UserRead)
def get_current_admin(current_user: User = Depends(get_current_user)):
    """
    Retrieve authenticated admin profile and role.
    """
    return UserRead.model_validate(current_user)
