import pandas as pd
import pickle
from xgboost import XGBRegressor
from sklearn.model_selection import train_test_split

# ================================
# 1. LOAD DATA
# ================================
df = pd.read_csv("Energy_consumption.csv")

# ================================
# 2. TIME FEATURE ENGINEERING
# ================================
# Convert Timestamp
df["Timestamp"] = pd.to_datetime(df["Timestamp"])

# Derive frontend-compatible features
df["Hour"] = df["Timestamp"].dt.hour
df["IsWeekend"] = df["Timestamp"].dt.weekday.apply(lambda x: 1 if x >= 5 else 0)

# ================================
# 3. FIX DATA TYPES (CRITICAL)
# ================================
# HVACUsage may be object/string → convert safely
df["HVACUsage"] = (
    df["HVACUsage"]
    .astype(str)
    .str.lower()
    .map({"on": 1, "off": 0, "1": 1, "0": 0})
)

# Ensure numeric columns
numeric_cols = [
    "HVACUsage",
    "Occupancy",
    "Temperature",
    "RenewableEnergy",
    "Hour",
    "IsWeekend",
    "EnergyConsumption"
]

df = df[numeric_cols].dropna()
df[numeric_cols] = df[numeric_cols].astype(float)

# ================================
# 4. SELECT FEATURES (MATCH FRONTEND EXACTLY)
# ================================
X = df[
    [
        "HVACUsage",
        "Occupancy",
        "Temperature",
        "RenewableEnergy",
        "Hour",
        "IsWeekend"
    ]
]

y = df["EnergyConsumption"]

# ================================
# 5. TRAIN / TEST SPLIT
# ================================
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# ================================
# 6. TRAIN XGBOOST MODEL
# ================================
model = XGBRegressor(
    n_estimators=400,
    learning_rate=0.05,
    max_depth=4,
    subsample=0.8,
    colsample_bytree=0.8,
    objective="reg:squarederror",
    random_state=42
)

model.fit(X_train, y_train)

# ================================
# 7. SAVE MODEL
# ================================
with open("model/energy_xgb_model.pkl", "wb") as f:
    pickle.dump(model, f)

print("✅ Model trained successfully")
print("✅ Features used (frontend-compatible):")
print("   HVACUsage, Occupancy, Temperature, RenewableEnergy, Hour, IsWeekend") 


# ================================
# 8. SAVE FEATURE IMPORTANCE
# ================================
import json

feature_importance = dict(
    zip(
        [
            "HVACUsage",
            "Occupancy",
            "Temperature",
            "RenewableEnergy",
            "Hour",
            "IsWeekend"
        ],
        model.feature_importances_.tolist()
    )
)

with open("model/feature_importance.json", "w") as f:
    json.dump(feature_importance, f, indent=4)
