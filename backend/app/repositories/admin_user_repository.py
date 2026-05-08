import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.admin_user import AdminUser
from app.repositories.base_repository import BaseRepository


class AdminUserRepository(BaseRepository[AdminUser]):
    """Handles all database operations for AdminUser entities."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)

    async def get_by_id(self, entity_id: uuid.UUID) -> AdminUser | None:
        result = await self._session.execute(
            select(AdminUser).where(AdminUser.id == entity_id)
        )
        return result.scalar_one_or_none()

    async def get_all(self) -> list[AdminUser]:
        result = await self._session.execute(select(AdminUser))
        return list(result.scalars().all())

    async def get_by_email(self, email: str) -> AdminUser | None:
        result = await self._session.execute(
            select(AdminUser).where(AdminUser.email == email)
        )
        return result.scalar_one_or_none()

    async def create(
        self,
        email: str,
        hashed_password: str,
        full_name: str | None = None,
    ) -> AdminUser:
        user = AdminUser(
            email=email,
            hashed_password=hashed_password,
            full_name=full_name,
        )
        self._session.add(user)
        await self._session.flush()
        await self._session.refresh(user)
        return user

    async def count(self) -> int:
        result = await self._session.execute(select(func.count(AdminUser.id)))
        return result.scalar_one()
