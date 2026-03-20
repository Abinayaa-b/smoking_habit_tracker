from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models.db_models import User, UrgeEvent
from utils.auth import get_current_user
from services.gemini_service import generate_organ_voice, generate_urge_support, generate_missed_log_message
from datetime import datetime

router = APIRouter(prefix="/ai", tags=["AI Interaction"])


class OrganVoiceRequest(BaseModel):
    organ: str  # lungs, heart, brain, liver
    damage_pct: float
    severity: str
    missed_days: int = 0
    language: str = "English"


class UrgeRequest(BaseModel):
    cigarettes_per_day: int
    smoking_years: int
    language: str = "English"
    delay_timer_used: bool = False
    breathing_done: bool = False


class MissedLogNotifRequest(BaseModel):
    consecutive_days: int
    language: str = "English"


@router.post("/organ-voice")
async def organ_voice(
    data: OrganVoiceRequest,
    current_user: User = Depends(get_current_user)
):
    """Generate detailed, research-backed AI voice text for an organ."""
    message = await generate_organ_voice(
        organ=data.organ,
        damage_pct=data.damage_pct,
        severity=data.severity,
        missed_days=data.missed_days,
        language=data.language
    )
    return {"organ": data.organ, "message": message, "language": data.language}


@router.post("/urge-support")
async def urge_support(
    data: UrgeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Register an urge event and return detailed motivational content."""
    result = await generate_urge_support(
        cigarettes_per_day=data.cigarettes_per_day,
        smoking_years=data.smoking_years,
        language=data.language,
        delay_timer_used=data.delay_timer_used,
        breathing_done=data.breathing_done
    )

    # Store urge event for analytics
    urge_event = UrgeEvent(
        user_id=current_user.id,
        delay_timer_used=data.delay_timer_used,
        breathing_exercise_done=data.breathing_done,
        ai_insight_shown=result.get("motivation", "")[:500],
        language_used=data.language,
        timestamp=datetime.utcnow()
    )
    db.add(urge_event)
    db.commit()

    return {
        "story": result.get("story", ""),
        "motivation": result.get("motivation", ""),
        "tip": result.get("tip", ""),
        "breathing_steps": [
            "Breathe in slowly for 4 seconds",
            "Hold for 4 seconds",
            "Exhale slowly for 6 seconds",
            "Repeat 5 times"
        ],
        "delay_minutes": 10
    }


@router.post("/missed-log-message")
async def missed_log_message(data: MissedLogNotifRequest):
    """Generate an escalating but supportive missed-log reminder."""
    message = await generate_missed_log_message(
        missed_days=data.consecutive_days,
        language=data.language
    )
    return {"message": message, "escalation_level": min(data.consecutive_days, 3)}
