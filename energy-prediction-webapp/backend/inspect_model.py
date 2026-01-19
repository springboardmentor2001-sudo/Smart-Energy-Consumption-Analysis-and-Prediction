import joblib
import os

model_path = r'C:\Users\Pranjal Giri\OneDrive\Desktop\Infosys springboard\energy-prediction-webapp\backend\energy_model.pkl'
if os.path.exists(model_path):
    model = joblib.load(model_path)
    print(f'Model type: {type(model)}')
    print(f'Model class: {model.__class__.__name__}')
    print(f'Has predict: {hasattr(model, "predict")}')
    if isinstance(model, dict):
        print(f'Dict keys: {list(model.keys())}')
        for key in model.keys():
            obj = model[key]
            print(f'  {key}: {type(obj).__name__}, has_predict={hasattr(obj, "predict")}')
    else:
        print(f'Dir model: {[attr for attr in dir(model) if not attr.startswith("_")][:15]}')
else:
    print(f'Model file not found at {model_path}')
