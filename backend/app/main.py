
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import Base, engine
from app.models.personnel import Personnel
from app.api.v1.personnel import router as personnel_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Development bootstrap only.
    # Production database changes will use Alembic migrations.
    if settings.ENVIRONMENT == "development":
        Base.metadata.create_all(bind=engine)

    yield


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Enterprise Personnel and Welfare Administration API",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
)


@app.get("/")
def root():
    return {
        "product": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "operational",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "ADES API",
    }


app.include_router(
    personnel_router,
    prefix=settings.API_PREFIX,
)
