from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from contextlib import asynccontextmanager
import os

load_dotenv()

# Import routers
from routers.auth_router import router as auth_router
from routers.logs_router import router as logs_router
from routers.prediction_router import router as prediction_router
from routers.ai_router import router as ai_router
from routers.analytics_router import router as analytics_router
from routers.user_router import router as user_router

# Import scheduler
from services.scheduler_service import init_scheduler

# Import DB init
from database import engine, Base


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create DB tables on startup
    Base.metadata.create_all(bind=engine)
    # Start background scheduler
    init_scheduler()
    yield
    # Shutdown logic here if needed


app = FastAPI(
    title="Smoking Habit Tracker API",
    description=(
        "AI-powered Smoking Habit Monitoring and Quit Assistance API. "
        "Predictions are educational estimates based on WHO/CDC research data. "
        "Not a clinical diagnosis."
    ),
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router)
app.include_router(logs_router)
app.include_router(prediction_router)
app.include_router(ai_router)
app.include_router(analytics_router)
app.include_router(user_router)


@app.get("/")
async def root():
    return {
        "message": "Smoking Habit Tracker API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy", "api": "running"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
    # API key securely injected and reloaded
