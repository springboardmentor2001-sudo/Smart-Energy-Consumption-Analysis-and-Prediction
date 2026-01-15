"""
SmartEnergy Model Tester
Test the ML model with various inputs and edge cases
"""

import pickle
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from pathlib import Path

def load_model():
    """Load the ML model"""
    model_path = Path(__file__).parent / 'random_forest_model.pkl'
    with open(model_path, 'rb') as f:
        model = pickle.load(f)
    return model

def test_basic_prediction():
    """Test basic prediction functionality"""
    print("🧪 Testing basic prediction...")

    model = load_model()

    # Normal case
    test_data = np.array([[
        22.5,  # temperature
        65.0,  # humidity
        150,   # occupancy
        45.0,  # renewable
        14,    # hour
        1,     # day_of_week
        6,     # month
        0      # is_weekend
    ]])

    try:
        prediction = model.predict(test_data)
        print(".2f"        return True
    except Exception as e:
        print(f"❌ Basic prediction failed: {str(e)}")
        return False

def test_edge_cases():
    """Test edge cases and boundary values"""
    print("\n🔍 Testing edge cases...")

    model = load_model()

    edge_cases = [
        # Extreme temperatures
        ([60, 50, 100, 50, 12, 2, 7, 0], "Extreme heat"),
        ([-20, 50, 100, 50, 12, 2, 1, 0], "Extreme cold"),

        # Extreme humidity
        ([22, 0, 100, 50, 12, 2, 6, 0], "Zero humidity"),
        ([22, 100, 100, 50, 12, 2, 6, 0], "Max humidity"),

        # Extreme occupancy
        ([22, 50, 0, 50, 12, 2, 6, 0], "Zero occupancy"),
        ([22, 50, 10000, 50, 12, 2, 6, 0], "Max occupancy"),

        # Extreme renewable
        ([22, 50, 100, 0, 12, 2, 6, 0], "Zero renewable"),
        ([22, 50, 100, 100, 12, 2, 6, 0], "Max renewable"),

        # Weekend vs weekday
        ([22, 50, 100, 50, 12, 5, 6, 1], "Weekend"),
        ([22, 50, 100, 50, 12, 0, 6, 0], "Weekday"),

        # Different times
        ([22, 50, 100, 50, 0, 2, 6, 0], "Midnight"),
        ([22, 50, 100, 50, 12, 2, 6, 0], "Noon"),
        ([22, 50, 100, 50, 23, 2, 6, 0], "Late night"),
    ]

    passed = 0
    total = len(edge_cases)

    for data, description in edge_cases:
        try:
            prediction = model.predict(np.array([data]))
            print(".2f"            passed += 1
        except Exception as e:
            print(f"❌ {description}: FAILED - {str(e)}")

    print(f"\n✅ Edge cases: {passed}/{total} passed")
    return passed == total

def test_batch_predictions():
    """Test batch prediction performance"""
    print("\n📊 Testing batch predictions...")

    model = load_model()

    # Generate batch data
    batch_sizes = [1, 10, 100, 1000]

    for size in batch_sizes:
        # Generate random test data
        np.random.seed(42)
        test_data = np.random.rand(size, 8) * np.array([40, 100, 1000, 100, 24, 7, 12, 2])

        try:
            predictions = model.predict(test_data)
            print(f"✅ Batch size {size}: {len(predictions)} predictions")
        except Exception as e:
            print(f"❌ Batch size {size}: FAILED - {str(e)}")
            return False

    return True

def test_feature_importance():
    """Test feature importance extraction"""
    print("\n🎯 Testing feature importance...")

    model = load_model()

    if hasattr(model, 'feature_importances_'):
        importances = model.feature_importances_
        feature_names = ['temperature', 'humidity', 'occupancy', 'renewable',
                        'hour', 'day_of_week', 'month', 'is_weekend']

        # Sort by importance
        indices = np.argsort(importances)[::-1]

        print("Feature Importances:")
        for i, idx in enumerate(indices):
            print(".4f"
        return True
    else:
        print("❌ Model does not have feature_importances_")
        return False

def run_all_tests():
    """Run all model tests"""
    print("=" * 60)
    print("🧪 SmartEnergy Model Test Suite")
    print("=" * 60)

    tests = [
        ("Basic Prediction", test_basic_prediction),
        ("Edge Cases", test_edge_cases),
        ("Batch Predictions", test_batch_predictions),
        ("Feature Importance", test_feature_importance),
    ]

    results = []
    for test_name, test_func in tests:
        print(f"\n{'='*20} {test_name} {'='*20}")
        try:
            result = test_func()
            results.append(result)
            status = "✅ PASSED" if result else "❌ FAILED"
            print(f"\n{status}: {test_name}")
        except Exception as e:
            print(f"❌ {test_name}: CRASHED - {str(e)}")
            results.append(False)

    print("\n" + "=" * 60)
    passed = sum(results)
    total = len(results)
    print(f"📊 Test Results: {passed}/{total} tests passed")

    if passed == total:
        print("🎉 All tests passed! Model is ready for production.")
    else:
        print("⚠️  Some tests failed. Please review the model.")

    print("=" * 60)
    return passed == total

if __name__ == '__main__':
    run_all_tests()