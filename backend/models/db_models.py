from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Date, Text, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from database import Base
import uuid
from datetime import datetime
import enum


def generate_uuid():
    return str(uuid.uuid4())


class GenderEnum(str, enum.Enum):
    male = "Male"
    female = "Female"
    other = "Other"


class SeverityEnum(str, enum.Enum):
    low = "Low"
    medium = "Medium"
    high = "High"
    critical = "Critical"


class ReportTypeEnum(str, enum.Enum):
    daily = "Daily"
    weekly = "Weekly"


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String, nullable=False)
    smoking_duration_years = Column(Integer, default=0)
    avg_cigarettes_per_day = Column(Integer, default=0)
    cigarette_cost_per_pack = Column(Float, default=10.0)
    lang_pref = Column(String, default="English")
    reset_otp = Column(String, nullable=True)
    reset_otp_expiry = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    logs = relationship("SmokingLog", back_populates="user", cascade="all, delete-orphan")
    predictions = relationship("Prediction", back_populates="user", cascade="all, delete-orphan")
    urge_events = relationship("UrgeEvent", back_populates="user", cascade="all, delete-orphan")
    missed_days = relationship("MissedDayTracking", back_populates="user", cascade="all, delete-orphan")
    reports = relationship("SummaryReport", back_populates="user", cascade="all, delete-orphan")


class SmokingLog(Base):
    __tablename__ = "smoking_logs"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False)
    cigarettes_smoked = Column(Integer, nullable=False)
    money_spent = Column(Float, nullable=True)
    craving_level = Column(Integer, nullable=True)  # 1-10
    mood = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="logs")


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False, default=datetime.utcnow().date)
    lungs_damage_pct = Column(Float, nullable=False)
    heart_damage_pct = Column(Float, nullable=False)
    brain_damage_pct = Column(Float, nullable=False)
    liver_damage_pct = Column(Float, nullable=False)
    severity_level = Column(String, nullable=False)
    avg_damage_pct = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="predictions")


class UrgeEvent(Base):
    __tablename__ = "urge_events"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    delay_timer_used = Column(Boolean, default=False)
    breathing_exercise_done = Column(Boolean, default=False)
    did_smoke_after = Column(Boolean, nullable=True)
    ai_insight_shown = Column(Text, nullable=True)
    language_used = Column(String, default="English")

    user = relationship("User", back_populates="urge_events")


class MissedDayTracking(Base):
    __tablename__ = "missed_days_tracking"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    consecutive_missing_days = Column(Integer, default=0)
    last_log_date = Column(Date, nullable=True)
    notified_day1 = Column(Boolean, default=False)
    notified_day2 = Column(Boolean, default=False)
    notified_day3 = Column(Boolean, default=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="missed_days")


class SummaryReport(Base):
    __tablename__ = "summary_reports"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    report_type = Column(String, nullable=False)  # Daily or Weekly
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    total_cigarettes = Column(Integer, default=0)
    avg_per_day = Column(Float, default=0.0)
    total_money_spent = Column(Float, default=0.0)
    avg_damage_pct = Column(Float, default=0.0)
    recovery_improvement = Column(Float, default=0.0)
    ai_motivational_insight = Column(Text, nullable=True)
    email_sent = Column(Boolean, default=False)
    generated_content = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="reports")


class ResearchReferenceData(Base):
    """Validated scoring logic based on WHO/CDC research sources."""
    __tablename__ = "research_reference_data"

    id = Column(String, primary_key=True, default=generate_uuid)
    organ = Column(String, nullable=False)  # lungs, heart, brain, liver
    risk_score_min = Column(Integer, nullable=False)
    risk_score_max = Column(Integer, nullable=False)
    severity_label = Column(String, nullable=False)
    visual_state_reference = Column(String, nullable=False)  # healthy, mild, moderate, severe
    color_hex = Column(String, nullable=True)
    animation_speed_multiplier = Column(Float, nullable=True)
    research_source = Column(String, nullable=True)
    research_source_url = Column(String, nullable=True)
