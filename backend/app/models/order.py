import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Numeric, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class OrderModifier(Base):
    """Customizations attached to an order item (size, crust, addons)."""

    __tablename__ = "order_modifiers"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    order_item_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("order_items.id"), nullable=False
    )
    modifier_name: Mapped[str | None] = mapped_column(String, nullable=True)
    modifier_price: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)

    order_item: Mapped["OrderItem"] = relationship("OrderItem", back_populates="modifiers")


class OrderItem(Base):
    """A single product line within an order."""

    __tablename__ = "order_items"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    order_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("orders.id"), nullable=False
    )
    item_name: Mapped[str | None] = mapped_column(String, nullable=True)
    base_price: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    quantity: Mapped[int | None] = mapped_column(nullable=True)
    item_total: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)

    order: Mapped["Order"] = relationship("Order", back_populates="items")
    modifiers: Mapped[list[OrderModifier]] = relationship(
        "OrderModifier", back_populates="order_item", lazy="selectin"
    )


class Order(Base):
    """Customer order — maps to the existing Supabase orders table."""

    __tablename__ = "orders"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    store_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)
    customer_name: Mapped[str | None] = mapped_column(String, nullable=True)
    customer_phone: Mapped[str | None] = mapped_column(String, nullable=True)
    total_amount: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    order_status: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    items: Mapped[list[OrderItem]] = relationship(
        "OrderItem", back_populates="order", lazy="selectin"
    )
