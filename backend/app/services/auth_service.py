from typing import Optional, List
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt

from app.core.config import settings
from app.core.database import get_db
from app.core.errors import AuthenticationError, ForbiddenError
from app.models.user import User, UserRole
from app.repositories.user_repository import UserRepository
from app.utils.security import verify_password, create_access_token, decode_token
from app.schemas.auth import TokenResponse, UserRead

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")


class AuthService:
    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
        user = UserRepository.get_by_email(db, email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        if not user.is_active:
            return None
        return user

    @staticmethod
    def generate_auth_token(user: User) -> TokenResponse:
        payload = {
            "sub": str(user.id),
            "email": user.email,
            "role": user.role.value if hasattr(user.role, "value") else str(user.role),
        }
        token = create_access_token(payload)
        return TokenResponse(
            access_token=token,
            token_type="bearer",
            user=UserRead.model_validate(user),
        )


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    try:
        payload = decode_token(token)
        user_id_str = payload.get("sub")
        if user_id_str is None:
            raise AuthenticationError("Invalid token payload")
        user_id = int(user_id_str)
    except jwt.PyJWTError:
        raise AuthenticationError("Could not validate credentials")

    user = UserRepository.get_by_id(db, user_id)
    if not user or not user.is_active:
        raise AuthenticationError("User is inactive or does not exist")
    return user


def require_roles(allowed_roles: List[UserRole]):
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        user_role = current_user.role
        if isinstance(user_role, str):
            user_role = UserRole(user_role)
        if user_role not in allowed_roles:
            raise ForbiddenError(f"User role '{user_role.value}' does not have permission for this operation")
        return current_user

    return role_checker


# Role helper dependencies
require_super_admin = require_roles([UserRole.SUPER_ADMIN])
require_admin_or_higher = require_roles([UserRole.SUPER_ADMIN, UserRole.ADMIN])
require_operator_or_higher = require_roles([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.OPERATOR])
require_viewer_or_higher = require_roles([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.OPERATOR, UserRole.VIEWER])
