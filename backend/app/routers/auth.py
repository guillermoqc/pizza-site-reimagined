from fastapi import APIRouter, Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.admin_user import AdminUser
from app.schemas.auth import AdminUserCreate, AdminUserResponse, LoginRequest, TokenResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])
_bearer = HTTPBearer()


async def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
    db: AsyncSession = Depends(get_db),
) -> AdminUser:
    service = AuthService(db)
    return await service.get_current_user(credentials.credentials)


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    return await AuthService(db).login(body.email, body.password)


@router.get("/me", response_model=AdminUserResponse)
async def me(current_admin: AdminUser = Depends(get_current_admin)):
    return current_admin


@router.post("/register", response_model=AdminUserResponse, status_code=201)
async def register(body: AdminUserCreate, db: AsyncSession = Depends(get_db)):
    """Register an additional admin user (requires an existing admin to call this)."""
    return await AuthService(db).create_admin(body)
