import os
import sys
import pytest
from starlette.testclient import TestClient
from sqlalchemy.orm import Session

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.core.database import SessionLocal, engine
from app.core.config import settings
from app.models.user import User, UserRole
from app.models.category import Category
from app.utils.security import get_password_hash, create_access_token


@pytest.fixture(scope="session")
def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="session")
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="session")
def admin_token(db_session: Session):
    admin = db_session.query(User).filter(User.email == settings.ADMIN_DEFAULT_EMAIL).first()
    if not admin:
        admin = User(
            email=settings.ADMIN_DEFAULT_EMAIL,
            hashed_password=get_password_hash(settings.ADMIN_DEFAULT_PASSWORD),
            full_name="Admin Test",
            role=UserRole.SUPER_ADMIN,
            is_active=True,
        )
        db_session.add(admin)
        db_session.commit()
        db_session.refresh(admin)

    token = create_access_token({
        "sub": str(admin.id),
        "email": admin.email,
        "role": admin.role.value,
    })
    return token


@pytest.fixture(scope="session")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture(scope="session")
def operator_token(db_session: Session):
    op = db_session.query(User).filter(User.email == "operator@civicpulse.org").first()
    if not op:
        op = User(
            email="operator@civicpulse.org",
            hashed_password=get_password_hash("Operator@123"),
            full_name="Operator Test",
            role=UserRole.OPERATOR,
            is_active=True,
        )
        db_session.add(op)
        db_session.commit()
        db_session.refresh(op)

    return create_access_token({
        "sub": str(op.id),
        "email": op.email,
        "role": op.role.value,
    })


@pytest.fixture(scope="session")
def viewer_token(db_session: Session):
    viewer = db_session.query(User).filter(User.email == "viewer@civicpulse.org").first()
    if not viewer:
        viewer = User(
            email="viewer@civicpulse.org",
            hashed_password=get_password_hash("Viewer@123"),
            full_name="Viewer Test",
            role=UserRole.VIEWER,
            is_active=True,
        )
        db_session.add(viewer)
        db_session.commit()
        db_session.refresh(viewer)

    return create_access_token({
        "sub": str(viewer.id),
        "email": viewer.email,
        "role": viewer.role.value,
    })
