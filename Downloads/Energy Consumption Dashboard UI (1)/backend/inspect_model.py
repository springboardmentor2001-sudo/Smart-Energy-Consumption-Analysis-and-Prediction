"""
SmartEnergy Model Inspector
Analyze and inspect the trained ML model
"""

import pickle
import numpy as np
from pathlib import Path

def load_model():
    """Load the ML model"""
    model_path = Path(__file__).parent / 'random_forest_model.pkl'
    with open(model_path, 'rb') as f:
        model = pickle.load(f)
    return model

def inspect_model():
    """Inspect model properties"""
    print("=" * 60)
    print("🔍 SmartEnergy ML Model Inspector")
    print("=" * 60)

    try:
        model = load_model()

        print(f"\n🤖 Model Type: {type(model).__name__}")

        # Random Forest specific properties
        if hasattr(model, 'n_estimators'):
            print(f"🌳 Number of Trees: {model.n_estimators}")

        if hasattr(model, 'max_depth'):
            print(f"📏 Max Depth: {model.max_depth}")

        if hasattr(model, 'n_features_in_'):
            print(f"📊 Number of Features: {model.n_features_in_}")

        if hasattr(model, 'feature_names_in_'):
            print("📋 Feature Names:"            for i, name in enumerate(model.feature_names_in_):
                print(f"   {i+1}. {name}")

        if hasattr(model, 'feature_importances_'):
            print("\n🎯 Feature Importances:")
            if hasattr(model, 'feature_names_in_'):
                features = model.feature_names_in_
            else:
                features = [f'feature_{i}' for i in range(model.n_features_in_)]

            # Sort by importance
            indices = np.argsort(model.feature_importances_)[::-1]
            for i, idx in enumerate(indices):
                importance = model.feature_importances_[idx]
                print(".4f"
        # Model performance metrics (if available)
        if hasattr(model, 'score'):
            print("
📈 Model Score: Available (call model.score(X, y) with data)"        # Model size
        import os
        model_size = os.path.getsize('random_forest_model.pkl')
        print(f"\n💾 Model File Size: {model_size:,} bytes ({model_size/1024/1024:.2f} MB)")

        print("\n✅ Model inspection complete!")

    except Exception as e:
        print(f"❌ Error inspecting model: {str(e)}")

def test_prediction():
    """Test model with sample data"""
    print("\n🧪 Testing model prediction...")

    try:
        model = load_model()

        # Sample input data
        sample_data = np.array([[
            22.5,  # temperature
            65.0,  # humidity
            150,   # occupancy
            45.0,  # renewable
            14,    # hour
            1,     # day_of_week (Monday)
            6,     # month (June)
            0      # is_weekend
        ]])

        prediction = model.predict(sample_data)
        print(".2f"
        # Test with multiple samples
        test_samples = np.array([
            [22.5, 65.0, 150, 45.0, 14, 1, 6, 0],  # Normal day
            [15.0, 80.0, 50, 20.0, 2, 5, 1, 1],   # Cold weekend night
            [30.0, 40.0, 300, 80.0, 12, 2, 7, 0],  # Hot summer day
        ])

        predictions = model.predict(test_samples)
        print("\n📊 Multiple predictions:")
        for i, pred in enumerate(predictions):
            print(".2f"
    except Exception as e:
        print(f"❌ Error testing prediction: {str(e)}")

if __name__ == '__main__':
    inspect_model()
    test_prediction()