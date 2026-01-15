"""
SmartEnergy Backend Setup Checker
Verifies all dependencies and configurations are properly set up
"""

import sys
import os
import importlib
import pickle
from pathlib import Path

def check_python_version():
    """Check Python version compatibility"""
    print("🐍 Checking Python version...")
    version = sys.version_info
    if version.major == 3 and version.minor >= 8:
        print(f"✅ Python {version.major}.{version.minor}.{version.micro} - OK")
        return True
    else:
        print(f"❌ Python {version.major}.{version.minor}.{version.micro} - Requires Python 3.8+")
        return False

def check_dependencies():
    """Check if all required packages are installed"""
    print("\n📦 Checking dependencies...")

    required_packages = [
        'flask', 'flask_cors', 'flask_limiter',
        'pandas', 'numpy', 'scikit-learn', 'pickle'
    ]

    missing_packages = []

    for package in required_packages:
        try:
            if package == 'scikit-learn':
                import sklearn
                print(f"✅ scikit-learn {sklearn.__version__} - OK")
            elif package == 'pickle':
                import pickle
                print("✅ pickle - OK (built-in)")
            else:
                module = importlib.import_module(package.replace('_', '-'))
                version = getattr(module, '__version__', 'unknown')
                print(f"✅ {package} {version} - OK")
        except ImportError:
            missing_packages.append(package)
            print(f"❌ {package} - MISSING")

    return len(missing_packages) == 0, missing_packages

def check_model_file():
    """Check if ML model file exists and is loadable"""
    print("\n🤖 Checking ML model...")

    model_path = Path(__file__).parent / 'random_forest_model.pkl'

    if not model_path.exists():
        print(f"❌ Model file not found: {model_path}")
        return False

    try:
        with open(model_path, 'rb') as f:
            model = pickle.load(f)

        print(f"✅ Model loaded successfully: {type(model).__name__}")

        if hasattr(model, 'n_features_in_'):
            print(f"   Features: {model.n_features_in_}")

        return True
    except Exception as e:
        print(f"❌ Failed to load model: {str(e)}")
        return False

def check_environment_variables():
    """Check important environment variables"""
    print("\n🔧 Checking environment variables...")

    important_vars = ['PORT', 'DEBUG', 'CORS_ORIGINS']
    optional_vars = ['MODEL_PATH', 'VALIDATION_STRICT']

    for var in important_vars:
        value = os.getenv(var)
        if value:
            print(f"✅ {var} = {value}")
        else:
            print(f"⚠️  {var} not set (will use default)")

    for var in optional_vars:
        value = os.getenv(var)
        if value:
            print(f"✅ {var} = {value}")

def check_file_structure():
    """Check if all required files exist"""
    print("\n📁 Checking file structure...")

    required_files = [
        'app.py',
        'config.py',
        'requirements.txt',
        'Procfile',
        'random_forest_model.pkl'
    ]

    backend_dir = Path(__file__).parent
    missing_files = []

    for file in required_files:
        if (backend_dir / file).exists():
            print(f"✅ {file} - exists")
        else:
            print(f"❌ {file} - MISSING")
            missing_files.append(file)

    return len(missing_files) == 0, missing_files

def main():
    """Run all setup checks"""
    print("=" * 60)
    print("🔍 SmartEnergy Backend Setup Checker")
    print("=" * 60)

    checks = [
        ("Python Version", check_python_version),
        ("Dependencies", lambda: check_dependencies()[0]),
        ("Model File", check_model_file),
        ("File Structure", lambda: check_file_structure()[0]),
    ]

    all_passed = True

    for check_name, check_func in checks:
        try:
            result = check_func()
            if not result:
                all_passed = False
        except Exception as e:
            print(f"❌ {check_name} - ERROR: {str(e)}")
            all_passed = False

    check_environment_variables()

    print("\n" + "=" * 60)
    if all_passed:
        print("🎉 All checks passed! Backend is ready to run.")
        print("\nTo start the server:")
        print("  python app.py")
        print("\nTo test the API:")
        print("  curl http://localhost:5000/api/health")
    else:
        print("❌ Some checks failed. Please fix the issues above.")
        print("\nCommon fixes:")
        print("  pip install -r requirements.txt")
        print("  python train_model.py  # if model is missing")
    print("=" * 60)

    return all_passed

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)