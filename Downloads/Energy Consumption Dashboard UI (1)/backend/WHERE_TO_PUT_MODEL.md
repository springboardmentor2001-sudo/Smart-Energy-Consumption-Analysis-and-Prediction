# Where to Put the SmartEnergy ML Model

## 📍 Model File Location

The ML model file (`random_forest_model.pkl`) should be placed in the `backend/` directory alongside the main application files.

### Correct Structure
```
backend/
├── app.py
├── config.py
├── random_forest_model.pkl  ← Model goes here
├── requirements.txt
└── ...
```

## 🚀 How to Get the Model File

### Option 1: Train Your Own Model
```bash
cd backend
python train_model.py
```
This will generate `random_forest_model.pkl` with synthetic training data.

### Option 2: Use Existing Model
If you have a trained model file:
1. Copy `random_forest_model.pkl` to the `backend/` directory
2. Ensure it's compatible with the expected feature format

### Option 3: Download from Repository
If the model is stored in your Git repository:
```bash
git pull  # Pull latest changes including model file
```

## 🔍 Model Requirements

### Expected Features (8 features in order):
1. `temperature` (float: -50 to 60)
2. `humidity` (float: 0 to 100)
3. `occupancy` (int: 0 to 10000)
4. `renewable` (float: 0 to 100)
5. `hour` (int: 0-23)
6. `day_of_week` (int: 0-6, Monday=0)
7. `month` (int: 1-12)
8. `is_weekend` (int: 0 or 1)

### Model Type
- **Algorithm**: RandomForestRegressor (scikit-learn)
- **Input**: NumPy array of shape (n_samples, 8)
- **Output**: Array of predicted energy consumption (kWh)

## ⚠️ Important Notes

### File Size
- Model file is approximately 100MB
- Ensure your deployment platform supports this size
- Git LFS may be needed for large model files

### Version Compatibility
- Model trained with scikit-learn 1.5.0
- Ensure deployment environment has compatible version
- Check with: `python -c "import sklearn; print(sklearn.__version__)"`

### Security
- Model files contain pickled Python objects
- Only load models from trusted sources
- Consider model signing/verification in production

## 🧪 Verification

After placing the model file, verify it works:

```bash
# Check setup
python check_setup.py

# Inspect model
python inspect_model.py

# Test predictions
python test_model.py

# Start server
python app.py
```

## 🚢 Deployment Considerations

### Railway Deployment
- Model file is automatically included when pushed to Git
- Ensure `backend/` directory is the root for Railway deployment
- Check Railway logs for model loading errors

### Local Development
- Model file should be in same directory as `app.py`
- Add to `.gitignore` if you don't want to commit large model files
- Use `MODEL_PATH` environment variable to specify custom location

### Production Tips
- Load model once on startup (not per request)
- Implement model health checks
- Monitor prediction performance
- Have backup model loading strategy

## 🔧 Troubleshooting

### Model Not Found Error
```
FileNotFoundError: [Errno 2] No such file or directory: 'random_forest_model.pkl'
```
**Solution**: Ensure model file is in `backend/` directory

### Model Loading Error
```
ModuleNotFoundError: No module named 'sklearn'
```
**Solution**: Install dependencies with `pip install -r requirements.txt`

### Incompatible Model
```
ValueError: X has 8 features, but RandomForestRegressor is expecting 10 features
```
**Solution**: Retrain model or check feature engineering

## 📞 Support

If you encounter issues:
1. Run `python check_setup.py` to diagnose problems
2. Check that model file exists: `ls -la random_forest_model.pkl`
3. Verify model compatibility: `python inspect_model.py`
4. Test basic functionality: `python test_model.py`