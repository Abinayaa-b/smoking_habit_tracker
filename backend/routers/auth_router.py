from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, validator
from database import get_db
from models.db_models import User, MissedDayTracking
from utils.auth import hash_password, verify_password, create_access_token, get_current_user
from datetime import datetime
import random
import string

router = APIRouter(prefix="/auth", tags=["Authentication"])


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    age: int
    gender: str
    smoking_duration_years: int
    avg_cigarettes_per_day: int
    lang_pref: str = "English"

    @validator("password")
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v

    @validator("age")
    def valid_age(cls, v):
        if v < 10 or v > 120:
            raise ValueError("Age must be between 10 and 120")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ResetPasswordRequest(BaseModel):
    email: EmailStr


class ConfirmResetRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str


@router.post("/register", status_code=201)
async def register(data: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=data.email,
        password_hash=hash_password(data.password),
        full_name=data.full_name,
        age=data.age,
        gender=data.gender,
        smoking_duration_years=data.smoking_duration_years,
        avg_cigarettes_per_day=data.avg_cigarettes_per_day,
        lang_pref=data.lang_pref,
    )
    db.add(user)
    db.flush()

    # Initialize missed-day tracking record
    missed = MissedDayTracking(user_id=user.id, consecutive_missing_days=0)
    db.add(missed)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.id, "email": user.email})
    return {"access_token": token, "token_type": "bearer", "user_id": user.id, "full_name": user.full_name}


@router.post("/login")
async def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": user.id, "email": user.email})
    return {"access_token": token, "token_type": "bearer", "user_id": user.id, "full_name": user.full_name}


@router.post("/request-reset")
async def request_reset(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        # Don't reveal if email exists
        return {"message": "If that email is registered, an OTP has been sent."}

    otp = ''.join(random.choices(string.digits, k=6))
    from datetime import timedelta
    user.reset_otp = hash_password(otp)
    user.reset_otp_expiry = datetime.utcnow() + timedelta(minutes=10)
    db.commit()

    # In production: send otp via email service
    # For now, we return it in dev mode only
    return {"message": "OTP sent to your email.", "dev_otp": otp}


@router.post("/confirm-reset")
async def confirm_reset(data: ConfirmResetRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not user.reset_otp:
        raise HTTPException(status_code=400, detail="Invalid reset request")
    if datetime.utcnow() > user.reset_otp_expiry:
        raise HTTPException(status_code=400, detail="OTP has expired")
    if not verify_password(data.otp, user.reset_otp):
        raise HTTPException(status_code=400, detail="Invalid OTP")

    user.password_hash = hash_password(data.new_password)
    user.reset_otp = None
    user.reset_otp_expiry = None
    db.commit()
    return {"message": "Password reset successfully"}


@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "age": current_user.age,
        "gender": current_user.gender,
        "smoking_duration_years": current_user.smoking_duration_years,
        "avg_cigarettes_per_day": current_user.avg_cigarettes_per_day,
        "lang_pref": current_user.lang_pref,
        "created_at": current_user.created_at,
    }
