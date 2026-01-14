import pandas as pd
import numpy as np

def calculate_heuristic_baseline(data):
    base = data['SquareFootage'] * 0.03
    hvac = 25.0 if data['HVACUsage'] == 'On' else 0.0
    occ = data['Occupancy'] * 2.0
    light = 5.0 if data['LightingUsage'] == 'On' else 0.0
    return base + hvac + occ + light


def preprocess_input(data, feature_cols):
    df = pd.DataFrame([data])

    df['Timestamp'] = pd.to_datetime(df['Timestamp'])
    df['Hour'] = df['Timestamp'].dt.hour
    df['Month'] = df['Timestamp'].dt.month
    day_name = df['Timestamp'].dt.day_name()[0]

    baseline = calculate_heuristic_baseline(data)

    df["LightingUsage"] = df["LightingUsage"].map({"On": 1, "Off": 0})
    df["Holiday"] = df["Holiday"].map({"Yes": 1, "No": 0})
    df["HVACUsage_bin"] = df["HVACUsage"].map({"On": 1, "Off": 0})

    df["Temp_HVAC_Interaction"] = df["Temperature"] * df["HVACUsage_bin"]
    df["Humidity_HVAC_Interaction"] = df["Humidity"] * df["HVACUsage_bin"]

    df["Is_Peak_Hour"] = ((df['Hour'] >= 18) & (df['Hour'] <= 22)).astype(int)
    df["Energy_per_Person"] = baseline / (df["Occupancy"] + 1)
    df["Idle_Energy"] = np.where(df["Occupancy"] == 0, baseline, 0)
    df["Energy_per_SqFt"] = baseline / df["SquareFootage"]
    df["Renewable_Ratio"] = df["RenewableEnergy"] / (baseline + 1)

    df["Energy_Lag_1"] = baseline
    df["Energy_Lag_3"] = baseline * 0.95
    df["Energy_Rolling_Mean_3"] = baseline
    df["Energy_Rolling_Std_3"] = baseline * 0.1

    for col in feature_cols:
        if "DayOfWeek_" in col:
            df[col] = 1 if day_name in col else 0

    final = {c: df[c].iloc[0] if c in df else 0.0 for c in feature_cols}
    return pd.DataFrame([final]).astype(float)
