from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from database import get_db
from models.db_models import User
from utils.auth import get_current_user

router = APIRouter(prefix="/user", tags=["User"])


class ProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    age: Optional[int] = None
    smoking_duration_years: Optional[int] = None
    avg_cigarettes_per_day: Optional[int] = None
    cigarette_cost_per_pack: Optional[float] = None
    lang_pref: Optional[str] = None


@router.put("/profile")
async def update_profile(
    data: ProfileUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if data.full_name: current_user.full_name = data.full_name
    if data.age: current_user.age = data.age
    if data.smoking_duration_years is not None: current_user.smoking_duration_years = data.smoking_duration_years
    if data.avg_cigarettes_per_day is not None: current_user.avg_cigarettes_per_day = data.avg_cigarettes_per_day
    if data.cigarette_cost_per_pack is not None: current_user.cigarette_cost_per_pack = data.cigarette_cost_per_pack
    if data.lang_pref: current_user.lang_pref = data.lang_pref
    db.commit()
    return {"message": "Profile updated successfully"}


@router.get("/quit-plan")
async def get_quit_plan(
    current_user: User = Depends(get_current_user)
):
    """Generate a personalized quit plan based on user's smoking profile."""
    cpd = current_user.avg_cigarettes_per_day or 10
    weeks = []
    for w in range(1, 9):
        # Linear reduction down to 0 over 8 weeks
        reduction = max(0, int(round(cpd * (1 - (w / 8.0)))))
        weeks.append({
            "week": w,
            "target_cigarettes_per_day": reduction,
            "reduction_from_start": cpd - reduction,
            "percentage_reduced": round(((cpd - reduction) / max(cpd, 1)) * 100, 1),
            "tip": _get_week_tip(w),
        })
    return {
        "starting_cigarettes_per_day": cpd,
        "quit_date_estimate": "Week 9 (smoke-free)",
        "weekly_plan": weeks,
        "habit_replacements": [
            "Chew sugar-free gum when urge strikes",
            "Do 10 push-ups during craving moments",
            "Drink a glass of cold water immediately",
            "Call or text a supportive friend",
            "Use the BreatheFree breathing exercise",
        ],
        "milestones": [
            {"day": 1, "benefit": "Blood pressure and heart rate normalize"},
            {"day": 3, "benefit": "Nicotine fully leaves your bloodstream"},
            {"day": 14, "benefit": "Circulation improves, lung function increases"},
            {"day": 30, "benefit": "Coughing and shortness of breath decrease"},
            {"day": 90, "benefit": "Lung function improves by up to 30%"},
            {"day": 365, "benefit": "Heart disease risk drops to half of a smoker's"},
        ]
    }


def _get_week_tip(week: int) -> str:
    tips = {
        1: "Start by identifying your trigger times and situations.",
        2: "Replace your first cigarette of the day with a 5-min walk.",
        3: "Tell a friend or family member about your quit journey.",
        4: "Delay each smoke by 15 minutes using the breathing timer.",
        5: "Calculate the money you've saved this month — treat yourself!",
        6: "You're over halfway! Notice how your breathing has improved.",
        7: "Identify the one remaining craving time and plan a distraction.",
        8: "You're almost smoke-free. Talk to your doctor about your progress.",
    }
    return tips.get(week, "Stay strong — you are doing amazing!")
