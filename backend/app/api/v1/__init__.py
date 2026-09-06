from fastapi import APIRouter
from app.api.v1.categories import router as categories_router
from app.api.v1.reports import router as reports_router
from app.api.v1.location import router as location_router
from app.api.v1.processing import router as processing_router
from app.api.v1.auth import router as auth_router
from app.api.v1.admin_reports import router as admin_reports_router
from app.api.v1.map import router as map_router
from app.api.v1.dashboard import router as dashboard_router

api_v1_router = APIRouter()

api_v1_router.include_router(categories_router)
api_v1_router.include_router(reports_router)
api_v1_router.include_router(location_router)
api_v1_router.include_router(processing_router)
api_v1_router.include_router(auth_router)
api_v1_router.include_router(admin_reports_router)
api_v1_router.include_router(map_router)
api_v1_router.include_router(dashboard_router)
