from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import AsyncSessionLocal, Base, engine

# Import models so SQLAlchemy registers them before create_all
from app.models import AdminUser, Order, OrderItem, OrderModifier  # noqa: F401
from app.routers import analytics, auth, orders
from app.services.auth_service import AuthService


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create only the admin_users table — existing Supabase tables stay untouched
    async with engine.begin() as conn:
        await conn.run_sync(
            Base.metadata.create_all,
            tables=[AdminUser.__table__],
        )

    # Seed the first admin user if the table is empty
    async with AsyncSessionLocal() as session:
        service = AuthService(session)
        await service.seed_first_admin(
            email=settings.first_admin_email,
            password=settings.first_admin_password,
            full_name=settings.first_admin_full_name,
        )
        await session.commit()

    yield


app = FastAPI(
    title="Pizza Dashboard API",
    description="Order tracking dashboard with JWT authentication — OOP Python backend",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url,
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(orders.router)
app.include_router(analytics.router)


@app.get("/health", tags=["health"])
async def health_check():
    return {"status": "ok", "service": "Pizza Dashboard API"}
