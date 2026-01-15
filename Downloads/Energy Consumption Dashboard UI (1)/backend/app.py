"""
SmartEnergy ML Prediction API - Professional Edition
Flask backend with data validation, rate limiting, and monitoring
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import pandas as pd
import numpy as np
from datetime import datetime
import os
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import logging
from functools import wraps
import time

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# CORS configuration
CORS(app, origins=["https://energy-consumption-dashboard-ui-1.vercel.app", "http://localhost:3000"])

# Rate limiting
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

# Configuration
class Config:
    MODEL_PATH = os.getenv('MODEL_PATH', 'random_forest_model.pkl')
    DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
    HOST = os.getenv('HOST', '0.0.0.0')
    PORT = int(os.getenv('PORT', 5000))
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'https://energy-consumption-dashboard-ui-1.vercel.app,http://localhost:3000').split(',')
    VALIDATION_STRICT = os.getenv('VALIDATION_STRICT', 'False').lower() == 'true'

config = Config()

# Global variables
model = None
model_info = {}
metrics = {
    'total_predictions': 0,
    'uptime_since': datetime.now().isoformat(),
    'errors': 0
}

def load_model():
    """Load the ML model from pickle file"""
    global model, model_info
    try:
        model_path = os.path.join(os.path.dirname(__file__), config.MODEL_PATH)
        with open(model_path, 'rb') as f:
            model = pickle.load(f)

        # Get model info
        model_info = {
            'model_type': type(model).__name__,
            'model_path': config.MODEL_PATH,
            'loaded': True
        }

        if hasattr(model, 'n_features_in_'):
            model_info['n_features'] = model.n_features_in_
        if hasattr(model, 'feature_names_in_'):
            model_info['feature_names'] = model.feature_names_in_.tolist()

        logger.info(f"Model loaded successfully: {model_info}")
        return True
    except Exception as e:
        logger.error(f"Failed to load model: {str(e)}")
        model_info = {'loaded': False, 'error': str(e)}
        return False

def validate_features(features, strict=True):
    """Validate input features"""
    required_features = [
        'timestamp', 'temperature', 'humidity', 'occupancy',
        'renewable', 'hour', 'day_of_week', 'month', 'is_weekend'
    ]

    validation_rules = {
        'temperature': {'min': -50, 'max': 60},
        'humidity': {'min': 0, 'max': 100},
        'occupancy': {'min': 0, 'max': 10000},
        'renewable': {'min': 0, 'max': 100}
    }

    for feature_set in features:
        # Check required features
        for req_feat in required_features:
            if req_feat not in feature_set:
                if strict:
                    raise ValueError(f"Missing required feature: {req_feat}")
                else:
                    # Add default values for missing features
                    if req_feat == 'hour':
                        feature_set[req_feat] = datetime.fromisoformat(feature_set['timestamp'].replace('Z', '+00:00')).hour
                    elif req_feat == 'day_of_week':
                        feature_set[req_feat] = datetime.fromisoformat(feature_set['timestamp'].replace('Z', '+00:00')).weekday()
                    elif req_feat == 'month':
                        feature_set[req_feat] = datetime.fromisoformat(feature_set['timestamp'].replace('Z', '+00:00')).month
                    elif req_feat == 'is_weekend':
                        feature_set[req_feat] = 1 if datetime.fromisoformat(feature_set['timestamp'].replace('Z', '+00:00')).weekday() >= 5 else 0

        # Validate ranges
        for feat, rules in validation_rules.items():
            if feat in feature_set:
                val = feature_set[feat]
                if not isinstance(val, (int, float)):
                    raise ValueError(f"Feature {feat} must be numeric")
                if val < rules['min'] or val > rules['max']:
                    if strict:
                        raise ValueError(f"Feature {feat} out of range: {val} (expected {rules['min']}-{rules['max']})")

    return True

def calculate_confidence_bounds(predictions, confidence_level=0.95):
    """Calculate confidence bounds for predictions"""
    pred_array = np.array(predictions)
    std = np.std(pred_array)
    mean = np.mean(pred_array)

    # Simple confidence interval using standard deviation
    margin = 1.96 * std  # 95% confidence
    return {
        'lower_bound': max(0, mean - margin),
        'upper_bound': mean + margin,
        'confidence_level': confidence_level
    }

def update_metrics(success=True):
    """Update performance metrics"""
    if success:
        metrics['total_predictions'] += 1
    else:
        metrics['errors'] += 1

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy' if model_info.get('loaded', False) else 'unhealthy',
        'model_loaded': model_info.get('loaded', False),
        'model_type': model_info.get('model_type', 'Unknown'),
        'model_path': model_info.get('model_path', 'Unknown'),
        'total_predictions': metrics['total_predictions'],
        'uptime_since': metrics['uptime_since'],
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/model-info', methods=['GET'])
def get_model_info():
    """Get model information"""
    return jsonify({
        'model_info': model_info,
        'config': {
            'validation_strict': config.VALIDATION_STRICT,
            'cors_origins': config.CORS_ORIGINS
        },
        'metrics': metrics
    })

@app.route('/api/predict', methods=['POST'])
@limiter.limit("30 per minute")
def predict():
    """Main prediction endpoint"""
    try:
        data = request.get_json()
        if not data or 'features' not in data:
            return jsonify({'error': 'Missing features in request'}), 400

        features = data['features']
        include_confidence = data.get('include_confidence', False)

        # Validate features
        validate_features(features, config.VALIDATION_STRICT)

        # Prepare data for prediction
        prediction_data = []
        for feature_set in features:
            # Extract features in correct order
            feature_vector = [
                feature_set['temperature'],
                feature_set['humidity'],
                feature_set['occupancy'],
                feature_set['renewable'],
                feature_set.get('hour', datetime.fromisoformat(feature_set['timestamp'].replace('Z', '+00:00')).hour),
                feature_set.get('day_of_week', datetime.fromisoformat(feature_set['timestamp'].replace('Z', '+00:00')).weekday()),
                feature_set.get('month', datetime.fromisoformat(feature_set['timestamp'].replace('Z', '+00:00')).month),
                feature_set.get('is_weekend', 1 if datetime.fromisoformat(feature_set['timestamp'].replace('Z', '+00:00')).weekday() >= 5 else 0)
            ]
            prediction_data.append(feature_vector)

        df = pd.DataFrame(prediction_data, columns=[
            'temperature', 'humidity', 'occupancy', 'renewable',
            'hour', 'day_of_week', 'month', 'is_weekend'
        ])

        # Make predictions
        predictions = model.predict(df).tolist()

        result = {
            'predictions': predictions,
            'timestamp': datetime.now().isoformat(),
            'model_used': model_info.get('model_type', 'Unknown')
        }

        if include_confidence:
            confidence = calculate_confidence_bounds(predictions)
            result['confidence_bounds'] = confidence

        update_metrics(success=True)
        return jsonify(result)

    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        update_metrics(success=False)
        return jsonify({'error': str(e)}), 500

@app.route('/api/predict/from-history', methods=['POST'])
@limiter.limit("20 per minute")
def predict_from_history():
    """Predict using historical data pattern"""
    try:
        data = request.get_json()
        if not data or 'historical_data' not in data:
            return jsonify({'error': 'Missing historical_data in request'}), 400

        # This would implement prediction based on historical patterns
        # For now, return a placeholder
        return jsonify({
            'message': 'Historical prediction not implemented yet',
            'timestamp': datetime.now().isoformat()
        })

    except Exception as e:
        logger.error(f"Historical prediction error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/validate', methods=['POST'])
def validate_input():
    """Validate input data without making prediction"""
    try:
        data = request.get_json()
        if not data or 'features' not in data:
            return jsonify({'error': 'Missing features in request'}), 400

        features = data['features']
        validate_features(features, config.VALIDATION_STRICT)

        return jsonify({
            'valid': True,
            'message': 'Input validation successful',
            'timestamp': datetime.now().isoformat()
        })

    except ValueError as e:
        return jsonify({
            'valid': False,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/metrics', methods=['GET'])
def get_metrics():
    """Get API performance metrics"""
    return jsonify(metrics)

@app.route('/api/reload-model', methods=['POST'])
def reload_model():
    """Reload the ML model"""
    try:
        if load_model():
            return jsonify({
                'message': 'Model reloaded successfully',
                'model_info': model_info,
                'timestamp': datetime.now().isoformat()
            })
        else:
            return jsonify({'error': 'Failed to reload model'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.errorhandler(429)
def ratelimit_handler(e):
    return jsonify({
        'error': 'Rate limit exceeded',
        'message': str(e),
        'timestamp': datetime.now().isoformat()
    }), 429

@app.errorhandler(500)
def internal_error(e):
    return jsonify({
        'error': 'Internal server error',
        'timestamp': datetime.now().isoformat()
    }), 500

if __name__ == '__main__':
    # Load model on startup
    if not load_model():
        logger.error("Failed to load model on startup")
        exit(1)

    logger.info(f"Starting SmartEnergy API server on {config.HOST}:{config.PORT}")
    app.run(
        host=config.HOST,
        port=config.PORT,
        debug=config.DEBUG,
        threaded=True
    )
