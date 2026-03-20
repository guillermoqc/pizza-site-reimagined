import math
import uuid

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.order_repository import OrderRepository
from app.schemas.order import OrderListResponse, OrderSchema, OrderStatusUpdate

# Defines which transitions are allowed — enforces a strict order lifecycle
VALID_TRANSITIONS: dict[str, list[str]] = {
    "pending": ["confirmed", "cancelled"],
    "confirmed": ["preparing", "cancelled"],
    "preparing": ["ready", "cancelled"],
    "ready": ["delivered", "cancelled"],
    "delivered": [],
    "cancelled": [],
}


class OrderService:
    """Handles all order-related business logic."""

    def __init__(self, session: AsyncSession) -> None:
        self._repo = OrderRepository(session)

    async def list_orders(
        self,
        page: int = 1,
        page_size: int = 15,
        status_filter: str | None = None,
        search: str | None = None,
    ) -> OrderListResponse:
        orders, total = await self._repo.get_paginated(
            page=page,
            page_size=page_size,
            status_filter=status_filter,
            search=search,
        )
        total_pages = max(1, math.ceil(total / page_size))
        return OrderListResponse(
            orders=[OrderSchema.model_validate(o) for o in orders],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        )

    async def get_order(self, order_id: uuid.UUID) -> OrderSchema:
        order = await self._repo.get_by_id(order_id)
        if order is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Order {order_id} not found",
            )
        return OrderSchema.model_validate(order)

    async def update_status(
        self, order_id: uuid.UUID, update: OrderStatusUpdate
    ) -> OrderSchema:
        if not update.is_valid():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status value: '{update.status}'",
            )
        order = await self._repo.get_by_id(order_id)
        if order is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Order {order_id} not found",
            )
        current = order.order_status or "pending"
        allowed = VALID_TRANSITIONS.get(current, [])
        if update.status not in allowed:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Cannot transition from '{current}' to '{update.status}'. "
                f"Allowed: {allowed}",
            )
        updated = await self._repo.update_status(order_id, update.status)
        return OrderSchema.model_validate(updated)
