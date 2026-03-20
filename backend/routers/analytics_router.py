from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models.db_models import User, SmokingLog, UrgeEvent, Prediction
from utils.auth import get_current_user
from datetime import date, timedelta

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/trends")
async def get_trends(
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    since = date.today() - timedelta(days=days)
    logs = db.query(SmokingLog).filter(
        SmokingLog.user_id == current_user.id,
        SmokingLog.date >= since
    ).order_by(SmokingLog.date.asc()).all()

    return [{"date": str(l.date), "cigarettes": l.cigarettes_smoked, "money": l.money_spent or 0} for l in logs]


@router.get("/financial")
async def get_financial_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = date.today()
    # Daily
    day_logs = db.query(SmokingLog).filter(SmokingLog.user_id == current_user.id, SmokingLog.date == today).all()
    daily = sum(l.money_spent or 0 for l in day_logs)
    # Monthly
    month_start = today.replace(day=1)
    month_logs = db.query(SmokingLog).filter(SmokingLog.user_id == current_user.id, SmokingLog.date >= month_start).all()
    monthly = sum(l.money_spent or 0 for l in month_logs)
    # Yearly
    year_start = today.replace(month=1, day=1)
    year_logs = db.query(SmokingLog).filter(SmokingLog.user_id == current_user.id, SmokingLog.date >= year_start).all()
    yearly = sum(l.money_spent or 0 for l in year_logs)
    # All time
    all_logs = db.query(SmokingLog).filter(SmokingLog.user_id == current_user.id).all()
    total_all = sum(l.money_spent or 0 for l in all_logs)

    cost_per_pack = current_user.cigarette_cost_per_pack or 10.0

    return {
        "daily": round(daily, 2),
        "monthly": round(monthly, 2),
        "yearly": round(yearly, 2),
        "all_time": round(total_all, 2),
        "alternatives": {
            "books": round(yearly / 300, 1),
            "movies": round(yearly / 150, 1),
            "gym_months": round(yearly / 600, 1),
            "restaurant_meals": round(yearly / 250, 1),
        }
    }


@router.get("/urge-stats")
async def get_urge_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = date.today()
    week_ago = today - timedelta(days=7)
    urges = db.query(UrgeEvent).filter(UrgeEvent.user_id == current_user.id).all()
    recent = [u for u in urges if u.timestamp.date() >= week_ago]
    return {
        "total_urges": len(urges),
        "urges_this_week": len(recent),
        "breathing_used": sum(1 for u in urges if u.breathing_exercise_done),
        "timer_used": sum(1 for u in urges if u.delay_timer_used),
    }


@router.get("/overview")
async def get_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    logs = db.query(SmokingLog).filter(SmokingLog.user_id == current_user.id).order_by(SmokingLog.date.desc()).all()
    if not logs:
        return {"total_logs": 0, "avg_daily": 0, "best_day": None, "worst_day": None, "streak": 0}

    # Streak
    streak = 0
    check = date.today()
    log_dates = {l.date for l in logs}
    while check in log_dates:
        streak += 1
        check -= timedelta(days=1)

    # Best/worst
    sorted_by_cigs = sorted(logs, key=lambda l: l.cigarettes_smoked)
    best = sorted_by_cigs[0] if sorted_by_cigs else None
    worst = sorted_by_cigs[-1] if sorted_by_cigs else None

    avg = sum(l.cigarettes_smoked for l in logs) / len(logs)

    # Week over week comparison
    this_week = [l for l in logs if l.date >= date.today() - timedelta(days=7)]
    last_week = [l for l in logs if date.today() - timedelta(days=14) <= l.date < date.today() - timedelta(days=7)]
    this_avg = sum(l.cigarettes_smoked for l in this_week) / max(len(this_week), 1)
    last_avg = sum(l.cigarettes_smoked for l in last_week) / max(len(last_week), 1)
    reduction_pct = round(((last_avg - this_avg) / max(last_avg, 1)) * 100, 1) if last_avg else 0

    return {
        "total_logs": len(logs),
        "avg_daily_cigarettes": round(avg, 1),
        "streak_days": streak,
        "best_day": {"date": str(best.date), "cigarettes": best.cigarettes_smoked} if best else None,
        "worst_day": {"date": str(worst.date), "cigarettes": worst.cigarettes_smoked} if worst else None,
        "week_reduction_pct": reduction_pct,
    }
