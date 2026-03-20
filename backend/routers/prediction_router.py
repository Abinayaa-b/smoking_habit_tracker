from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models.db_models import User
from utils.auth import get_current_user
from services.prediction_service import predict_organ_damage

router = APIRouter(prefix="/prediction", tags=["Health Prediction"])


@router.get("/current")
async def get_current_prediction(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get the latest AI-driven health damage prediction for the authenticated user.
    Uses researched organ damage model based on WHO/CDC data.
    """
    from models.db_models import SmokingLog
    from datetime import date, timedelta

    # Get recent average cigarettes
    recent_logs = db.query(SmokingLog).filter(
        SmokingLog.user_id == current_user.id,
        SmokingLog.date >= date.today() - timedelta(days=7)
    ).all()

    if recent_logs:
        avg_recent = sum(l.cigarettes_smoked for l in recent_logs) / len(recent_logs)
    else:
        avg_recent = current_user.avg_cigarettes_per_day

    result = predict_organ_damage(
        age=current_user.age,
        smoking_years=current_user.smoking_duration_years,
        cigarettes_per_day=int(avg_recent)
    )
    return result


class ManualPredictionRequest(BaseModel):
    age: int
    smoking_years: int
    cigarettes_per_day: int


@router.post("/calculate")
async def calculate_prediction(data: ManualPredictionRequest):
    """Calculate prediction for given inputs (also usable without auth for demos)."""
    return predict_organ_damage(
        age=data.age,
        smoking_years=data.smoking_years,
        cigarettes_per_day=data.cigarettes_per_day
    )
