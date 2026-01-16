"""
Smart Energy Consumption Analysis Flask Application
"""
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import numpy as np
import os

# Import utilities
from utils import EnergyDataProcessor

app = Flask(__name__)
CORS(app)

# Initialize data processor
data_processor = EnergyDataProcessor()

# Load LSTM model
model = None
try:
    import tensorflow as tf
    model = tf.keras.models.load_model('lstm_energy_model.h5')
    print("✅ LSTM model loaded successfully!")
except Exception as e:
    print(f"⚠️ Warning: Could not load LSTM model: {e}")
    print("The application will run with limited prediction capabilities.")

@app.route('/')
def index():
    """Render main dashboard"""
    return render_template('index.html')

@app.route('/api/predict', methods=['POST'])
def predict():
    """
    Predict energy consumption based on input parameters
    
    Expected JSON input:
    {
        "Temperature": float,
        "Humidity": float,
        "SquareFootage": float,
        "Occupancy": int,
        "HVACUsage": "On" or "Off",
        "LightingUsage": "On" or "Off",
        "RenewableEnergy": float,
        "DayOfWeek": string,
        "Holiday": "Yes" or "No"
    }
    """
    try:
        input_data = request.json
        
        # Validate required fields
        required_fields = ['Temperature', 'Humidity', 'SquareFootage', 'Occupancy', 
                          'HVACUsage', 'LightingUsage', 'RenewableEnergy', 
                          'DayOfWeek', 'Holiday']
        
        for field in required_fields:
            if field not in input_data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Prepare input for model
        model_input = data_processor.prepare_prediction_input(input_data)
        
        # Make prediction
        if model is not None:
            prediction = model.predict(model_input, verbose=0)
            predicted_consumption = float(prediction[0][0])
        else:
            # Fallback: Simple estimation based on historical averages
            base_consumption = 75.0
            temp_factor = (input_data['Temperature'] - 25) * 0.5
            hvac_factor = 10 if input_data['HVACUsage'] == 'On' else 0
            lighting_factor = 5 if input_data['LightingUsage'] == 'On' else 0
            occupancy_factor = input_data['Occupancy'] * 1.5
            
            predicted_consumption = base_consumption + temp_factor + hvac_factor + lighting_factor + occupancy_factor
        
        # Get smart suggestions
        suggestions = data_processor.get_smart_suggestions(input_data)
        
        return jsonify({
            'success': True,
            'prediction': round(predicted_consumption, 2),
            'unit': 'kWh',
            'suggestions': suggestions,
            'input_summary': {
                'temperature': input_data['Temperature'],
                'humidity': input_data['Humidity'],
                'occupancy': input_data['Occupancy'],
                'hvac': input_data['HVACUsage'],
                'lighting': input_data['LightingUsage']
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/historical', methods=['GET'])
def get_historical():
    """Get historical energy consumption data"""
    try:
        limit = request.args.get('limit', 100, type=int)
        historical_data = data_processor.get_historical_data(limit)
        
        return jsonify({
            'success': True,
            'data': historical_data
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/device-analysis', methods=['GET'])
def get_device_analysis():
    """Get device-wise energy consumption analysis"""
    try:
        analysis = data_processor.get_device_analysis()
        
        return jsonify({
            'success': True,
            'analysis': analysis
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/statistics', methods=['GET'])
def get_statistics():
    """Get overall energy consumption statistics"""
    try:
        stats = data_processor.get_statistics()
        
        return jsonify({
            'success': True,
            'statistics': stats
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/patterns', methods=['GET'])
def get_patterns():
    """Get consumption patterns (hourly and daily)"""
    try:
        pattern_type = request.args.get('type', 'hourly')
        
        if pattern_type == 'hourly':
            pattern_data = data_processor.get_hourly_pattern()
        elif pattern_type == 'daily':
            pattern_data = data_processor.get_daily_pattern()
        else:
            return jsonify({'error': 'Invalid pattern type. Use "hourly" or "daily"'}), 400
        
        return jsonify({
            'success': True,
            'pattern': pattern_data
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/suggestions', methods=['POST'])
def get_suggestions():
    """Get smart energy-saving suggestions"""
    try:
        input_data = request.json
        suggestions = data_processor.get_smart_suggestions(input_data)
        
        return jsonify({
            'success': True,
            'suggestions': suggestions
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("🚀 Starting Smart Energy Consumption Analysis Application...")
    print("📊 Dashboard available at: http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)
