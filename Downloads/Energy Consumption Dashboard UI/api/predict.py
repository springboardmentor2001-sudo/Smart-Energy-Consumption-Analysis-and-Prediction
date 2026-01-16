import pickle
import numpy as np
from datetime import datetime
import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
import math

# Initialize Flask app for Vercel
app = Flask(__name__)
CORS(app, origins=['https://smartenergy-dashboard.vercel.app', 'http://localhost:5173'])

# Global model variable
MODEL_PATH = 'random_forest_model.pkl'
model = None

# Load model on startup
def load_model():
    global model
    try:
        with open(MODEL_PATH, 'rb') as f:
            model_data = pickle.load(f)

        if isinstance(model_data, dict) and 'model' in model_data:
            model = model_data['model']
        else:
            model = model_data
        print(f"Model loaded successfully from {MODEL_PATH}")
        return True
    except Exception as e:
        print(f"Error loading model: {e}")
        return False

# Load model
model_loaded = load_model()

def transform_features_for_prediction(features):
    """Transform raw input features into the format expected by the model"""
    import math

    temperature = features.get('temperature', 22.0)
    humidity = features.get('humidity', 60.0)
    renewable = features.get('renewable', 0.0)
    hour = features.get('hour', 12)
    day_of_week = features.get('day_of_week', 1)
    month = features.get('month', 6)
    is_weekend = features.get('is_weekend', 0)
    is_business_hour = features.get('is_business_hour', 1)

    # Simplified lag features
    base_consumption = 50.0
    hour_multiplier = 1.0 + 0.3 * math.sin(2 * math.pi * (hour - 6) / 12)
    weekend_multiplier = 1.2 if is_weekend else 1.0
    business_multiplier = 1.1 if is_business_hour else 0.8

    consumption_lag_1h = base_consumption * hour_multiplier * weekend_multiplier * business_multiplier
    consumption_lag_24h = consumption_lag_1h * 0.95
    consumption_lag_168h = consumption_lag_1h * 0.9

    temperature_rolling_24h = temperature
    humidity_rolling_24h = humidity

    # Cyclical encodings
    hour_sin = math.sin(2 * math.pi * hour / 24)
    hour_cos = math.cos(2 * math.pi * hour / 24)
    day_sin = math.sin(2 * math.pi * day_of_week / 7)
    day_cos = math.cos(2 * math.pi * day_of_week / 7)
    month_sin = math.sin(2 * math.pi * month / 12)
    month_cos = math.cos(2 * math.pi * month / 12)

    avg_consumption_same_hour = base_consumption * hour_multiplier
    avg_consumption_same_day = base_consumption * weekend_multiplier

    return [
        consumption_lag_1h, consumption_lag_24h, consumption_lag_168h,
        temperature_rolling_24h, humidity_rolling_24h,
        hour_sin, hour_cos, day_sin, day_cos, month_sin, month_cos,
        avg_consumption_same_hour, avg_consumption_same_day,
        is_weekend, is_business_hour, renewable
    ]

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/predict', methods=['POST'])
def predict():
    """Prediction endpoint"""
    if model is None:
        return jsonify({'success': False, 'error': 'Model not loaded'}), 503

    try:
        data = request.get_json()
        if not data or 'features' not in data:
            return jsonify({'success': False, 'error': 'Invalid request'}), 400

        features_list = data['features']
        predictions = []

        for idx, features in enumerate(features_list):
            feature_values = transform_features_for_prediction(features)
            X = np.array([feature_values])
            prediction = model.predict(X)[0]

            predictions.append({
                'index': idx,
                'predicted': float(prediction),
                'timestamp': features.get('timestamp')
            })

        return jsonify({
            'success': True,
            'predictions': predictions
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# For Vercel serverless
def handler(event, context):
    """Vercel serverless handler"""
    from flask import Request
    from werkzeug.test import EnvironBuilder

    # Convert Vercel event to Flask request
    if 'body' in event:
        environ = EnvironBuilder(
            method=event.get('httpMethod', 'GET'),
            url=event.get('path', '/'),
            headers=event.get('headers', {}),
            data=json.dumps(event.get('body', {})) if isinstance(event.get('body'), dict) else event.get('body', '')
        ).get_environ()
    else:
        environ = EnvironBuilder(
            method=event.get('httpMethod', 'GET'),
            url=event.get('path', '/'),
            headers=event.get('headers', {})
        ).get_environ()

    # Create Flask request context
    with app.request_context(environ):
        try:
            response = app.full_dispatch_request()
            return {
                'statusCode': response.status_code,
                'headers': dict(response.headers),
                'body': response.get_data(as_text=True)
            }
        except Exception as e:
            return {
                'statusCode': 500,
                'body': json.dumps({'error': str(e)})
            }