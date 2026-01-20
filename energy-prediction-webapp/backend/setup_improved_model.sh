#!/bin/bash
# Quick setup script for improved energy prediction model

echo "=========================================="
echo "Energy Prediction - Model Setup"
echo "=========================================="

cd backend

echo ""
echo "[STEP 1] Installing dependencies..."
pip install -q xgboost>=2.0.0 catboost>=1.2.0
pip install -q -r requirements.txt

echo "[OK] Dependencies installed"

echo ""
echo "[STEP 2] Training improved model..."
python train_improved_model.py

echo ""
echo "[STEP 3] Checking generated files..."
if [ -f "energy_model.pkl" ]; then
    echo "[OK] energy_model.pkl - $(wc -c < energy_model.pkl | numfmt --to=iec-i --suffix=B) created"
fi

if [ -f "feature_scaler.pkl" ]; then
    echo "[OK] feature_scaler.pkl created"
fi

if [ -f "model_performance.pkl" ]; then
    echo "[OK] model_performance.pkl created"
fi

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "To start the server:"
echo "  python app.py"
echo ""
echo "The model will be automatically loaded on startup."
echo "Test predictions at: http://localhost:5000/api/health"
