# SmartEnergy Model Integration Guide

## 🎯 Overview

This guide explains how to integrate the SmartEnergy ML model into your application.

## 📊 Model Specifications

### Input Features (8 features)
```python
features = [
    'temperature',    # float: -50 to 60 (°C)
    'humidity',       # float: 0 to 100 (%)
    'occupancy',      # int: 0 to 10000 (persons)
    'renewable',      # float: 0 to 100 (%)
    'hour',           # int: 0-23
    'day_of_week',    # int: 0-6 (Monday=0)
    'month',          # int: 1-12
    'is_weekend'      # int: 0 or 1
]
```

### Output
- **Type**: float
- **Unit**: kWh (kilowatt-hours)
- **Range**: 0 to ~500 kWh

## 🔧 Integration Steps

### 1. Load the Model

```python
import pickle

# Load model
with open('random_forest_model.pkl', 'rb') as f:
    model = pickle.load(f)

print(f"Model loaded: {type(model).__name__}")
```

### 2. Prepare Input Data

```python
import numpy as np
from datetime import datetime

def prepare_features(timestamp, temperature, humidity, occupancy, renewable):
    """
    Prepare features for prediction

    Args:
        timestamp: ISO format string or datetime
        temperature: float (°C)
        humidity: float (%)
        occupancy: int (persons)
        renewable: float (%)
    """

    if isinstance(timestamp, str):
        dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
    else:
        dt = timestamp

    features = np.array([[
        temperature,
        humidity,
        occupancy,
        renewable,
        dt.hour,           # hour
        dt.weekday(),      # day_of_week (0=Monday)
        dt.month,          # month
        1 if dt.weekday() >= 5 else 0  # is_weekend
    ]])

    return features
```

### 3. Make Predictions

```python
# Single prediction
features = prepare_features(
    timestamp="2024-01-15T14:30:00",
    temperature=22.5,
    humidity=65.0,
    occupancy=150,
    renewable=45.0
)

prediction = model.predict(features)[0]
print(f"Predicted consumption: {prediction:.2f} kWh")
```

### 4. Batch Predictions

```python
# Multiple predictions
batch_data = [
    prepare_features("2024-01-15T09:00:00", 20.0, 60.0, 50, 30.0),
    prepare_features("2024-01-15T14:00:00", 25.0, 55.0, 200, 50.0),
    prepare_features("2024-01-15T19:00:00", 18.0, 70.0, 100, 40.0),
]

predictions = model.predict(np.vstack(batch_data))
for i, pred in enumerate(predictions):
    print(f"Prediction {i+1}: {pred:.2f} kWh")
```

## 🌐 API Integration

### Using Python Requests

```python
import requests

url = "http://localhost:5000/api/predict"

data = {
    "features": [{
        "timestamp": "2024-01-15T14:30:00",
        "temperature": 22.5,
        "humidity": 65.0,
        "occupancy": 150,
        "renewable": 45.0
    }],
    "include_confidence": True
}

response = requests.post(url, json=data)
result = response.json()

print(f"Prediction: {result['predictions'][0]:.2f} kWh")
if 'confidence_bounds' in result:
    print(f"Confidence: {result['confidence_bounds']['lower_bound']:.2f} - {result['confidence_bounds']['upper_bound']:.2f}")
```

### Using JavaScript/Fetch

```javascript
const predictionData = {
    features: [{
        timestamp: "2024-01-15T14:30:00",
        temperature: 22.5,
        humidity: 65.0,
        occupancy: 150,
        renewable: 45.0
    }],
    include_confidence: true
};

fetch('/api/predict', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(predictionData)
})
.then(response => response.json())
.then(data => {
    console.log('Prediction:', data.predictions[0]);
    if (data.confidence_bounds) {
        console.log('Confidence:', data.confidence_bounds);
    }
});
```

## ⚠️ Error Handling

### Input Validation

```python
def validate_input(temperature, humidity, occupancy, renewable):
    """Validate input ranges"""
    errors = []

    if not (-50 <= temperature <= 60):
        errors.append("Temperature must be between -50°C and 60°C")

    if not (0 <= humidity <= 100):
        errors.append("Humidity must be between 0% and 100%")

    if not (0 <= occupancy <= 10000):
        errors.append("Occupancy must be between 0 and 10000")

    if not (0 <= renewable <= 100):
        errors.append("Renewable must be between 0% and 100%")

    return errors
```

### API Error Handling

```python
try:
    response = requests.post(url, json=data, timeout=10)
    response.raise_for_status()
    result = response.json()
except requests.exceptions.RequestException as e:
    print(f"API request failed: {e}")
except ValueError as e:
    print(f"Invalid JSON response: {e}")
```

## 📈 Performance Optimization

### 1. Batch Processing
Process multiple predictions in a single API call for better performance.

### 2. Caching
Cache predictions for similar inputs to reduce computation.

### 3. Async Processing
Use async/await for non-blocking predictions in web applications.

### 4. Model Warm-up
Load model on application startup to avoid first-request delays.

## 🔍 Model Interpretability

### Feature Importance

```python
# Get feature importance
importance = model.feature_importances_
feature_names = ['temperature', 'humidity', 'occupancy', 'renewable',
                 'hour', 'day_of_week', 'month', 'is_weekend']

# Sort by importance
sorted_idx = importance.argsort()[::-1]
for idx in sorted_idx:
    print(f"{feature_names[idx]}: {importance[idx]:.4f}")
```

### Partial Dependence
Analyze how each feature affects predictions.

## 🚀 Production Deployment

### Environment Variables
```bash
export MODEL_PATH="random_forest_model.pkl"
export PORT=5000
export DEBUG=False
export CORS_ORIGINS="https://yourdomain.com"
```

### Health Checks
```bash
# Check if model is loaded
curl http://localhost:5000/api/health

# Check model info
curl http://localhost:5000/api/model-info
```

### Monitoring
- Track prediction latency
- Monitor error rates
- Log unusual predictions
- Set up alerts for model performance degradation

## 🧪 Testing

### Unit Tests
```python
def test_prediction():
    # Test normal case
    features = prepare_features("2024-01-15T12:00:00", 22, 60, 100, 40)
    pred = model.predict(features)[0]
    assert pred > 0, "Prediction should be positive"
    assert pred < 1000, "Prediction should be reasonable"
```

### Integration Tests
```python
def test_api_integration():
    data = {"features": [{"timestamp": "2024-01-15T12:00:00", "temperature": 22}]}
    response = requests.post("http://localhost:5000/api/predict", json=data)
    assert response.status_code == 200
    result = response.json()
    assert "predictions" in result
```

## 📚 Additional Resources

- [Scikit-learn Documentation](https://scikit-learn.org/)
- [Flask API Documentation](https://flask.palletsprojects.com/)
- [Random Forest Guide](https://scikit-learn.org/stable/modules/ensemble.html#random-forests)