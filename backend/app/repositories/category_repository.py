from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.category import Category


class CategoryRepository:
    @staticmethod
    def get_all(db: Session, active_only: bool = True) -> List[Category]:
        q = db.query(Category)
        if active_only:
            q = q.filter(Category.is_active == True)
        return q.order_by(Category.name.asc()).all()

    @staticmethod
    def get_by_id(db: Session, category_id: int) -> Optional[Category]:
        return db.query(Category).filter(Category.id == category_id).first()

    @staticmethod
    def get_by_name(db: Session, name: str) -> Optional[Category]:
        return db.query(Category).filter(Category.name.ilike(name.strip())).first()
