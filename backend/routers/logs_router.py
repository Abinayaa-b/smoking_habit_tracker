from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from database import get_db
from models.db_models import User, SmokingLog, MissedDayTracking
from utils.auth import get_current_user
from services.prediction_service import predict_organ_damage
from datetime import date, datetime, timedelta

router = APIRouter(prefix="/logs", tags=["Smoking Logs"])


class LogRequest(BaseModel):
    date: date
    cigarettes_smoked: int
    money_spent: Optional[float] = None
    craving_level: Optional[int] = None  # 1-10
    mood: Optional[str] = None
    notes: Optional[str] = None


@router.post("/daily", status_code=201)
async def submit_daily_log(
    data: LogRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Prevent duplicate log for same date
    existing = db.query(SmokingLog).filter(
        SmokingLog.user_id == current_user.id,
        SmokingLog.date == data.date
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="A log for this date already exists. Use update instead.")

    # Auto-calculate money spent using real Indian market rates
    # Average cigarette price in India (2025-2026): ₹12-18 per stick
    # Based on ITC Classic, Gold Flake, Marlboro avg pricing
    # Default: ₹15 per cigarette = ₹300 per pack of 20
    COST_PER_CIGARETTE_INR = 25.0  # ₹25 per single cigarette (Indian market avg)
    money = data.money_spent
    if money is None:
        if current_user.cigarette_cost_per_pack and current_user.cigarette_cost_per_pack > 0:
            # Although the DB column is called 'per_pack', the UI label is Cost per Cigarette to better fit Indian market
            money = round(data.cigarettes_smoked * current_user.cigarette_cost_per_pack, 2)
        else:
            money = round(data.cigarettes_smoked * COST_PER_CIGARETTE_INR, 2)

    log = SmokingLog(
        user_id=current_user.id,
        date=data.date,
        cigarettes_smoked=data.cigarettes_smoked,
        money_spent=money,
        craving_level=data.craving_level,
        mood=data.mood,
        notes=data.notes,
    )
    db.add(log)

    # Reset missed days tracking
    missed = db.query(MissedDayTracking).filter(
        MissedDayTracking.user_id == current_user.id
    ).first()
    if missed:
        missed.consecutive_missing_days = 0
        missed.last_log_date = data.date
        missed.notified_day1 = False
        missed.notified_day2 = False
        missed.notified_day3 = False

    db.commit()
    db.refresh(log)

    # Run new prediction based on this user's updated data
    prediction = predict_organ_damage(
        age=current_user.age,
        smoking_years=current_user.smoking_duration_years,
        cigarettes_per_day=data.cigarettes_smoked
    )

    return {
        "log_id": log.id,
        "date": log.date,
        "cigarettes_smoked": log.cigarettes_smoked,
        "money_spent": log.money_spent,
        "prediction": prediction
    }


@router.get("/history")
async def get_log_history(
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    since = date.today() - timedelta(days=days)
    logs = db.query(SmokingLog).filter(
        SmokingLog.user_id == current_user.id,
        SmokingLog.date >= since
    ).order_by(SmokingLog.date.asc()).all()

    return [
        {
            "id": l.id,
            "date": l.date,
            "cigarettes_smoked": l.cigarettes_smoked,
            "money_spent": l.money_spent,
            "craving_level": l.craving_level,
            "mood": l.mood,
        }
        for l in logs
    ]


@router.get("/streak")
async def get_streak(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Calculate current logging streak and reduction trend."""
    logs = db.query(SmokingLog).filter(
        SmokingLog.user_id == current_user.id
    ).order_by(SmokingLog.date.desc()).all()

    if not logs:
        return {"streak_days": 0, "total_logs": 0, "avg_cigarettes_last_7_days": 0}

    streak = 0
    check_date = date.today()
    log_dates = {l.date for l in logs}
    while check_date in log_dates:
        streak += 1
        check_date -= timedelta(days=1)

    recent = [l.cigarettes_smoked for l in logs[:7]]
    return {
        "streak_days": streak,
        "total_logs": len(logs),
        "avg_cigarettes_last_7_days": round(sum(recent) / len(recent), 1) if recent else 0,
    }
