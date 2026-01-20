"""
Test script to verify prediction accuracy after fixes
"""

import joblib
import pandas as pd
import numpy as np

# Load the model and feature list
energy_model = joblib.load('energy_model.pkl')
model_performance = joblib.load('model_performance.pkl')

print("=" * 80)
print("MODEL PERFORMANCE METRICS")
print("=" * 80)

for model_name, metrics in model_performance.items():
    print(f"\n{model_name.upper()}:")
    print(f"  R² Score:  {metrics['R2']:.4f}")
    print(f"  RMSE:      {metrics['RMSE']:.2f} kWh")
    print(f"  MAE:       {metrics['MAE']:.2f} kWh")
    print(f"  MAPE:      {metrics['MAPE']:.4f}")
    print(f"  Accuracy:  {metrics['Accuracy']:.2f}%")

# Test predictions with realistic scenarios
test_cases = [
    {
        'name': 'Winter Day - Cold House',
        'data': {
            'temperature': 0,
            'humidity': 40,
            'square_footage': 3000,
            'month': 1,
            'hvac_appliances': 2,
            'hvac_type': 'central-ac',
            'season': 'winter',
            'time': 12
        }
    },
    {
        'name': 'Summer Day - Hot House',
        'data': {
            'temperature': 35,
            'humidity': 60,
            'square_footage': 4000,
            'month': 7,
            'hvac_appliances': 3,
            'hvac_type': 'central-ac',
            'season': 'summer',
            'time': 14
        }
    },
    {
        'name': 'Spring Day - Mild',
        'data': {
            'temperature': 15,
            'humidity': 55,
            'square_footage': 2500,
            'month': 4,
            'hvac_appliances': 1,
            'hvac_type': 'heat-pump',
            'season': 'spring',
            'time': 10
        }
    },
    {
        'name': 'Fall Night - Cool',
        'data': {
            'temperature': 10,
            'humidity': 65,
            'square_footage': 3500,
            'month': 10,
            'hvac_appliances': 2,
            'hvac_type': 'heat-pump',
            'season': 'fall',
            'time': 22
        }
    }
]

def engineer_features_for_test(input_data):
    """Feature engineering matching the fixed version in app.py (28 features)"""
    features = {}
    
    temperature = float(input_data.get('temperature', 20))
    humidity = float(input_data.get('humidity', 50))
    square_footage = float(input_data.get('square_footage', 5000))
    month = int(input_data.get('month', 1))
    hvac_appliances = int(input_data.get('hvac_appliances', 1))
    time_of_day = int(input_data.get('time', 12))
    
    # Basic features
    features['Temperature'] = temperature
    features['Humidity'] = humidity
    features['SquareFootage'] = square_footage
    features['Month'] = month
    features['Hour'] = time_of_day
    features['HVAC_Appliances'] = hvac_appliances
    
    # Temporal features
    features['Month_sin'] = np.sin(2 * np.pi * month / 12)
    features['Month_cos'] = np.cos(2 * np.pi * month / 12)
    features['Hour_sin'] = np.sin(2 * np.pi * time_of_day / 24)
    features['Hour_cos'] = np.cos(2 * np.pi * time_of_day / 24)
    
    # Degree days (base 18C and 22C - matches training)
    hdd = max(0, 18 - temperature)
    cdd = max(0, temperature - 22)
    
    features['HDD'] = hdd
    features['CDD'] = cdd
    features['HDD_Squared'] = hdd ** 2
    features['CDD_Squared'] = cdd ** 2
    
    # Interactions
    features['HDD_x_SqFt'] = hdd * (square_footage / 1000)
    features['CDD_x_SqFt'] = cdd * (square_footage / 1000)
    features['Temp_Humidity'] = temperature * humidity / 100
    features['Temp_SqFt'] = temperature * (square_footage / 5000)
    
    # Flags
    features['Heating_On'] = 1 if hdd > 0 else 0
    features['Cooling_On'] = 1 if cdd > 0 else 0
    features['Peak_Hours'] = 1 if 14 <= time_of_day <= 19 else 0
    features['Night_Hours'] = 1 if (time_of_day >= 22 or time_of_day <= 6) else 0
    
    # Derived
    features['Temp_Deviation'] = abs(temperature - 20)
    features['Humidity_Deviation'] = abs(humidity - 50)
    features['LargeBuilding'] = 1 if square_footage > 7500 else 0
    
    # Polynomial
    features['Temp_Squared'] = temperature ** 2
    features['SqFt_Squared'] = (square_footage / 1000) ** 2
    features['Humidity_Squared'] = humidity ** 2
    
    # Reorder to exact feature order (28 features)
    feature_order = [
        'Temperature', 'Humidity', 'SquareFootage', 'Month', 'Hour', 'HVAC_Appliances',
        'Month_sin', 'Month_cos', 'Hour_sin', 'Hour_cos',
        'HDD', 'CDD', 'HDD_Squared', 'CDD_Squared',
        'HDD_x_SqFt', 'CDD_x_SqFt',
        'Temp_Humidity', 'Temp_SqFt',
        'Heating_On', 'Cooling_On', 'Peak_Hours', 'Night_Hours',
        'Temp_Deviation', 'Humidity_Deviation', 'LargeBuilding',
        'Temp_Squared', 'SqFt_Squared', 'Humidity_Squared'
    ]
    
    ordered_features = {k: features[k] for k in feature_order if k in features}
    df = pd.DataFrame([ordered_features])
    
    return df

print("\n" + "=" * 80)
print("PREDICTION TESTS")
print("=" * 80)

for test in test_cases:
    print(f"\n{test['name']}:")
    print(f"  Input: {test['data']}")
    
    features_df = engineer_features_for_test(test['data'])
    prediction = energy_model.predict(features_df)[0]
    
    print(f"  ✓ Predicted Energy Consumption: {prediction:.2f} kWh")
    
    # Provide confidence assessment
    if prediction < 500:
        confidence = 'Low consumption - efficient'
    elif prediction > 1500:
        confidence = 'High consumption - consider optimization'
    else:
        confidence = 'Normal consumption'
    
    print(f"  → {confidence}")

print("\n" + "=" * 80)
print("✓ PREDICTION TESTS COMPLETE")
print("=" * 80)
