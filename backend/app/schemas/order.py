import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel

VALID_STATUSES = frozenset(
    {"pending", "confirmed", "preparing", "ready", "delivered", "cancelled"}
)


class OrderModifierSchema(BaseModel):
    id: uuid.UUID
    modifier_name: str | None
    modifier_price: Decimal | None

    model_config = {"from_attributes": True}


class OrderItemSchema(BaseModel):
    id: uuid.UUID
    item_name: str | None
    base_price: Decimal | None
    quantity: int | None
    item_total: Decimal | None
    modifiers: list[OrderModifierSchema] = []

    model_config = {"from_attributes": True}


class OrderSchema(BaseModel):
    id: uuid.UUID
    store_id: uuid.UUID | None
    customer_name: str | None
    customer_phone: str | None
    total_amount: Decimal | None
    order_status: str | None
    created_at: datetime | None
    items: list[OrderItemSchema] = []

    model_config = {"from_attributes": True}


class OrderListResponse(BaseModel):
    orders: list[OrderSchema]
    total: int
    page: int
    page_size: int
    total_pages: int


class OrderStatusUpdate(BaseModel):
    status: str

    def is_valid(self) -> bool:
        return self.status in VALID_STATUSES
