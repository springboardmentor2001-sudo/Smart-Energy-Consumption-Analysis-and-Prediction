"""
Smart Energy - Flask Backend
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from datetime import datetime, timedelta
import pickle
import pandas as pd
import numpy as np
import requests
import os
from functools import wraps

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SECRET_KEY'] = 'your-secret-key-change-this'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///smart_energy.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Load ML Model
with open('Xgmodel.pkl', 'rb') as f:
    xgb_model = pickle.load(f)

with open('feature_names.pkl', 'rb') as f:
    required_features = pickle.load(f)

def get_weather_forecast(target_datetime):
    """Get weather forecast for a specific datetime (used for AI chat)"""
    API_KEY = "YOUR_OPENWEATHER_API_KEY"
    LAT = "28.6139"
    LON = "77.2090"
    
    try:
        url = f"http://api.openweathermap.org/data/2.5/forecast?lat={LAT}&lon={LON}&appid={API_KEY}&units=metric"
        response = requests.get(url, timeout=5)
        data = response.json()
        
        if response.status_code != 200:
            raise Exception("API call failed")
        
        # Find closest forecast time
        target_timestamp = target_datetime.timestamp()
        closest_forecast = None
        min_diff = float('inf')
        
        for item in data['list']:
            forecast_time = datetime.fromtimestamp(item['dt'])
            diff = abs((forecast_time - target_datetime).total_seconds())
            
            if diff < min_diff:
                min_diff = diff
                closest_forecast = item
        
        if closest_forecast:
            return {
                'temperature': closest_forecast['main']['temp'],
                'humidity': closest_forecast['main']['humidity'],
                'timestamp': target_datetime
            }
        else:
            raise Exception("No forecast found")
            
    except Exception as e:
        print(f"Weather forecast error: {e}")
        # Fallback based on hour
        hour = target_datetime.hour
        base_temp = 25.0
        
        if 0 <= hour <= 5:
            temp = base_temp - 5 + (hour * 0.5)
        elif 6 <= hour <= 11:
            temp = base_temp - 2 + ((hour - 6) * 1.5)
        elif 12 <= hour <= 15:
            temp = base_temp + 5 + ((hour - 12) * 0.5)
        elif 16 <= hour <= 19:
            temp = base_temp + 4 - ((hour - 16) * 0.8)
        else:
            temp = base_temp - ((hour - 20) * 0.7)
        
        humidity = 80 - (temp - 20) * 2
        humidity = max(30, min(90, humidity))
        
        return {
            'temperature': round(temp, 1),
            'humidity': int(humidity),
            'timestamp': target_datetime
        }

# ============================================
# DATABASE MODELS
# ============================================

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    square_footage = db.Column(db.Float, nullable=False)
    renewable_energy = db.Column(db.Float, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
class UserSettings(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    occupancy = db.Column(db.Integer, default=0)
    is_holiday = db.Column(db.Boolean, default=False)
    hvac_status = db.Column(db.Boolean, default=False)
    lighting_status = db.Column(db.Boolean, default=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow)

class EnergyHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False)
    energy_consumption = db.Column(db.Float, nullable=False)
    temperature = db.Column(db.Float, nullable=False)
    humidity = db.Column(db.Float, nullable=False)
    occupancy = db.Column(db.Integer, nullable=False)
    hvac_status = db.Column(db.Boolean, nullable=False)
    lighting_status = db.Column(db.Boolean, nullable=False)
    is_holiday = db.Column(db.Boolean, nullable=False)

# ============================================
# AUTHENTICATION DECORATOR
# ============================================

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        try:
            token = token.split(' ')[1]  # Remove 'Bearer ' prefix
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = db.session.get(User, data['user_id'])
        except:
            return jsonify({'error': 'Token is invalid'}), 401
        return f(current_user, *args, **kwargs)
    return decorated

# ============================================
# WEATHER API INTEGRATION
# ============================================

def get_weather_data():
    """Get current weather from OpenWeatherMap API"""
    # Replace with your API key from https://openweathermap.org/
    API_KEY = "YOUR_OPENWEATHER_API_KEY"
    CITY = "New Delhi"  # User's location
    LAT = "28.6139"
    LON = "77.2090"
    
    try:
        url = f"http://api.openweathermap.org/data/2.5/weather?q={CITY}&appid={API_KEY}&units=metric"
        response = requests.get(url)
        data = response.json()
        
        return {
            'temperature': data['main']['temp'],
            'humidity': data['main']['humidity'],
            'timestamp': datetime.utcnow()
        }
    except:
        # Fallback to default values if API fails
        return {
            'temperature': 25.0,
            'humidity': 60.0,
            'timestamp': datetime.utcnow()
        }

def get_hourly_weather_forecast():
    """Get hourly weather forecast for today (all 24 hours)"""
    API_KEY = "YOUR_OPENWEATHER_API_KEY"
    LAT = "28.6139"  # New Delhi latitude
    LON = "77.2090"  # New Delhi longitude
    
    try:
        # Use 5-day forecast API which gives 3-hour intervals
        url = f"http://api.openweathermap.org/data/2.5/forecast?lat={LAT}&lon={LON}&appid={API_KEY}&units=metric"
        response = requests.get(url, timeout=5)
        data = response.json()
        
        if response.status_code != 200:
            raise Exception("API call failed")
        
        # Get today's date
        today = datetime.utcnow().date()
        
        # Create hourly forecast mapping
        hourly_forecast = {}
        
        for item in data['list']:
            forecast_time = datetime.fromtimestamp(item['dt'])
            
            # Only process today's forecasts
            if forecast_time.date() == today:
                hour = forecast_time.hour
                hourly_forecast[hour] = {
                    'temperature': item['main']['temp'],
                    'humidity': item['main']['humidity'],
                    'timestamp': forecast_time
                }
        
        # Fill in missing hours with interpolation
        if hourly_forecast:
            for hour in range(24):
                if hour not in hourly_forecast:
                    # Find nearest available hours
                    before = None
                    after = None
                    
                    for h in range(hour, -1, -1):
                        if h in hourly_forecast:
                            before = hourly_forecast[h]
                            break
                    
                    for h in range(hour, 24):
                        if h in hourly_forecast:
                            after = hourly_forecast[h]
                            break
                    
                    # Interpolate
                    if before and after:
                        hourly_forecast[hour] = {
                            'temperature': (before['temperature'] + after['temperature']) / 2,
                            'humidity': (before['humidity'] + after['humidity']) / 2,
                            'timestamp': datetime.utcnow().replace(hour=hour, minute=0, second=0)
                        }
                    elif before:
                        hourly_forecast[hour] = before
                    elif after:
                        hourly_forecast[hour] = after
        
        return hourly_forecast
        
    except Exception as e:
        print(f"Weather forecast API error: {e}")
        # Fallback: generate realistic hourly temperatures for the day
        hourly_forecast = {}
        base_temp = 25.0
        
        for hour in range(24):
            # Realistic temperature variation throughout the day
            if 0 <= hour <= 5:  # Night - coolest
                temp = base_temp - 5 + (hour * 0.5)
            elif 6 <= hour <= 11:  # Morning - warming up
                temp = base_temp - 2 + ((hour - 6) * 1.5)
            elif 12 <= hour <= 15:  # Afternoon - hottest
                temp = base_temp + 5 + ((hour - 12) * 0.5)
            elif 16 <= hour <= 19:  # Evening - cooling
                temp = base_temp + 4 - ((hour - 16) * 0.8)
            else:  # Night - cooling down
                temp = base_temp - ((hour - 20) * 0.7)
            
            # Humidity varies inversely with temperature
            humidity = 80 - (temp - 20) * 2
            humidity = max(30, min(90, humidity))
            
            hourly_forecast[hour] = {
                'temperature': round(temp, 1),
                'humidity': int(humidity),
                'timestamp': datetime.utcnow().replace(hour=hour, minute=0, second=0)
            }
        
        return hourly_forecast

# ============================================
# FEATURE ENGINEERING FUNCTIONS
# ============================================

def create_features(user, current_data, historical_data):
    """Create all 70 features required by the model"""
    
    df = pd.DataFrame([current_data])
    
    # Add historical data for lags and rolling stats
    if len(historical_data) > 0:
        hist_df = pd.DataFrame(historical_data)
        full_df = pd.concat([hist_df, df], ignore_index=True)
    else:
        full_df = df.copy()
    
    # 1. Time features
    full_df['Hour'] = full_df['timestamp'].dt.hour
    full_df['DayOfWeek'] = full_df['timestamp'].dt.dayofweek
    full_df['Month'] = full_df['timestamp'].dt.month
    full_df['DayOfMonth'] = full_df['timestamp'].dt.day
    
    # Cyclical encoding
    full_df['Hour_sin'] = np.sin(2 * np.pi * full_df['Hour'] / 24)
    full_df['Hour_cos'] = np.cos(2 * np.pi * full_df['Hour'] / 24)
    full_df['DayOfWeek_sin'] = np.sin(2 * np.pi * full_df['DayOfWeek'] / 7)
    full_df['DayOfWeek_cos'] = np.cos(2 * np.pi * full_df['DayOfWeek'] / 7)
    
    full_df['IsWeekend'] = (full_df['DayOfWeek'] >= 5).astype(int)
    full_df['Holiday_Yes'] = full_df['is_holiday'].astype(int)
    
    # Time of day
    full_df['IsNight'] = ((full_df['Hour'] >= 22) | (full_df['Hour'] <= 6)).astype(int)
    full_df['IsMorning'] = ((full_df['Hour'] >= 7) & (full_df['Hour'] <= 11)).astype(int)
    full_df['IsAfternoon'] = ((full_df['Hour'] >= 12) & (full_df['Hour'] <= 17)).astype(int)
    full_df['IsEvening'] = ((full_df['Hour'] >= 18) & (full_df['Hour'] <= 21)).astype(int)
    
    # 2. Lagged features
    for lag in [1, 2, 3, 6, 12, 24, 48, 168]:
        full_df[f'Energy_lag_{lag}h'] = full_df['energy_consumption'].shift(lag)
    
    # 3. Rolling statistics
    for window in [3, 6, 12, 24]:
        full_df[f'Energy_roll_{window}h_mean'] = full_df['energy_consumption'].shift(1).rolling(window, min_periods=1).mean()
        full_df[f'Energy_roll_{window}h_std'] = full_df['energy_consumption'].shift(1).rolling(window, min_periods=1).std()
        full_df[f'Energy_roll_{window}h_max'] = full_df['energy_consumption'].shift(1).rolling(window, min_periods=1).max()
        full_df[f'Energy_roll_{window}h_min'] = full_df['energy_consumption'].shift(1).rolling(window, min_periods=1).min()
    
    # 4. Energy changes
    full_df['Energy_change_1h'] = full_df['energy_consumption'].diff(1)
    full_df['Energy_change_3h'] = full_df['energy_consumption'].diff(3)
    full_df['Energy_change_24h'] = full_df['energy_consumption'].diff(24)
    
    # 5. Momentum
    full_df['Energy_momentum_3h'] = full_df['Energy_lag_1h'] - full_df['Energy_lag_3h']
    full_df['Energy_momentum_24h'] = full_df['Energy_lag_1h'] - full_df['Energy_lag_24h']
    
    # 6. Weather features
    full_df['Temp_lag_1h'] = full_df['temperature'].shift(1)
    full_df['Humidity_lag_1h'] = full_df['humidity'].shift(1)
    
    for window in [3, 6, 12, 24]:
        full_df[f'Temp_roll_{window}h'] = full_df['temperature'].shift(1).rolling(window, min_periods=1).mean()
        full_df[f'Humidity_roll_{window}h'] = full_df['humidity'].shift(1).rolling(window, min_periods=1).mean()
    
    full_df['Temp_change_1h'] = full_df['temperature'].diff(1)
    full_df['Humidity_change_1h'] = full_df['humidity'].diff(1)
    
    # 7. Appliance lags
    full_df['Occupancy_lag_1h'] = full_df['occupancy'].shift(1)
    full_df['Occupancy_lag_24h'] = full_df['occupancy'].shift(24)
    full_df['HVAC_lag_1h'] = full_df['hvac_status'].astype(int).shift(1)
    full_df['HVAC_lag_24h'] = full_df['hvac_status'].astype(int).shift(24)
    full_df['Lighting_lag_1h'] = full_df['lighting_status'].astype(int).shift(1)
    full_df['Lighting_lag_24h'] = full_df['lighting_status'].astype(int).shift(24)
    
    full_df['Occupancy_roll_6h'] = full_df['occupancy'].shift(1).rolling(6, min_periods=1).mean()
    full_df['Occupancy_roll_24h'] = full_df['occupancy'].shift(1).rolling(24, min_periods=1).mean()
    
    # 8. Non-linear interactions
    full_df['Energy_lag_1h_squared'] = full_df['Energy_lag_1h'] ** 2
    full_df['Energy_lag_1h_cubed'] = full_df['Energy_lag_1h'] ** 3
    full_df['Temp_lag_1h_squared'] = full_df['Temp_lag_1h'] ** 2
    
    full_df['Energy_X_Temp_lag'] = full_df['Energy_lag_1h'] * full_df['Temp_lag_1h']
    full_df['Energy_X_Humidity_lag'] = full_df['Energy_lag_1h'] * full_df['Humidity_lag_1h']
    full_df['Energy_X_Occupancy_lag'] = full_df['Energy_lag_1h'] * full_df['Occupancy_lag_1h']
    full_df['Energy_X_HVAC_lag'] = full_df['Energy_lag_1h'] * full_df['HVAC_lag_1h']
    
    full_df['Temp_X_Humidity_lag'] = full_df['Temp_lag_1h'] * full_df['Humidity_lag_1h']
    full_df['Temp_X_Occupancy_lag'] = full_df['Temp_lag_1h'] * full_df['Occupancy_lag_1h']
    full_df['Temp_X_HVAC_lag'] = full_df['Temp_lag_1h'] * full_df['HVAC_lag_1h']
    
    full_df['Occupancy_X_HVAC_lag'] = full_df['Occupancy_lag_1h'] * full_df['HVAC_lag_1h']
    full_df['Occupancy_X_Lighting_lag'] = full_df['Occupancy_lag_1h'] * full_df['Lighting_lag_1h']
    
    # Ratios
    full_df['Energy_ratio_1h_24h'] = full_df['Energy_lag_1h'] / (full_df['Energy_lag_24h'] + 1)
    full_df['Energy_ratio_1h_168h'] = full_df['Energy_lag_1h'] / (full_df['Energy_lag_168h'] + 1)
    full_df['Temp_ratio'] = full_df['Temp_lag_1h'] / (full_df['Temp_roll_24h'] + 1)
    
    # 9. Binning (safe for new users with no data)
    try:
        full_df['Energy_lag_1h_bin'] = pd.qcut(full_df['Energy_lag_1h'].dropna(), q=5, labels=False, duplicates='drop')
    except:
        full_df['Energy_lag_1h_bin'] = 2
    
    try:
        full_df['Temp_lag_1h_bin'] = pd.qcut(full_df['Temp_lag_1h'].dropna(), q=5, labels=False, duplicates='drop')
    except:
        full_df['Temp_lag_1h_bin'] = 2
    
    try:
        full_df['Occupancy_lag_1h_bin'] = pd.qcut(full_df['Occupancy_lag_1h'].dropna(), q=3, labels=False, duplicates='drop')
    except:
        full_df['Occupancy_lag_1h_bin'] = 1
    
    full_df['Energy_lag_1h_bin'] = full_df['Energy_lag_1h_bin'].fillna(2)
    full_df['Temp_lag_1h_bin'] = full_df['Temp_lag_1h_bin'].fillna(2)
    full_df['Occupancy_lag_1h_bin'] = full_df['Occupancy_lag_1h_bin'].fillna(1)
    
    # 10. Time interactions
    full_df['Hour_X_Weekend'] = full_df['Hour'] * full_df['IsWeekend']
    full_df['Hour_X_Holiday'] = full_df['Hour'] * full_df['Holiday_Yes']
    full_df['Energy_X_Weekend'] = full_df['Energy_lag_1h'] * full_df['IsWeekend']
    full_df['Energy_X_Holiday'] = full_df['Energy_lag_1h'] * full_df['Holiday_Yes']
    
    # Add building features
    full_df['SquareFootage'] = user.square_footage
    full_df['RenewableEnergy'] = user.renewable_energy
    
    # Get last row (current prediction)
    current_features = full_df.iloc[-1:][required_features].fillna(0)
    
    return current_features

# ============================================
# API ROUTES
# ============================================

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 400
    
    hashed_password = generate_password_hash(data['password'])
    
    new_user = User(
        email=data['email'],
        password=hashed_password,
        name=data['name'],
        square_footage=data['squareFootage'],
        renewable_energy=data['renewableEnergy']
    )
    
    db.session.add(new_user)
    db.session.commit()
    
    # Create default settings
    settings = UserSettings(
        user_id=new_user.id,
        occupancy=0,
        is_holiday=False,
        hvac_status=False,
        lighting_status=False
    )
    db.session.add(settings)
    db.session.commit()
    
    return jsonify({'message': 'User created successfully'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not check_password_hash(user.password, data['password']):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    token = jwt.encode({
        'user_id': user.id,
        'exp': datetime.utcnow() + timedelta(days=7)
    }, app.config['SECRET_KEY'], algorithm='HS256')
    
    return jsonify({
        'token': token,
        'user': {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'squareFootage': user.square_footage,
            'renewableEnergy': user.renewable_energy
        }
    })

@app.route('/api/settings', methods=['GET', 'PUT'])
@token_required
def user_settings(current_user):
    settings = UserSettings.query.filter_by(user_id=current_user.id).first()
    
    if request.method == 'GET':
        return jsonify({
            'occupancy': settings.occupancy,
            'isHoliday': settings.is_holiday,
            'hvacStatus': settings.hvac_status,
            'lightingStatus': settings.lighting_status
        })
    
    elif request.method == 'PUT':
        data = request.json
        settings.occupancy = data.get('occupancy', settings.occupancy)
        settings.is_holiday = data.get('isHoliday', settings.is_holiday)
        settings.hvac_status = data.get('hvacStatus', settings.hvac_status)
        settings.lighting_status = data.get('lightingStatus', settings.lighting_status)
        settings.updated_at = datetime.utcnow()
        
        db.session.commit()
        return jsonify({'message': 'Settings updated successfully'})

def seed_initial_history(user_id, settings, weather):
    """Create initial historical data for new users with realistic patterns"""
    base_energy = 45.0  # Base energy consumption in kWh
    current_time = datetime.utcnow()
    
    # Create 168 hours (7 days) of synthetic history
    for hours_ago in range(168, 0, -1):
        timestamp = current_time - timedelta(hours=hours_ago)
        hour = timestamp.hour
        day_of_week = timestamp.weekday()
        
        # Time of day patterns (this creates the curve)
        if 0 <= hour <= 5:  # Night (low usage)
            time_factor = 0.65
        elif 6 <= hour <= 8:  # Morning ramp-up
            time_factor = 1.2 + (hour - 6) * 0.15  # Gradual increase
        elif 9 <= hour <= 11:  # Morning peak
            time_factor = 1.6
        elif 12 <= hour <= 16:  # Afternoon (moderate)
            time_factor = 1.4
        elif 17 <= hour <= 21:  # Evening peak (highest)
            time_factor = 1.8
        elif 22 <= hour <= 23:  # Late evening
            time_factor = 1.1
        else:
            time_factor = 1.0
        
        # Weekend pattern (slightly different)
        if day_of_week >= 5:  # Weekend
            if 10 <= hour <= 15:
                time_factor *= 1.15  # More usage during midday on weekends
            if 7 <= hour <= 9:
                time_factor *= 0.9   # Less morning rush on weekends
        
        # HVAC impact (significant)
        hvac_factor = 1.35 if settings.hvac_status else 1.0
        
        # Lighting impact (moderate)
        lighting_factor = 1.15 if settings.lighting_status else 1.0
        
        # Occupancy impact
        occupancy_factor = 1.0 + (settings.occupancy / 150.0)
        
        # Calculate energy with all factors
        energy = base_energy * time_factor * hvac_factor * lighting_factor * occupancy_factor
        
        # Add day-to-day variation (±8%)
        daily_variation = np.random.uniform(0.92, 1.08)
        energy = energy * daily_variation
        
        # Add hourly noise (±5%)
        hourly_noise = np.random.uniform(0.95, 1.05)
        energy = energy * hourly_noise
        
        # Ensure realistic bounds
        energy = max(20.0, min(150.0, energy))
        
        # Temperature variation
        temp_base = weather['temperature']
        temp_variation = np.random.uniform(-4, 4)
        temp = temp_base + temp_variation
        
        # Humidity variation
        humidity = max(20, min(95, weather['humidity'] + np.random.uniform(-15, 15)))
        
        # Occupancy variation
        occ_variation = int(np.random.uniform(-30, 30))
        occupancy = max(0, settings.occupancy + occ_variation)
        
        history = EnergyHistory(
            user_id=user_id,
            timestamp=timestamp,
            energy_consumption=energy,
            temperature=temp,
            humidity=humidity,
            occupancy=occupancy,
            hvac_status=settings.hvac_status,
            lighting_status=settings.lighting_status,
            is_holiday=settings.is_holiday
        )
        db.session.add(history)
    
    db.session.commit()
    print(f"✓ Seeded {168} hours of historical data for user {user_id}")

@app.route('/api/predict/today', methods=['GET'])
@token_required
def predict_today(current_user):
    """Predict energy consumption for entire day (24 hours)"""
    
    settings = UserSettings.query.filter_by(user_id=current_user.id).first()
    current_weather = get_weather_data()
    
    # Get hourly weather forecast for all 24 hours of today
    hourly_weather = get_hourly_weather_forecast()
    
    # Get historical data (last 168 hours)
    historical = EnergyHistory.query.filter_by(user_id=current_user.id)\
        .order_by(EnergyHistory.timestamp.desc()).limit(168).all()
    
    # If new user with no history, seed initial data
    if len(historical) < 10:
        seed_initial_history(current_user.id, settings, current_weather)
        historical = EnergyHistory.query.filter_by(user_id=current_user.id)\
            .order_by(EnergyHistory.timestamp.desc()).limit(168).all()
    
    hist_data = [{
        'timestamp': pd.to_datetime(h.timestamp),
        'energy_consumption': h.energy_consumption,
        'temperature': h.temperature,
        'humidity': h.humidity,
        'occupancy': h.occupancy,
        'hvac_status': h.hvac_status,
        'lighting_status': h.lighting_status,
        'is_holiday': h.is_holiday
    } for h in reversed(historical)]
    
    predictions = []
    now = datetime.utcnow()
    start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)
    today_date = now.strftime('%Y-%m-%d')  # Today's date for display
    
    # Store predictions to add to history later
    prediction_records = []
    
    # Base energy consumption
    base_energy = 45.0
    if settings.hvac_status:
        base_energy *= 1.3
    if settings.lighting_status:
        base_energy *= 1.15
    
    occupancy_factor = 1.0 + (settings.occupancy / 150.0)
    base_energy *= occupancy_factor
    
    print(f"\n{'='*60}")
    print(f"GENERATING PREDICTIONS FOR: {today_date}")
    print(f"{'='*60}")
    
    for hour in range(24):
        pred_time = start_of_day + timedelta(hours=hour)
        
        # Get the SPECIFIC weather for THIS hour from forecast
        hour_weather = hourly_weather.get(hour, {
            'temperature': current_weather['temperature'],
            'humidity': current_weather['humidity']
        })
        
        print(f"Hour {hour:02d}:00 - Temp: {hour_weather['temperature']:.1f}°C, Humidity: {hour_weather['humidity']}%")
        
        # Time-based multiplier for realistic daily patterns
        time_multiplier = 1.0
        if 0 <= hour <= 5:  # Night (low usage)
            time_multiplier = 0.65
        elif 6 <= hour <= 8:  # Morning ramp-up
            time_multiplier = 1.2 + (hour - 6) * 0.1
        elif 9 <= hour <= 11:  # Morning peak
            time_multiplier = 1.5
        elif 12 <= hour <= 16:  # Afternoon (moderate)
            time_multiplier = 1.3
        elif 17 <= hour <= 21:  # Evening peak
            time_multiplier = 1.7
        elif 22 <= hour <= 23:  # Late evening
            time_multiplier = 1.1
        
        # Temperature impact on energy (using HOUR-SPECIFIC temperature)
        temp_factor = 1.0
        if settings.hvac_status:
            # If HVAC is on, temperature has significant impact
            if hour_weather['temperature'] > 30:
                temp_factor = 1.3
            elif hour_weather['temperature'] > 25:
                temp_factor = 1.15
            elif hour_weather['temperature'] < 15:
                temp_factor = 1.2  # Heating
        
        # Calculate prediction with all factors
        prediction = base_energy * time_multiplier * temp_factor
        
        # Add small random variation for realism (±3%)
        variation = np.random.uniform(0.97, 1.03)
        prediction = prediction * variation
        
        # Try to use ML model for refinement if possible
        current_data = {
            'timestamp': pd.to_datetime(pred_time),
            'energy_consumption': predictions[-1]['value'] if predictions else hist_data[-1]['energy_consumption'] if hist_data else prediction,
            'temperature': hour_weather['temperature'],  # HOUR-SPECIFIC TEMP
            'humidity': hour_weather['humidity'],        # HOUR-SPECIFIC HUMIDITY
            'occupancy': settings.occupancy,
            'hvac_status': settings.hvac_status,
            'lighting_status': settings.lighting_status,
            'is_holiday': settings.is_holiday
        }
        
        try:
            features = create_features(current_user, current_data, hist_data)
            ml_prediction = float(xgb_model.predict(features)[0])
            
            # Use ML prediction if it's reasonable, otherwise use our calculation
            if ml_prediction > 5.0 and ml_prediction < 200.0:
                prediction = ml_prediction
        except Exception as e:
            # Use our calculated prediction (already set above)
            pass
        
        predictions.append({
            'hour': hour,
            'time': pred_time.strftime('%H:%M'),
            'value': float(prediction)
        })
        
        # Prepare record for history
        prediction_records.append({
            'timestamp': pred_time,
            'energy': prediction,
            'temperature': hour_weather['temperature'],
            'humidity': hour_weather['humidity']
        })
        
        # Update history for next prediction
        hist_data.append(current_data.copy())
        hist_data[-1]['energy_consumption'] = prediction
    
    # Save predictions to history for future use
    for record in prediction_records:
        # Check if prediction already exists for this timestamp
        existing = EnergyHistory.query.filter_by(
            user_id=current_user.id,
            timestamp=record['timestamp']
        ).first()
        
        if not existing:
            new_history = EnergyHistory(
                user_id=current_user.id,
                timestamp=record['timestamp'],
                energy_consumption=record['energy'],
                temperature=record['temperature'],
                humidity=record['humidity'],
                occupancy=settings.occupancy,
                hvac_status=settings.hvac_status,
                lighting_status=settings.lighting_status,
                is_holiday=settings.is_holiday
            )
            db.session.add(new_history)
    
    try:
        db.session.commit()
    except:
        db.session.rollback()
    
    avg_usage = np.mean([p['value'] for p in predictions])
    
    print(f"\n✓ Generated predictions - Avg: {avg_usage:.2f} kWh")
    print(f"{'='*60}\n")
    
    return jsonify({
        'predictions': predictions,
        'averageUsage': float(avg_usage),
        'todayDate': today_date,  # Send today's date to frontend
        'currentWeather': {
            'temperature': current_weather['temperature'],
            'humidity': current_weather['humidity']
        },
        'hourlyWeather': [{
            'hour': h,
            'temperature': hourly_weather[h]['temperature'],
            'humidity': hourly_weather[h]['humidity']
        } for h in range(24)]
    })

@app.route('/api/predict/custom', methods=['POST'])
@token_required
def predict_custom(current_user):
    """Predict for specific time and conditions"""
    
    data = request.json
    target_time = datetime.fromisoformat(data['timestamp'])
    
    settings = UserSettings.query.filter_by(user_id=current_user.id).first()
    
    # Get forecast weather for the target time
    forecast = get_weather_forecast(target_time)
    
    # Get historical data
    historical = EnergyHistory.query.filter_by(user_id=current_user.id)\
        .order_by(EnergyHistory.timestamp.desc()).limit(168).all()
    
    if len(historical) < 10:
        seed_initial_history(current_user.id, settings, {
            'temperature': forecast['temperature'],
            'humidity': forecast['humidity']
        })
        historical = EnergyHistory.query.filter_by(user_id=current_user.id)\
            .order_by(EnergyHistory.timestamp.desc()).limit(168).all()
    
    hist_data = [{
        'timestamp': pd.to_datetime(h.timestamp),
        'energy_consumption': h.energy_consumption,
        'temperature': h.temperature,
        'humidity': h.humidity,
        'occupancy': h.occupancy,
        'hvac_status': h.hvac_status,
        'lighting_status': h.lighting_status,
        'is_holiday': h.is_holiday
    } for h in reversed(historical)]
    
    current_data = {
        'timestamp': pd.to_datetime(target_time),
        'energy_consumption': hist_data[-1]['energy_consumption'] if hist_data else 50.0,
        'temperature': data.get('temperature', forecast['temperature']),
        'humidity': data.get('humidity', forecast['humidity']),
        'occupancy': data.get('occupancy', settings.occupancy),
        'hvac_status': data.get('hvacStatus', settings.hvac_status),
        'lighting_status': data.get('lightingStatus', settings.lighting_status),
        'is_holiday': data.get('isHoliday', settings.is_holiday)
    }
    
    try:
        features = create_features(current_user, current_data, hist_data)
        prediction = float(xgb_model.predict(features)[0])
        prediction = max(prediction, 5.0)  # Ensure positive
    except Exception as e:
        print(f"Custom prediction error: {e}")
        # Fallback estimation
        hour = target_time.hour
        base = 50.0
        if current_data['hvac_status']:
            base *= 1.3
        if current_data['lighting_status']:
            base *= 1.1
        if 6 <= hour <= 9 or 18 <= hour <= 22:
            base *= 1.4
        elif 0 <= hour <= 5:
            base *= 0.6
        prediction = base
    
    return jsonify({
        'prediction': float(prediction),
        'timestamp': target_time.isoformat(),
        'conditions': current_data
    })

@app.route('/api/chat', methods=['POST'])
@token_required
def chat_ai(current_user):
    """AI assistant for energy predictions"""
    
    data = request.json
    user_message = data['message'].lower()
    
    # Parse the request
    settings = UserSettings.query.filter_by(user_id=current_user.id).first()
    weather = get_weather_data()
    
    # Check if asking for prediction
    if 'tomorrow' in user_message or 'prediction' in user_message or 'forecast' in user_message:
        # Parse time from message
        hour = 18  # Default 6pm
        
        # Try to extract hour from message
        import re
        time_patterns = [
            (r'(\d+)\s*am', lambda x: int(x)),
            (r'(\d+)\s*pm', lambda x: int(x) + 12 if int(x) != 12 else 12),
            (r'(\d+):00', lambda x: int(x)),
        ]
        
        for pattern, converter in time_patterns:
            match = re.search(pattern, user_message)
            if match:
                hour = converter(match.group(1))
                break
        
        # Determine target date
        if 'tomorrow' in user_message:
            target_time = datetime.utcnow() + timedelta(days=1)
        elif 'today' in user_message:
            target_time = datetime.utcnow()
        else:
            target_time = datetime.utcnow() + timedelta(days=1)
        
        target_time = target_time.replace(hour=hour, minute=0, second=0, microsecond=0)
        
        # Get weather forecast for the target time
        forecast = get_weather_forecast(target_time)
        
        # Calculate prediction using the same logic as predict_today
        base_energy = 45.0
        if settings.hvac_status:
            base_energy *= 1.35
        if settings.lighting_status:
            base_energy *= 1.15
        
        occupancy_factor = 1.0 + (settings.occupancy / 150.0)
        base_energy *= occupancy_factor
        
        # Time-based multiplier
        if 0 <= hour <= 5:
            time_multiplier = 0.65
        elif 6 <= hour <= 8:
            time_multiplier = 1.2 + (hour - 6) * 0.15
        elif 9 <= hour <= 11:
            time_multiplier = 1.6
        elif 12 <= hour <= 16:
            time_multiplier = 1.4
        elif 17 <= hour <= 21:
            time_multiplier = 1.8
        elif 22 <= hour <= 23:
            time_multiplier = 1.1
        else:
            time_multiplier = 1.0
        
        # Temperature impact (real forecast temperature!)
        temp_factor = 1.0
        if settings.hvac_status:
            if forecast['temperature'] > 30:
                temp_factor = 1.3  # Hot day, more cooling
            elif forecast['temperature'] > 25:
                temp_factor = 1.15
            elif forecast['temperature'] < 15:
                temp_factor = 1.2  # Cold day, more heating
        
        prediction = base_energy * time_multiplier * temp_factor
        
        # Try ML model as refinement
        try:
            historical = EnergyHistory.query.filter_by(user_id=current_user.id)\
                .order_by(EnergyHistory.timestamp.desc()).limit(168).all()
            
            if len(historical) >= 10:
                hist_data = [{
                    'timestamp': pd.to_datetime(h.timestamp),
                    'energy_consumption': h.energy_consumption,
                    'temperature': h.temperature,
                    'humidity': h.humidity,
                    'occupancy': h.occupancy,
                    'hvac_status': h.hvac_status,
                    'lighting_status': h.lighting_status,
                    'is_holiday': h.is_holiday
                } for h in reversed(historical)]
                
                current_data = {
                    'timestamp': pd.to_datetime(target_time),
                    'energy_consumption': hist_data[-1]['energy_consumption'],
                    'temperature': forecast['temperature'],
                    'humidity': forecast['humidity'],
                    'occupancy': settings.occupancy,
                    'hvac_status': settings.hvac_status,
                    'lighting_status': settings.lighting_status,
                    'is_holiday': settings.is_holiday
                }
                
                features = create_features(current_user, current_data, hist_data)
                ml_prediction = float(xgb_model.predict(features)[0])
                
                if ml_prediction > 10.0 and ml_prediction < 200.0:
                    prediction = ml_prediction
        except Exception as e:
            print(f"ML prediction failed: {e}")
            # Use our calculated prediction
        
        # Build response
        time_str = target_time.strftime('%I:%M %p')
        date_str = 'tomorrow' if 'tomorrow' in user_message else 'today'
        
        response = f"🔮 Based on your current settings:\n\n"
        response += f"📊 Predicted consumption for {date_str} at {time_str}: **{prediction:.2f} kWh**\n\n"
        response += f"⚙️ Current Settings:\n"
        response += f"  • HVAC: {'ON ❄️ (+35%)' if settings.hvac_status else 'OFF'}\n"
        response += f"  • Lights: {'ON 💡 (+15%)' if settings.lighting_status else 'OFF'}\n"
        response += f"  • Occupancy: {settings.occupancy} people\n"
        response += f"  • Temperature: {weather['temperature']:.1f}°C\n\n"
        
        # Recommendations
        if prediction > 70:
            response += "⚠️ High usage predicted! Consider:\n"
            response += "  • Turning off HVAC during off-peak hours\n"
            response += "  • Reducing occupancy if possible\n"
            response += "  • Using energy-efficient lighting"
        elif prediction > 50:
            response += "📈 Moderate usage. Your settings are reasonable."
        else:
            response += "✅ Excellent! Your energy usage is efficient and optimized."
        
        return jsonify({
            'response': response,
            'prediction': float(prediction),
            'timestamp': target_time.isoformat()
        })
    
    # Help/general responses
    elif 'help' in user_message or 'what can you do' in user_message:
        response = """🤖 I'm your Smart Energy AI Assistant! I can help you with:

📊 **Predictions**: Ask me about energy consumption forecasts
  • "What will be the prediction for tomorrow at 6pm?"
  • "Show me prediction for today at 2pm"

💡 **Optimization**: Get tips to reduce energy usage
  • "How can I save energy?"
  • "What's using the most power?"

⚙️ **Settings Impact**: See how changes affect your usage
  • "What if I turn on HVAC?"
  • "How much does lighting cost?"

Just ask me anything about your energy consumption!"""
        return jsonify({'response': response})
    
    elif 'save' in user_message or 'reduce' in user_message or 'optimize' in user_message:
        response = """💡 **Energy Saving Tips:**

1. **HVAC Management** (35% impact)
   • Turn off when unoccupied
   • Set to eco mode during low-traffic hours
   • Currently: """ + ('ON ❄️' if settings.hvac_status else 'OFF') + """

2. **Smart Lighting** (15% impact)
   • Use motion sensors
   • Switch to LED bulbs
   • Currently: """ + ('ON 💡' if settings.lighting_status else 'OFF') + """

3. **Peak Hour Avoidance**
   • Reduce usage during 6-9 PM (highest rates)
   • Schedule high-energy tasks for off-peak times

4. **Occupancy Optimization**
   • Current occupancy: """ + str(settings.occupancy) + """ people
   • More occupancy = more energy needed

Would you like specific predictions for different settings?"""
        return jsonify({'response': response})
    
    # Default response
    response = """I'm your Smart Energy AI assistant! 🌟

Ask me things like:
• "What's the prediction for tomorrow at 6pm?"
• "How can I save energy?"
• "What if I turn off HVAC?"
• "Show me today's forecast"

I'm here to help you optimize your energy consumption!"""
    
    return jsonify({'response': response})

# ============================================
# INITIALIZE DATABASE
# ============================================

@app.route('/api/reset-history', methods=['POST'])
@token_required
def reset_history(current_user):
    """Reset user's energy history (for testing)"""
    EnergyHistory.query.filter_by(user_id=current_user.id).delete()
    db.session.commit()
    return jsonify({'message': 'History cleared successfully'})

with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True, port=5000)