import joblib
import os

model_path = r'd:\AI and ML\Infosys\Smart-Energy-Consumption-Analysis-and-Prediction\Models\lgb_model.pkl'

try:
    print(f"File size: {os.path.getsize(model_path)} bytes")
    model = joblib.load(model_path)
    print(f"Model loaded with joblib: {type(model)}")
    if hasattr(model, 'feature_name_'):
        print(f"Feature names: {model.feature_name_}")
    elif hasattr(model, 'booster_'):
        print(f"Feature names: {model.booster_.feature_name()}")
except Exception as e:
    print(f"Error loading with joblib: {e}")
