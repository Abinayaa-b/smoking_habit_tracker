import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, r2_score
import joblib
import os

def train_health_impact_model():
    # Load data
    data_path = 'research/synthetic_smoking_health_data.csv'
    if not os.path.exists(data_path):
        print("Data file not found. Run data_simulation.py first.")
        return
        
    df = pd.read_csv(data_path)
    
    # Features & Targets
    # Note: We exclude pack_years as it's a derived feature we'll calculate in the API
    X = df[['age', 'smoking_years', 'cigarettes_per_day']]
    Y = df[['lungs_damage', 'heart_damage', 'brain_damage', 'liver_damage']]
    
    # Split
    X_train, X_test, Y_train, Y_test = train_test_split(X, Y, test_size=0.2, random_state=42)
    
    # Scale
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train Model
    # Using a multi-output regressor capable Random Forest
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train_scaled, Y_train)
    
    # Evaluate
    predictions = model.predict(X_test_scaled)
    mae = mean_absolute_error(Y_test, predictions)
    r2 = r2_score(Y_test, predictions)
    
    print(f"Model Training Complete.")
    print(f"Mean Absolute Error: {mae:.2f}")
    print(f"R2 Score: {r2:.2f}")
    
    # Save Model and Scaler for Production
    model_dir = 'backend/models'
    if not os.path.exists(model_dir):
        os.makedirs(model_dir)
        
    joblib.dump(model, os.path.join(model_dir, 'health_impact_rf_model.pkl'))
    joblib.dump(scaler, os.path.join(model_dir, 'health_impact_scaler.pkl'))
    print(f"Model and Scaler saved to {model_dir}")

if __name__ == "__main__":
    train_health_impact_model()
