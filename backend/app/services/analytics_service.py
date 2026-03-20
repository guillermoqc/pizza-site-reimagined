from decimal import Decimal

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.order_repository import OrderRepository
from app.schemas.analytics import AnalyticsResponse, OrderStatusCount


class AnalyticsService:
    """Aggregates order data into dashboard KPIs and charts."""

    def __init__(self, session: AsyncSession) -> None:
        self._repo = OrderRepository(session)

    async def get_dashboard_analytics(self) -> AnalyticsResponse:
        today_stats, total_orders, status_breakdown, week_stats = (
            await self._repo.get_today_stats(),
            await self._repo.get_total_count(),
            await self._repo.get_status_breakdown(),
            await self._repo.get_last_7_days_stats(),
        )
        return AnalyticsResponse(
            orders_today=int(today_stats["count"]),
            revenue_today=Decimal(str(today_stats["revenue"])),
            avg_order_value=Decimal(str(today_stats["avg"])),
            total_orders=total_orders,
            orders_by_status=[
                OrderStatusCount(status=s["status"], count=s["count"])
                for s in status_breakdown
            ],
            revenue_last_7_days=Decimal(str(week_stats["revenue"])),
            orders_last_7_days=int(week_stats["count"]),
        )
