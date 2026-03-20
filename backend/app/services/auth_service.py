import uuid

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import security
from app.models.admin_user import AdminUser
from app.repositories.admin_user_repository import AdminUserRepository
from app.schemas.auth import AdminUserCreate, TokenResponse


class AuthService:
    """Handles all authentication and admin user business logic."""

    def __init__(self, session: AsyncSession) -> None:
        self._repo = AdminUserRepository(session)

    async def login(self, email: str, password: str) -> TokenResponse:
        user = await self._repo.get_by_email(email)
        if user is None or not security.verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is disabled",
            )
        token = security.create_access_token(subject=str(user.id))
        return TokenResponse(access_token=token, token_type="bearer")

    async def get_current_user(self, token: str) -> AdminUser:
        try:
            payload = security.decode_token(token)
            user_id: str | None = payload.get("sub")
            if user_id is None:
                raise ValueError("No subject in token")
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            ) from exc

        user = await self._repo.get_by_id(uuid.UUID(user_id))
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
            )
        return user

    async def create_admin(self, data: AdminUserCreate) -> AdminUser:
        if await self._repo.get_by_email(data.email):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered",
            )
        hashed = security.hash_password(data.password)
        return await self._repo.create(
            email=data.email,
            hashed_password=hashed,
            full_name=data.full_name,
        )

    async def seed_first_admin(
        self, email: str, password: str, full_name: str
    ) -> None:
        """Creates the first admin user if none exist yet."""
        if await self._repo.count() == 0:
            hashed = security.hash_password(password)
            await self._repo.create(
                email=email, hashed_password=hashed, full_name=full_name
            )
            print(f"[SEED] First admin created: {email}")
