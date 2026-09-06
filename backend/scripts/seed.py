import sys
import os

# Ensure backend root is on path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.database import SessionLocal
from app.core.config import settings
from app.models.category import Category
from app.models.user import User, UserRole
from app.utils.security import get_password_hash
from app.core.logging import logger

CATEGORIES = [
    {"name": "Road Damage", "description": "Damage to roads, cracks, fissures, or road surface degradation."},
    {"name": "Pothole", "description": "Holes or depressions in the road surface posing hazards to vehicles and pedestrians."},
    {"name": "Flooding", "description": "Waterlogging or severe flooding on public roads, pathways, or public areas."},
    {"name": "Garbage", "description": "Accumulation of solid waste, uncollected trash, or illegal dumping."},
    {"name": "Broken Streetlight", "description": "Non-functional, damaged, or flickering public street lighting."},
    {"name": "Water Leakage", "description": "Burst municipal water pipes, leaks, or water main breakage."},
    {"name": "Blocked Drain", "description": "Clogged sewer lines, storm drains, or runoff water blockages."},
    {"name": "Fallen Tree", "description": "Downed trees or large branches obstructing roads, pathways, or power lines."},
    {"name": "Traffic Obstruction", "description": "Roadblock, illegal parking, construction materials blocking traffic flow."},
    {"name": "Fire/Smoke", "description": "Visible fire, open garbage burning, or hazardous smoke emissions."},
    {"name": "Public Infrastructure Damage", "description": "Damaged bus stops, footpaths, bridges, guardrails, or public property."},
    {"name": "Other", "description": "Other civic issues not categorized above."},
]


def seed():
    db = SessionLocal()
    try:
        # 1. Seed Categories
        print("Checking categories...")
        for cat_data in CATEGORIES:
            existing = db.query(Category).filter(Category.name == cat_data["name"]).first()
            if not existing:
                cat = Category(
                    name=cat_data["name"],
                    description=cat_data["description"],
                    is_active=True,
                )
                db.add(cat)
                print(f"Added category: {cat_data['name']}")
        db.commit()

        # 2. Seed Default Admin
        print("Checking default admin user...")
        admin = db.query(User).filter(User.email == settings.ADMIN_DEFAULT_EMAIL).first()
        if not admin:
            admin = User(
                email=settings.ADMIN_DEFAULT_EMAIL,
                hashed_password=get_password_hash(settings.ADMIN_DEFAULT_PASSWORD),
                full_name="System Administrator",
                role=UserRole.SUPER_ADMIN,
                is_active=True,
            )
            db.add(admin)
            db.commit()
            print(f"Default admin created: {settings.ADMIN_DEFAULT_EMAIL}")
        else:
            print(f"Admin user {settings.ADMIN_DEFAULT_EMAIL} already exists.")

        print("Seeding completed successfully!")
    except Exception as e:
        db.rollback()
        print(f"Seeding failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
