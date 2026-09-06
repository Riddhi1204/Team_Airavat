from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.repositories.category_repository import CategoryRepository
from app.schemas.category import CategoryRead

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("", response_model=List[CategoryRead])
def list_categories(db: Session = Depends(get_db)):
    """List all available civic issue categories."""
    return CategoryRepository.get_all(db, active_only=True)
