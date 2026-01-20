"""
Model Compatibility & Diagnostics Check
Run this script to verify your model and system are compatible
"""

import sys
import subprocess

def check_python_version():
    """Check Python version"""
    version = sys.version_info
    print(f"\n[1] Python Version: {version.major}.{version.minor}.{version.micro}")
    if version.major == 3 and version.minor in [10, 11]:
        print("    ✅ Compatible")
        return True
    else:
        print("    ❌ Not compatible (need Python 3.10 or 3.11)")
        return False

def check_dependencies():
    """Check if required packages are installed"""
    print(f"\n[2] Checking Dependencies:")
    
    packages = [
        'numpy',
        'pandas',
        'scikit-learn',
        'xgboost',
        'lightgbm',
        'joblib',
        'flask'
    ]
    
    all_ok = True
    for package in packages:
        try:
            __import__(package)
            # Get version
            mod = __import__(package)
            version = getattr(mod, '__version__', 'unknown')
            print(f"    ✅ {package}: {version}")
        except ImportError:
            print(f"    ❌ {package}: NOT INSTALLED")
            all_ok = False
    
    return all_ok

def check_model_file():
    """Check if model file exists and is valid"""
    print(f"\n[3] Checking Model File:")
    
    import os
    if os.path.exists('energy_model.pkl'):
        size = os.path.getsize('energy_model.pkl')
        print(f"    ✅ energy_model.pkl found ({size} bytes)")
        if size > 10000000:  # > 10MB
            print(f"    ✅ File size is reasonable")
            return True
        else:
            print(f"    ❌ File size too small (corrupted?)")
            return False
    else:
        print(f"    ❌ energy_model.pkl NOT FOUND")
        print(f"       Run: python train_improved_model.py")
        return False

def check_model_loadable():
    """Try to load the model"""
    print(f"\n[4] Testing Model Loading:")
    
    try:
        import joblib
        model = joblib.load('energy_model.pkl')
        print(f"    ✅ Model loaded successfully")
        print(f"    Type: {type(model).__name__}")
        
        # Check if it has predict method
        if hasattr(model, 'predict'):
            print(f"    ✅ Model has predict() method")
            return True
        else:
            print(f"    ❌ Model MISSING predict() method")
            print(f"       Solution: Retrain model - python train_improved_model.py")
            return False
            
    except Exception as e:
        print(f"    ❌ Failed to load model:")
        print(f"       Error: {str(e)}")
        print(f"       Solution: Retrain model - python train_improved_model.py")
        return False

def test_prediction():
    """Test making a prediction"""
    print(f"\n[5] Testing Model Prediction:")
    
    try:
        import joblib
        import pandas as pd
        import numpy as np
        
        model = joblib.load('energy_model.pkl')
        
        # Create test data
        test_data = pd.DataFrame({
            'Temperature': [20],
            'Humidity': [50],
            'SquareFootage': [5000],
            'Month': [6],
            'Hour': [12],
            'HVAC_Appliances': [1],
            'Month_sin': [np.sin(2 * np.pi * 6 / 12)],
            'Month_cos': [np.cos(2 * np.pi * 6 / 12)],
            'Hour_sin': [np.sin(2 * np.pi * 12 / 24)],
            'Hour_cos': [np.cos(2 * np.pi * 12 / 24)],
            'HDD': [0],
            'CDD': [0],
            'HDD_Squared': [0],
            'CDD_Squared': [0],
            'HDD_x_SqFt': [0],
            'CDD_x_SqFt': [0],
            'Temp_Humidity': [10],
            'Temp_SqFt': [20],
            'Heating_On': [0],
            'Cooling_On': [0],
            'Peak_Hours': [1],
            'Night_Hours': [0],
            'Temp_Deviation': [0],
            'Humidity_Deviation': [0],
            'LargeBuilding': [0],
            'Temp_Squared': [400],
            'SqFt_Squared': [25],
            'Humidity_Squared': [2500]
        })
        
        prediction = model.predict(test_data)[0]
        print(f"    ✅ Prediction successful: {prediction:.2f} kWh")
        
        if 200 <= prediction <= 1000:
            print(f"    ✅ Prediction is in valid range (200-1000 kWh)")
            return True
        else:
            print(f"    ⚠️  Prediction outside expected range: {prediction:.2f} kWh")
            print(f"       Expected range: 200-1000 kWh")
            return True  # Model still works
            
    except Exception as e:
        print(f"    ❌ Prediction failed:")
        print(f"       Error: {str(e)}")
        return False

def main():
    """Run all checks"""
    print("=" * 80)
    print("MODEL COMPATIBILITY & DIAGNOSTICS CHECK")
    print("=" * 80)
    
    checks = [
        ("Python Version", check_python_version),
        ("Dependencies", check_dependencies),
        ("Model File", check_model_file),
        ("Model Loading", check_model_loadable),
        ("Model Prediction", test_prediction),
    ]
    
    results = {}
    for name, check_func in checks:
        try:
            results[name] = check_func()
        except Exception as e:
            print(f"\n    ❌ Check failed with error: {str(e)}")
            results[name] = False
    
    # Summary
    print(f"\n" + "=" * 80)
    print("SUMMARY:")
    print("=" * 80)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{name}: {status}")
    
    print(f"\nTotal: {passed}/{total} checks passed")
    
    if passed == total:
        print("\n🎉 All checks passed! Your system is ready to use the model.")
    else:
        print("\n⚠️  Some checks failed. See messages above for solutions.")
        print("\nQuick fix: Run these commands:")
        print("  1. pip install --upgrade -r requirements.txt")
        print("  2. python train_improved_model.py")
        print("  3. python app.py")
    
    print("=" * 80)

if __name__ == '__main__':
    main()
