import pickle
import lightgbm as lgb
import os

model_path = r'd:\AI and ML\Infosys\Smart-Energy-Consumption-Analysis-and-Prediction\Models\lgb_model.pkl'

try:
    with open(model_path, 'rb') as f:
        model = pickle.load(f)
    
    print(f"Model loaded successfully: {type(model)}")
    if hasattr(model, 'feature_name_'):
        print(f"Feature names: {model.feature_name_}")
    else:
        print("Model does not have 'feature_name_' attribute.")

except Exception as e:
    print(f"Error loading model: {e}")
