@echo off
REM Quick setup script for improved energy prediction model (Windows)

echo ==========================================
echo Energy Prediction - Model Setup (Windows)
echo ==========================================

cd backend

echo.
echo [STEP 1] Installing dependencies...
pip install -q xgboost>=2.0.0 catboost>=1.2.0
pip install -q -r requirements.txt

echo [OK] Dependencies installed

echo.
echo [STEP 2] Training improved model...
python train_improved_model.py

echo.
echo [STEP 3] Checking generated files...

if exist "energy_model.pkl" (
    echo [OK] energy_model.pkl created
)

if exist "feature_scaler.pkl" (
    echo [OK] feature_scaler.pkl created
)

if exist "model_performance.pkl" (
    echo [OK] model_performance.pkl created
)

echo.
echo ==========================================
echo Setup Complete!
echo ==========================================
echo.
echo To start the server:
echo   python app.py
echo.
echo The model will be automatically loaded on startup.
echo Test predictions at: http://localhost:5000/api/health
echo.
pause
