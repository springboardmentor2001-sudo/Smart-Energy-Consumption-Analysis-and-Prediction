"""
Simple ML Model Training for SmartEnergy
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
import pickle
from datetime import datetime, timedelta

# Generate synthetic data
np.random.seed(42)
n_samples = 5000

# Generate timestamps
start_date = datetime.now() - timedelta(days=365)
timestamps = [start_date + timedelta(hours=i) for i in range(n_samples)]

data = []
for i, ts in enumerate(timestamps):
    # Base consumption pattern
    base_consumption = 100

    # Time-based patterns
    hour = ts.hour
    day_of_week = ts.weekday()
    month = ts.month
    is_weekend = 1 if day_of_week >= 5 else 0

    # Seasonal patterns
    seasonal = np.sin(2 * np.pi * month / 12) * 20

    # Weekly patterns
    weekly = np.sin(2 * np.pi * day_of_week / 7) * 15

    # Hourly patterns
    hourly = np.sin(2 * np.pi * hour / 24) * 25

    # Weather factors
    temperature = 20 + 10 * np.sin(2 * np.pi * month / 12) + np.random.normal(0, 5)
    humidity = 60 + 20 * np.sin(2 * np.pi * month / 12) + np.random.normal(0, 10)
    renewable = 30 + 20 * np.sin(2 * np.pi * hour / 24) + np.random.normal(0, 5)

    # Occupancy (people in building)
    occupancy = 50 + 100 * (1 if 8 <= hour <= 18 else 0) * (0.7 if is_weekend else 1) + np.random.normal(0, 20)

    # Calculate energy consumption
    consumption = (
        base_consumption +
        seasonal +
        weekly +
        hourly +
        temperature * 2 +
        humidity * 0.5 +
        occupancy * 0.8 +
        renewable * -0.3 +
        np.random.normal(0, 10)
    )

    data.append({
        'timestamp': ts.isoformat(),
        'temperature': temperature,
        'humidity': humidity,
        'occupancy': occupancy,
        'renewable': renewable,
        'hour': hour,
        'day_of_week': day_of_week,
        'month': month,
        'is_weekend': is_weekend,
        'energy_consumption': max(0, consumption)
    })

df = pd.DataFrame(data)

# Prepare features and target
feature_cols = ['temperature', 'humidity', 'occupancy', 'renewable', 'hour', 'day_of_week', 'month', 'is_weekend']
X = df[feature_cols]
y = df['energy_consumption']

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train model
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Save model
with open('random_forest_model.pkl', 'wb') as f:
    pickle.dump(model, f)

print("Model trained and saved as random_forest_model.pkl")
print(f"Training samples: {len(X_train)}")
print(f"Test samples: {len(X_test)}")
print(".3f")
print(".3f")
