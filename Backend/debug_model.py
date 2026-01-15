import joblib
import pandas as pd
import os
import numpy as np

# Path to model
MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'Models', 'lgb_model_clean.pkl')

try:
    if not os.path.exists(MODEL_PATH):
        print(f"Model file not found at {MODEL_PATH}")
        exit(1)
        
    model = joblib.load(MODEL_PATH)
    print("Model loaded successfully.")
    
    # Introspect model
    if hasattr(model, 'feature_name_'):
        print("Feature names:", model.feature_name_)
    elif hasattr(model, 'get_booster'):
        print("Feature names (booster):", model.get_booster().feature_names)
    else:
        print("Could not directly retrieve feature names.")
        
    # Try to predict with a dummy row to test categorization
    print("\nTesting prediction with dummy data...")
    days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    
    # Create a dummy dataframe with correct schema
    data = {
        'Temperature': [25.0],
        'Humidity': [50.0],
        'SquareFootage': [1500.0],
        'Occupancy': [2],
        'HVACUsage': [1],
        'LightingUsage': [0],
        'RenewableEnergy': [0.0],
        'DayOfWeek': ['Monday'], # String for now
        'Holiday': [0],
        'hour': [12],
        'weekday': [0],
        'month': [1],
        'is_day': [1],
        'temp_hvac_interaction': [25.0],
        'humidity_hvac_interaction': [50.0]
    }
    df = pd.DataFrame(data)
    
    # Test 1: With simpleastype('category')
    print("\nTest 1: Simple astype('category')")
    try:
        df1 = df.copy()
        df1['DayOfWeek'] = df1['DayOfWeek'].astype('category')
        model.predict(df1)
        print("SUCCESS")
    except Exception as e:
        print(f"FAILED: {e}")

    # Test 2: With explicit categories
    print("\nTest 2: Explicit Categorical with all days")
    try:
        df2 = df.copy()
        df2['DayOfWeek'] = pd.Categorical(df2['DayOfWeek'], categories=days)
        model.predict(df2)
        print("SUCCESS")
    except Exception as e:
        print(f"FAILED: {e}")
        
except Exception as e:
    print(f"An unexpected error occurred: {e}")
