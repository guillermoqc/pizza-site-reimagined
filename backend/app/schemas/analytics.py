from decimal import Decimal

from pydantic import BaseModel


class OrderStatusCount(BaseModel):
    status: str
    count: int


class AnalyticsResponse(BaseModel):
    orders_today: int
    revenue_today: Decimal
    avg_order_value: Decimal
    total_orders: int
    orders_by_status: list[OrderStatusCount]
    revenue_last_7_days: Decimal
    orders_last_7_days: int
