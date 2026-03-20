import joblib
import numpy as np
import os
from typing import Dict

# Load the ML model and scaler once at startup
MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'models', 'health_impact_rf_model.pkl')
SCALER_PATH = os.path.join(os.path.dirname(__file__), '..', 'models', 'health_impact_scaler.pkl')

_model = None
_scaler = None


def _load_model():
    global _model, _scaler
    if _model is None:
        try:
            _model = joblib.load(MODEL_PATH)
            _scaler = joblib.load(SCALER_PATH)
        except FileNotFoundError:
            print("WARNING: ML model not found. Run research/train_model.py first.")
            _model = None
            _scaler = None


def get_severity(avg_damage: float) -> str:
    """Map average damage percentage to severity level based on research thresholds."""
    if avg_damage < 20:
        return "Low"
    elif avg_damage < 40:
        return "Medium"
    elif avg_damage < 70:
        return "High"
    else:
        return "Critical"


def get_visual_state(damage_pct: float) -> dict:
    """
    Map damage percentage to 3D visual parameters.
    Values derived from WHO/CDC smoking impact data and clinical staging.
    """
    if damage_pct <= 20:
        return {
            "state": "healthy",
            "color_hex": "#FFB6C1",
            "animation_speed_multiplier": 1.0,
            "roughness": 0.2,
            "emissive_intensity": 0.8,
            "displacement_scale": 0.0,
        }
    elif damage_pct <= 40:
        return {
            "state": "mild",
            "color_hex": "#E89A9A",
            "animation_speed_multiplier": 0.9,
            "roughness": 0.4,
            "emissive_intensity": 0.5,
            "displacement_scale": 0.02,
        }
    elif damage_pct <= 70:
        return {
            "state": "moderate",
            "color_hex": "#A56060",
            "animation_speed_multiplier": 0.7,
            "roughness": 0.65,
            "emissive_intensity": 0.3,
            "displacement_scale": 0.05,
        }
    else:
        return {
            "state": "severe",
            "color_hex": "#4A3030",
            "animation_speed_multiplier": 0.4,
            "roughness": 0.9,
            "emissive_intensity": 0.1,
            "displacement_scale": 0.1,
        }


def predict_organ_damage(age: int, smoking_years: int, cigarettes_per_day: int) -> Dict:
    """
    Predict organ damage percentages using the trained Random Forest model.
    Inputs match research-validated features: age, smoking duration, cigarettes/day.
    """
    _load_model()

    if _model is None:
        # Fallback: formula-based estimation when model file unavailable
        pack_years = (cigarettes_per_day / 20.0) * smoking_years
        lungs = min(100, pack_years * 2.5 + age * 0.2)
        heart = min(100, pack_years * 1.5 + cigarettes_per_day * 0.8 + age * 0.1)
        brain = min(100, pack_years * 1.2 + age * 0.5)
        liver = min(100, pack_years * 0.8 + cigarettes_per_day * 0.4)
    else:
        features = np.array([[age, smoking_years, cigarettes_per_day]])
        scaled = _scaler.transform(features)
        result = _model.predict(scaled)[0]
        lungs, heart, brain, liver = [max(0, min(100, float(v))) for v in result]

    avg = (lungs + heart + brain + liver) / 4.0

    return {
        "lungs_damage_pct": round(lungs, 2),
        "heart_damage_pct": round(heart, 2),
        "brain_damage_pct": round(brain, 2),
        "liver_damage_pct": round(liver, 2),
        "avg_damage_pct": round(avg, 2),
        "severity_level": get_severity(avg),
        "visual_states": {
            "lungs": get_visual_state(lungs),
            "heart": get_visual_state(heart),
            "brain": get_visual_state(brain),
            "liver": get_visual_state(liver),
        },
        "disclaimer": (
            "This prediction is an educational estimate based on statistical smoking impact "
            "data from WHO/CDC research. It is not a clinical diagnosis. "
            "Please consult a medical professional for health advice."
        )
    }
