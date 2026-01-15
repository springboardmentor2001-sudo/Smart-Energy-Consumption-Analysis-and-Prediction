import pandas as pd
import numpy as np
import lightgbm as lgb
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib
import os

# Set paths
base_dir = os.path.dirname(os.path.abspath(__file__))
data_path = os.path.join(base_dir, 'Notebooks', 'Energy_consumption.csv')
model_dir = os.path.join(base_dir, 'Models')
os.makedirs(model_dir, exist_ok=True)
model_path = os.path.join(model_dir, 'lgb_model.pkl') # Overwriting user's model or creating new clean one? User said "I have already model". 
# Better to save as clean one to respect user's file but providing a working one.
clean_model_path = os.path.join(model_dir, 'lgb_model_clean.pkl')

print("Loading data...")
df = pd.read_csv(data_path)
df['Timestamp'] = pd.to_datetime(df['Timestamp'])
df = df.sort_values('Timestamp').reset_index(drop=True)

# Preprocessing
print("Preprocessing...")
df['HVACUsage'] = df['HVACUsage'].map({'On': 1, 'Off': 0})
df['LightingUsage'] = df['LightingUsage'].map({'On': 1, 'Off': 0})
df['Holiday'] = df['Holiday'].map({'Yes': 1, 'No': 0})

df['hour'] = df['Timestamp'].dt.hour
df['weekday'] = df['Timestamp'].dt.weekday
df['month'] = df['Timestamp'].dt.month
df['is_day'] = df['hour'].apply(lambda x: 1 if 6 <= x < 18 else 0)

# Feature Engineering (Without Leaks)
# df['energy_per_person'] = df['EnergyConsumption'] / (df['Occupancy'] + 1) # LEAK
# df['idle_energy'] = df['EnergyConsumption'] * (1 - df['Occupancy']) # LEAK
df['temp_hvac_interaction'] = df['Temperature'] * df['HVACUsage']
df['humidity_hvac_interaction'] = df['Humidity'] * df['HVACUsage']

# Rolling means require history which we might not have at inference time easily.
# For a simple "Predict" button, we rely on instant features.
# If we want to keep them, we need inputs for them. 
# Decision: Remove rolling/lag features for simpler inference, or keep them if we assume time-series context.
# Given the user wants to use it in UI, likely point-prediction.
# But original model had high accuracy due to these. Removing them might drop accuracy.
# However, `idle_energy` was the big cheat.
# Let's keep interactions and basic features.

selected_features = [
    'Temperature', 'Humidity', 'SquareFootage', 'Occupancy',
    'HVACUsage', 'LightingUsage', 'RenewableEnergy',
    'DayOfWeek', 'Holiday', 'hour', 'weekday', 'month', 'is_day',
    'temp_hvac_interaction', 'humidity_hvac_interaction'
]

# One-hot encode DayOfWeek if needed, or let LGBM handle category.
# Original notebook didn't one-hot, it let object? No, it used correlations.
# 'DayOfWeek' is object. LightGBM can handle it if type is category.
df['DayOfWeek'] = df['DayOfWeek'].astype('category')

print(f"Selected features: {selected_features}")

X = df[selected_features]
y = df['EnergyConsumption']

split = int(len(df) * 0.8)
X_train = X.iloc[:split]
X_test  = X.iloc[split:]
y_train = y.iloc[:split]
y_test  = y.iloc[split:]

print("Training LightGBM...")
lgb_model = lgb.LGBMRegressor(
    n_estimators=1000,
    learning_rate=0.05,
    max_depth=6,
    num_leaves=31,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42
)

lgb_model.fit(X_train, y_train)

# Evaluate
y_pred = lgb_model.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)
print(f"LightGBM MAE: {mae}")

print(f"Saving model to {clean_model_path}...")
joblib.dump(lgb_model, clean_model_path)
print("Done.")
