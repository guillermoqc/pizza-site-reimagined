import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.order import Order, OrderItem, OrderModifier
from app.repositories.base_repository import BaseRepository


class OrderRepository(BaseRepository[Order]):
    """Handles all database operations for Order entities."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)

    def _with_items(self):
        return select(Order).options(
            selectinload(Order.items).selectinload(OrderItem.modifiers)
        )

    async def get_by_id(self, entity_id: uuid.UUID) -> Order | None:
        result = await self._session.execute(
            self._with_items().where(Order.id == entity_id)
        )
        return result.scalar_one_or_none()

    async def get_all(self) -> list[Order]:
        result = await self._session.execute(
            select(Order).order_by(Order.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_paginated(
        self,
        page: int = 1,
        page_size: int = 15,
        status_filter: str | None = None,
        search: str | None = None,
    ) -> tuple[list[Order], int]:
        filters = []
        if status_filter and status_filter != "all":
            filters.append(Order.order_status == status_filter)
        if search:
            filters.append(
                Order.customer_phone.ilike(f"%{search}%")
                | Order.customer_name.ilike(f"%{search}%")
                | Order.id.cast(type_=None).ilike(f"%{search}%")
            )

        base_query = self._with_items()
        count_query = select(func.count(Order.id))

        if filters:
            base_query = base_query.where(and_(*filters))
            count_query = count_query.where(and_(*filters))

        total = (await self._session.execute(count_query)).scalar_one()
        offset = (page - 1) * page_size
        rows = await self._session.execute(
            base_query.order_by(Order.created_at.desc()).offset(offset).limit(page_size)
        )
        return list(rows.scalars().all()), total

    async def update_status(self, order_id: uuid.UUID, new_status: str) -> Order | None:
        order = await self.get_by_id(order_id)
        if order is None:
            return None
        order.order_status = new_status
        await self._session.flush()
        return order

    async def get_today_stats(self) -> dict:
        today_start = datetime.now(timezone.utc).replace(
            hour=0, minute=0, second=0, microsecond=0
        )
        row = (
            await self._session.execute(
                select(
                    func.count(Order.id).label("count"),
                    func.coalesce(func.sum(Order.total_amount), 0).label("revenue"),
                    func.coalesce(func.avg(Order.total_amount), 0).label("avg"),
                ).where(Order.created_at >= today_start)
            )
        ).one()
        return {"count": row.count, "revenue": row.revenue, "avg": row.avg}

    async def get_total_count(self) -> int:
        result = await self._session.execute(select(func.count(Order.id)))
        return result.scalar_one()

    async def get_status_breakdown(self) -> list[dict]:
        rows = (
            await self._session.execute(
                select(
                    Order.order_status.label("status"),
                    func.count(Order.id).label("count"),
                )
                .where(Order.order_status.isnot(None))
                .group_by(Order.order_status)
            )
        ).all()
        return [{"status": r.status, "count": r.count} for r in rows]

    async def get_last_7_days_stats(self) -> dict:
        week_ago = datetime.now(timezone.utc) - timedelta(days=7)
        row = (
            await self._session.execute(
                select(
                    func.count(Order.id).label("count"),
                    func.coalesce(func.sum(Order.total_amount), 0).label("revenue"),
                ).where(Order.created_at >= week_ago)
            )
        ).one()
        return {"count": row.count, "revenue": row.revenue}
