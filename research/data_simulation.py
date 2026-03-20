import pandas as pd
import numpy as np
import os

def simulate_smoking_data(n_samples=2000):
    np.random.seed(42)
    
    # Features
    age = np.random.randint(18, 80, n_samples)
    gender = np.random.choice(['Male', 'Female', 'Other'], n_samples)
    smoking_years = np.array([np.random.randint(0, (a - 15) if a > 15 else 1) for a in age])
    cigarettes_per_day = np.random.randint(0, 50, n_samples)
    
    # Calculate Pack Years: (Cigarettes per day / 20) * Years of Smoking
    pack_years = (cigarettes_per_day / 20.0) * smoking_years
    
    # Target: Damage Percentages (Research-driven logic)
    # Lungs: Very high sensitivity to pack years
    lungs_damage = (pack_years * 2.5) + (age * 0.2) + np.random.normal(0, 5, n_samples)
    
    # Heart: High sensitivity to intensity (cigarettes/day) and duration
    heart_damage = (pack_years * 1.5) + (cigarettes_per_day * 0.8) + (age * 0.1) + np.random.normal(0, 5, n_samples)
    
    # Brain: Sensitivity to duration and age (stroke risk)
    brain_damage = (pack_years * 1.2) + (age * 0.5) + np.random.normal(0, 3, n_samples)
    
    # Liver: Moderate sensitivity, systemic impact
    liver_damage = (pack_years * 0.8) + (cigarettes_per_day * 0.4) + np.random.normal(0, 2, n_samples)
    
    # Clip values between 0 and 100
    lungs_damage = np.clip(lungs_damage, 0, 100)
    heart_damage = np.clip(heart_damage, 0, 100)
    brain_damage = np.clip(brain_damage, 0, 100)
    liver_damage = np.clip(liver_damage, 0, 100)
    
    # Severity Level based on average damage
    avg_damage = (lungs_damage + heart_damage + brain_damage + liver_damage) / 4.0
    severity = []
    for d in avg_damage:
        if d < 20: severity.append('Low')
        elif d < 40: severity.append('Medium')
        elif d < 70: severity.append('High')
        else: severity.append('Critical')
        
    df = pd.DataFrame({
        'age': age,
        'gender': gender,
        'smoking_years': smoking_years,
        'cigarettes_per_day': cigarettes_per_day,
        'pack_years': pack_years,
        'lungs_damage': lungs_damage,
        'heart_damage': heart_damage,
        'brain_damage': brain_damage,
        'liver_damage': liver_damage,
        'severity': severity
    })
    
    output_path = 'research/synthetic_smoking_health_data.csv'
    df.to_csv(output_path, index=False)
    print(f"Dataset generated successfully at {output_path}")
    return df

if __name__ == "__main__":
    if not os.path.exists('research'):
        os.makedirs('research')
    simulate_smoking_data()
