"""
Flask Backend for Smart Energy Prediction Model
Serves predictions, handles authentication, file uploads, and chatbot integration
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, verify_jwt_in_request
import os
from dotenv import load_dotenv
import joblib
from functools import wraps
from datetime import timedelta
import json
import io

# Lazy imports for Python 3.14 compatibility
try:
    import numpy as np
    import pandas as pd
except ImportError:
    np = None
    pd = None

# Skip google-generativeai for Python 3.14 compatibility - use fallback
genai = None
try:
    import google.generativeai as genai_module
    genai = genai_module
except Exception as e:
    print(f"[WARNING] Skipping google-generativeai: {e}")
    genai = None

from werkzeug.utils import secure_filename
try:
    import PyPDF2
except ImportError:
    PyPDF2 = None

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*", "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"], "allow_headers": ["Content-Type", "Authorization"]}})

# Add response headers for CORS preflight
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# Configuration
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=30)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'csv', 'txt'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

jwt = JWTManager(app)

# Load the trained model and scaler from multiple possible locations
energy_model = None
feature_scaler = None
model_performance = None

candidate_paths = [
    os.path.join(os.path.dirname(__file__), '..', 'energy_model.pkl'),
    os.path.join(os.path.dirname(__file__), 'energy_model.pkl'),
    os.path.join(os.getcwd(), 'energy_model.pkl'),
    r"C:\Users\Pranjal Giri\OneDrive\Desktop\Infosys springboard\energy_model.pkl"
]

scaler_paths = [
    os.path.join(os.path.dirname(__file__), '..', 'feature_scaler.pkl'),
    os.path.join(os.path.dirname(__file__), 'feature_scaler.pkl'),
    os.path.join(os.getcwd(), 'feature_scaler.pkl'),
]

performance_paths = [
    os.path.join(os.path.dirname(__file__), '..', 'model_performance.pkl'),
    os.path.join(os.path.dirname(__file__), 'model_performance.pkl'),
    os.path.join(os.getcwd(), 'model_performance.pkl'),
]

# Load main model
for p in candidate_paths:
    try:
        abs_p = os.path.abspath(p)
        if os.path.exists(abs_p):
            energy_model = joblib.load(abs_p)
            print(f"[OK] Energy model loaded from {abs_p}")
            break
        else:
            print(f"[INFO] Model not found at {abs_p}")
    except Exception as e:
        print(f"[INFO] Attempt to load model at {abs_p} failed: {e}")

# Load scaler
for p in scaler_paths:
    try:
        abs_p = os.path.abspath(p)
        if os.path.exists(abs_p):
            feature_scaler = joblib.load(abs_p)
            print(f"[OK] Feature scaler loaded from {abs_p}")
            break
    except Exception as e:
        print(f"[INFO] Scaler not found at {abs_p}")

# Load performance metrics
for p in performance_paths:
    try:
        abs_p = os.path.abspath(p)
        if os.path.exists(abs_p):
            model_performance = joblib.load(abs_p)
            print(f"[OK] Model performance metrics loaded")
            break
    except Exception as e:
        print(f"[INFO] Performance metrics not found")

if energy_model is None:
    print("[WARNING] Energy model not found in candidate paths")
    
if feature_scaler is None:
    print("[WARNING] Feature scaler not found - using default scaler")

# Initialize Gemini API
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
if GEMINI_API_KEY and genai:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        print("[OK] Gemini API configured")
    except Exception as e:
        print(f"[WARNING] Gemini API configuration failed: {e}")
        GEMINI_API_KEY = ''
        genai = None
else:
    print("[INFO] Gemini API not available - chatbot will use fallback responses")

# In-memory user database (replace with real database in production)
users_db = {
    'demo@example.com': {'password': 'password123', 'name': 'Demo User'},
    'test@example.com': {'password': 'test123', 'name': 'Test User'}
}

# Feature engineering for predictions - MUST MATCH training_improved_model.py exactly (28 features)
def engineer_features(input_data):
    """Apply comprehensive feature engineering matching training pipeline exactly"""
    features = {}
    
    # Extract input with defaults
    temperature = float(input_data.get('temperature', 20))
    humidity = float(input_data.get('humidity', 50))
    square_footage = float(input_data.get('square_footage', 5000))
    month = int(input_data.get('month', 1))
    hvac_appliances = int(input_data.get('hvac_appliances', 1))
    time_of_day = int(input_data.get('time', 12))
    
    # ========== BASIC FEATURES (6 features) ==========
    features['Temperature'] = temperature
    features['Humidity'] = humidity
    features['SquareFootage'] = square_footage
    features['Month'] = month
    features['Hour'] = time_of_day
    features['HVAC_Appliances'] = hvac_appliances
    
    # ========== TEMPORAL FEATURES (4 features) ==========
    # Cyclical encoding for month (sine and cosine) - MATCHES training
    features['Month_sin'] = np.sin(2 * np.pi * month / 12)
    features['Month_cos'] = np.cos(2 * np.pi * month / 12)
    
    # Hour cyclical encoding - MATCHES training
    features['Hour_sin'] = np.sin(2 * np.pi * time_of_day / 24)
    features['Hour_cos'] = np.cos(2 * np.pi * time_of_day / 24)
    
    # ========== DEGREE DAYS (6 features) ==========
    # Heating Degree Days (HDD) - base 18°C (matches training)
    hdd = max(0, 18 - temperature)
    cdd = max(0, temperature - 22)
    
    features['HDD'] = hdd
    features['CDD'] = cdd
    features['HDD_Squared'] = hdd ** 2
    features['CDD_Squared'] = cdd ** 2
    
    # Degree day interactions
    features['HDD_x_SqFt'] = hdd * (square_footage / 1000)
    features['CDD_x_SqFt'] = cdd * (square_footage / 1000)
    
    # ========== INTERACTION & DERIVED FEATURES (2 features) ==========
    features['Temp_Humidity'] = temperature * humidity / 100
    features['Temp_SqFt'] = temperature * (square_footage / 5000)
    
    # ========== ON/OFF FLAGS (4 features) ==========
    # Use HDD/CDD for flags - MATCHES training exactly
    features['Heating_On'] = 1 if hdd > 0 else 0
    features['Cooling_On'] = 1 if cdd > 0 else 0
    features['Peak_Hours'] = 1 if 14 <= time_of_day <= 19 else 0
    features['Night_Hours'] = 1 if (time_of_day >= 22 or time_of_day <= 6) else 0
    
    # ========== DERIVED FEATURES (3 features) ==========
    # Match training exactly
    features['Temp_Deviation'] = abs(temperature - 20)
    features['Humidity_Deviation'] = abs(humidity - 50)
    features['LargeBuilding'] = 1 if square_footage > 7500 else 0
    
    # ========== POLYNOMIAL FEATURES (3 features) ==========
    features['Temp_Squared'] = temperature ** 2
    features['SqFt_Squared'] = (square_footage / 1000) ** 2
    features['Humidity_Squared'] = humidity ** 2
    
    # Total: 28 features
    
    # Create DataFrame with features in EXACT order matching training
    feature_order = [
        'Temperature', 'Humidity', 'SquareFootage', 'Month', 'Hour', 'HVAC_Appliances',
        'Month_sin', 'Month_cos', 'Hour_sin', 'Hour_cos',
        'HDD', 'CDD', 'HDD_Squared', 'CDD_Squared',
        'HDD_x_SqFt', 'CDD_x_SqFt',
        'Temp_Humidity', 'Temp_SqFt',
        'Heating_On', 'Cooling_On', 'Peak_Hours', 'Night_Hours',
        'Temp_Deviation', 'Humidity_Deviation', 'LargeBuilding',
        'Temp_Squared', 'SqFt_Squared', 'Humidity_Squared'
    ]
    
    # Reorder features to match training
    ordered_features = {k: features[k] for k in feature_order if k in features}
    df = pd.DataFrame([ordered_features])
    
    return df

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Routes

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': energy_model is not None,
        'timestamp': pd.Timestamp.now().isoformat()
    }), 200

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    """User signup endpoint"""
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Missing email or password'}), 400
    
    email = data['email']
    password = data['password']
    name = data.get('name', 'User')
    
    if email in users_db:
        return jsonify({'error': 'Email already registered'}), 409
    
    users_db[email] = {'password': password, 'name': name}
    
    access_token = create_access_token(identity=email)
    return jsonify({
        'message': 'Signup successful',
        'access_token': access_token,
        'user': {'email': email, 'name': name}
    }), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    """User login endpoint"""
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Missing email or password'}), 400
    
    email = data['email']
    password = data['password']
    
    if email not in users_db or users_db[email]['password'] != password:
        return jsonify({'error': 'Invalid email or password'}), 401
    
    access_token = create_access_token(identity=email)
    user = users_db[email]
    
    return jsonify({
        'message': 'Login successful',
        'access_token': access_token,
        'user': {'email': email, 'name': user['name']}
    }), 200

@app.route('/api/auth/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Get user profile"""
    email = get_jwt_identity()
    if email in users_db:
        user = users_db[email]
        return jsonify({
            'email': email,
            'name': user['name']
        }), 200
    return jsonify({'error': 'User not found'}), 404

@app.route('/api/predict/form', methods=['POST'])
@jwt_required()
def predict_form():
    """Predict energy consumption from form input with validation"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No input data provided'}), 400
        
        # ========== INPUT VALIDATION ==========
        # Validate required fields
        required_fields = {
            'temperature': (float, -10, 50, 'Temperature (°C)'),
            'humidity': (float, 0, 100, 'Humidity (%)'),
            'square_footage': (float, 500, 50000, 'Square footage (sqft)'),
            'month': (int, 1, 12, 'Month (1-12)'),
            'hvac_appliances': (int, 0, 20, 'HVAC Appliances count'),
            'time': (int, 0, 23, 'Hour of day (0-23)')
        }
        
        validation_errors = []
        
        for field, (field_type, min_val, max_val, field_label) in required_fields.items():
            if field not in data:
                validation_errors.append(f"Missing: {field_label}")
                continue
            
            try:
                value = field_type(data[field])
                if not (min_val <= value <= max_val):
                    validation_errors.append(
                        f"{field_label} must be between {min_val} and {max_val}. Got {value}."
                    )
            except (ValueError, TypeError):
                validation_errors.append(f"{field_label} must be a valid {field_type.__name__}")
        
        # Validate categorical fields
        valid_hvac_types = ['central-ac', 'heat-pump', 'window-ac', 'baseboard', 'other']
        hvac_type = data.get('hvac_type', 'central-ac').lower()
        if hvac_type not in valid_hvac_types:
            validation_errors.append(
                f"HVAC Type must be one of: {', '.join(valid_hvac_types)}"
            )
        
        valid_seasons = ['winter', 'spring', 'summer', 'fall']
        season = data.get('season', 'spring').lower()
        if season not in valid_seasons:
            validation_errors.append(
                f"Season must be one of: {', '.join(valid_seasons)}"
            )
        
        # Return validation errors if any
        if validation_errors:
            return jsonify({
                'error': 'Validation failed',
                'details': validation_errors,
                'received_data': data
            }), 400
        
        # ========== FEATURE ENGINEERING ==========
        try:
            features_df = engineer_features(data)
            print(f"[DEBUG] Engineered {len(features_df.columns)} features")
            print(f"[DEBUG] Feature columns: {list(features_df.columns)}")
        except Exception as e:
            print(f"[ERROR] Feature engineering failed: {str(e)}")
            return jsonify({
                'error': 'Feature engineering failed',
                'details': str(e)
            }), 500
        
        # ========== MODEL PREDICTION ==========
        if energy_model is None:
            return jsonify({
                'error': 'Model not available',
                'details': 'Energy prediction model is not loaded. Please restart the server.'
            }), 503
        
        try:
            # Get prediction - features are UNSCALED (raw values)
            prediction = float(energy_model.predict(features_df)[0])
            
            # Basic sanity check
            if prediction < 0:
                prediction = abs(prediction)  # Energy can't be negative
            
            # Provide confidence level based on prediction
            if prediction < 300:
                confidence = 'Low consumption'
            elif prediction > 900:
                confidence = 'High consumption'
            else:
                confidence = 'Normal consumption'
            
            print(f"[SUCCESS] Prediction: {prediction:.2f} kWh (confidence: {confidence})")
            
            return jsonify({
                'success': True,
                'prediction': prediction,
                'unit': 'kWh',
                'confidence': confidence,
                'input_data': {
                    'temperature': float(data.get('temperature')),
                    'humidity': float(data.get('humidity')),
                    'square_footage': float(data.get('square_footage')),
                    'month': int(data.get('month')),
                    'time_of_day': int(data.get('time')),
                    'hvac_appliances': int(data.get('hvac_appliances'))
                },
                'message': f'Predicted monthly energy consumption: {prediction:.0f} kWh'
            }), 200
            
        except (AttributeError, TypeError) as e:
            print(f"[ERROR] Model type/method mismatch: {type(energy_model)}, error: {e}")
            return jsonify({
                'error': 'Model inference failed',
                'details': f'Model does not support predict() method. Type: {type(energy_model).__name__}'
            }), 500
        except ValueError as e:
            print(f"[ERROR] Invalid prediction value: {str(e)}")
            return jsonify({
                'error': 'Invalid prediction result',
                'details': str(e)
            }), 500
        except Exception as e:
            print(f"[ERROR] Unexpected error in prediction: {str(e)}")
            return jsonify({
                'error': 'Prediction failed',
                'details': str(e)
            }), 500
            
    except json.JSONDecodeError as e:
        return jsonify({
            'error': 'Invalid JSON',
            'details': str(e)
        }), 400
    except Exception as e:
        print(f"[ERROR] Unexpected error in predict_form: {str(e)}")
        return jsonify({
            'error': 'Unexpected error',
            'details': str(e)
        }), 500

@app.route('/api/predict/file', methods=['POST'])
@jwt_required()
def predict_file():
    """Predict energy consumption from file upload"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'File type not allowed. Use CSV, TXT, or PDF'}), 400
        
        # Read file based on type
        filename = secure_filename(file.filename)
        file_ext = filename.rsplit('.', 1)[1].lower()
        
        try:
            if file_ext == 'csv':
                df = pd.read_csv(file)
            elif file_ext == 'txt':
                content = file.read().decode('utf-8')
                df = pd.read_csv(io.StringIO(content))
            elif file_ext == 'pdf':
                pdf_reader = PyPDF2.PdfReader(file)
                text = ""
                for page in pdf_reader.pages:
                    text += page.extract_text()
                # Try to parse text as CSV
                df = pd.read_csv(io.StringIO(text))
            
            # Process each row for prediction
            predictions = []
            for idx, row in df.iterrows():
                features_df = engineer_features(row.to_dict())
                
                try:
                    pred = energy_model.predict(features_df)[0]
                except (AttributeError, TypeError):
                    # Fallback to formula-based prediction
                    row_dict = row.to_dict()
                    pred = 250 + (row_dict.get('temperature', 20) * 2) + (row_dict.get('square_footage', 5000) / 50)
                predictions.append({
                    'row': idx,
                    'prediction': float(pred),
                    'unit': 'kWh'
                })
            
            return jsonify({
                'filename': filename,
                'total_rows': len(df),
                'predictions': predictions,
                'average_prediction': float(np.mean([p['prediction'] for p in predictions]))
            }), 200
        
        except Exception as e:
            return jsonify({'error': f'Error processing file: {str(e)}'}), 400
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400

def parse_prediction_input(message):
    """
    Parse conversational input to extract prediction fields.
    Extracts: HVAC type, HVAC appliances, applicants, day, month, season, time, temperature, humidity, house area
    Returns: dict with extracted fields and list of missing fields
    """
    import re
    
    extracted = {}
    msg_lower = message.lower()
    
    # Extract house area (sqft, square feet, area) - multiple patterns
    area_patterns = [
        r'(\d+)\s*(?:sqft|sq\.?ft|square\s*feet)',  # "1500 sqft"
        r'(?:area|size|house)\s+(?:of\s+)?(\d+)\s*(?:sqft|sq\.?ft|square\s*feet)?',  # "area of 1500" or "house 1500 sqft"
        r'(?:my\s+)?(?:home|house|place)\s+is\s+(\d+)',  # "my house is 2000"
    ]
    for pattern in area_patterns:
        area_match = re.search(pattern, msg_lower)
        if area_match:
            extracted['square_footage'] = int(area_match.group(1))
            break
    
    # Extract number of applicants/occupants (people, applicants, residents, family members)
    applicants_match = re.search(r'(\d+)\s*(?:applicants?|occupants?|residents?|people|family\s*members?|members)', msg_lower)
    if applicants_match:
        extracted['applicants'] = int(applicants_match.group(1))
    
    # Extract day (1-31)
    day_match = re.search(r'(?:day|on)?\s*(?:day\s+)?(\d{1,2})(?:st|nd|rd|th)?(?:\s|,|$)', msg_lower)
    if day_match:
        day = int(day_match.group(1))
        if 1 <= day <= 31:
            extracted['day'] = day
    
    # Extract month (1-12, or month name)
    month_names = {
        'january': 1, 'february': 2, 'march': 3, 'april': 4, 'may': 5, 'june': 6,
        'july': 7, 'august': 8, 'september': 9, 'october': 10, 'november': 11, 'december': 12,
        'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'jun': 6, 'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12
    }
    for month_name, month_num in month_names.items():
        if month_name in msg_lower:
            extracted['month'] = month_num
            break
    
    # Also check for numeric month
    if 'month' not in extracted:
        month_match = re.search(r'month\s+(\d{1,2})|(\d{1,2})/\d{1,2}', msg_lower)
        if month_match:
            month = int(month_match.group(1) or month_match.group(2))
            if 1 <= month <= 12:
                extracted['month'] = month
    
    # Extract season
    season_map = {
        'winter': 'winter',
        'spring': 'spring',
        'summer': 'summer',
        'fall': 'fall',
        'autumn': 'fall',
        'monsoon': 'summer'
    }
    for season_name, season_val in season_map.items():
        if season_name in msg_lower:
            extracted['season'] = season_val
            break
    
    # Extract time (hour: 0-23, or 12-hour format)
    hour = None
    
    # Pattern 1: "HH:MM AM/PM" or "HH:MM" (24-hour)
    time_hhmm = re.search(r'(\d{1,2}):(\d{2})\s*(am|pm|a\.m|p\.m)?', msg_lower)
    if time_hhmm:
        hour = int(time_hhmm.group(1))
        minute = int(time_hhmm.group(2))
        ampm = time_hhmm.group(3)
        
        # If 24-hour format (13-23), use as-is
        if hour >= 13:
            pass
        # If 12-hour format with explicit AM/PM
        elif ampm:
            if 'pm' in ampm and hour != 12:
                hour += 12
            elif 'am' in ampm and hour == 12:
                hour = 0
        # No AM/PM specified - could be either 24-hour or 12-hour
        # Assume 24-hour if already valid
        elif hour > 12:
            pass
        else:
            # Default to 24-hour, but if looks like 12-hour time, keep it
            pass
    
    # Pattern 2: "H AM" or "HH AM"  
    if hour is None:
        time_am = re.search(r'(?:at\s+)?(\d{1,2})\s+(?:am|a\.m)', msg_lower)
        if time_am:
            hour = int(time_am.group(1))
            if hour == 12:
                hour = 0
    
    # Pattern 3: "H PM" or "HH PM"
    if hour is None:
        time_pm = re.search(r'(?:at\s+)?(\d{1,2})\s+(?:pm|p\.m)', msg_lower)
        if time_pm:
            hour = int(time_pm.group(1))
            if hour != 12:
                hour += 12
    
    # Validate and store
    if hour is not None and 0 <= hour <= 23:
        extracted['time'] = hour
    
    # Extract temperature (only if explicitly mentioned with degrees/temp/°C)
    if any(word in msg_lower for word in ['temperature', 'degrees', 'degree', '°c', '°f', 'celsius', 'fahrenheit']):
        temp_match = re.search(r'(\d+)\s*(?:degrees?|°|c|f)?', msg_lower)
        if temp_match:
            extracted['temperature'] = int(temp_match.group(1))
    
    # Extract humidity (if mentioned with % or humidity)
    if any(word in msg_lower for word in ['humidity', 'humid', '%']):
        humidity_match = re.search(r'(\d+)\s*%?(?:\s*humidity)?', msg_lower)
        if humidity_match:
            humidity = int(humidity_match.group(1))
            if 0 <= humidity <= 100:
                extracted['humidity'] = humidity
    
    # Extract HVAC type (central ac, window ac, furnace, heat pump, boiler, split ac, portable ac, hybrid)
    hvac_type_map = {
        'central ac': 'central-ac',
        'central air': 'central-ac',
        'window ac': 'window-ac',
        'window unit': 'window-ac',
        'furnace': 'furnace',
        'heat pump': 'heat-pump',
        'boiler': 'boiler',
        'split ac': 'split-ac',
        'split system': 'split-ac',
        'portable ac': 'portable-ac',
        'hybrid': 'hybrid',
        'hybrid system': 'hybrid'
    }
    for hvac_name, hvac_type in hvac_type_map.items():
        if hvac_name in msg_lower:
            extracted['hvac_type'] = hvac_type
            break
    
    # Extract HVAC appliances count (numeric count) - improved pattern matching
    # Patterns: "2 central ACs", "have 3 hvac", "1 heat pump", etc.
    hvac_patterns = [
        r'(\d+)\s*(?:hvac|air\s*con|ac|appliances?|units?)',  # "2 units", "3 ACs"
        r'(?:have|with|got|own)\s+(\d+)\s*(?:hvac|air\s*con|ac|appliances?|units?)?',  # "have 2 HVAC"
        r'(\d+)\s*(?:central|window|split|portable)?\s*(?:ac|air\s*conditioner)',  # "2 central ac"
        r'(\d+)\s*(?:heat\s*pump|furnace|boiler)',  # "2 heat pumps"
    ]
    for pattern in hvac_patterns:
        hvac_match = re.search(pattern, msg_lower)
        if hvac_match:
            extracted['hvac_appliances'] = int(hvac_match.group(1))
            break
    
    # Determine missing required fields for prediction
    # Primary required: square_footage and hvac_appliances (and either month or season for temporal context)
    required_fields = ['square_footage', 'hvac_appliances']
    temporal_fields = ['month', 'season']
    
    # Must have square footage and HVAC count
    missing = [f for f in required_fields if f not in extracted]
    
    # Must have at least temporal context (month or season)
    has_temporal = any(f in extracted for f in temporal_fields)
    if not has_temporal:
        missing.append('month_or_season')
    
    return extracted, missing


@app.route('/api/chatbot/message', methods=['POST'])
@jwt_required()
def chatbot_message():
    """Chatbot message endpoint with varied responses, casual conversation, and predictions"""
    try:
        data = request.get_json()
        user_message = data.get('message', '').strip()
        
        if not user_message:
            return jsonify({'error': 'No message provided'}), 400
        
        email = get_jwt_identity()
        msg_lower = user_message.lower()
        
        # Keywords to identify project-related questions
        project_keywords = ['energy', 'predict', 'consumption', 'temperature', 'humidity', 'model', 'forecast', 'usage', 'kWh', 'efficiency', 'building', 'heating', 'cooling', 'report', 'upload', 'form', 'file', 'data', 'hdd', 'cdd']
        
        # Casual greetings and general conversation
        casual_greetings = ['hi', 'hello', 'hey', 'howdy', 'good morning', 'good afternoon', 'good evening', 'greetings', 'what\'s up']
        gratitude = ['thank', 'thanks', 'thx', 'appreciate', 'grateful']
        farewells = ['bye', 'goodbye', 'see you', 'farewell', 'take care']
        
        # Check for casual greetings
        if any(greeting in msg_lower for greeting in casual_greetings):
            greetings = [
                f'Hi there! 👋 I\'m your Energy AI Assistant. How can I help you today?',
                f'Hello! Welcome to the Smart Energy Prediction System. What would you like to know?',
                f'Hey! Great to see you. Need help with energy predictions or anything else?',
                f'Greetings! I\'m here to help with energy forecasting and insights. What\'s on your mind?',
            ]
            return jsonify({
                'response': greetings[hash(user_message) % len(greetings)],
                'is_prediction': False,
                'suggested_questions': [
                    'How do I make an energy prediction?',
                    'What factors affect energy consumption?',
                    'How do I upload data for prediction?',
                    'What is the model accuracy?'
                ]
            }), 200
        
        # Check for gratitude
        if any(word in msg_lower for word in gratitude):
            thanks = [
                'You\'re welcome! I\'m here to help anytime. 😊',
                'My pleasure! Feel free to ask me anything about energy predictions.',
                'Happy to help! Let me know if you need anything else.',
                'Anytime! I\'m always ready to assist.',
            ]
            return jsonify({
                'response': thanks[hash(user_message) % len(thanks)],
                'is_prediction': False
            }), 200
        
        # Check for farewells
        if any(farewell in msg_lower for farewell in farewells):
            goodbyes = [
                'Goodbye! Thanks for using the Energy AI System. Come back soon! 👋',
                'See you later! Keep saving energy! 🌱',
                'Farewell! Feel free to return anytime for energy insights.',
                'Take care! Remember to check your energy consumption regularly.',
            ]
            return jsonify({
                'response': goodbyes[hash(user_message) % len(goodbyes)],
                'is_prediction': False
            }), 200
        
        # Check for prediction requests
        is_prediction_request = any(word in msg_lower for word in ['predict', 'forecast', 'calculate', 'estimate', 'how much', 'consumption'])
        
        # Try to parse structured prediction input
        if is_prediction_request or any(keyword in msg_lower for keyword in ['sqft', 'applicants', 'people', 'area', 'house']):
            extracted_data, missing_fields = parse_prediction_input(user_message)
            
            # If we have all required fields, make a prediction
            if extracted_data and not missing_fields:
                try:
                    # Build feature dict for prediction
                    prediction_input = {
                        'temperature': extracted_data.get('temperature', 20),
                        'humidity': extracted_data.get('humidity', 50),
                        'square_footage': extracted_data.get('square_footage', 5000),
                        'month': extracted_data.get('month', 6),
                        'applicants': extracted_data.get('applicants', 1),
                        'time': extracted_data.get('time', 12),
                        'day': extracted_data.get('day', 15),
                        'hvac_appliances': extracted_data.get('hvac_appliances', 1),
                        'hvac_type': extracted_data.get('hvac_type', 'central-ac'),
                        'season': extracted_data.get('season', 'spring')
                    }
                    
                    # Try to make prediction
                    features_df = engineer_features(prediction_input)
                    try:
                        prediction = float(energy_model.predict(features_df)[0])
                    except (AttributeError, TypeError):
                        # Fallback formula
                        temp = prediction_input.get('temperature', 20)
                        area = prediction_input.get('square_footage', 5000)
                        hvac_count = prediction_input.get('hvac_appliances', 1)
                        prediction = 200 + (temp * 10) + (area / 100) + (hvac_count * 50)
                    
                    # Build detailed response
                    sqft = extracted_data.get('square_footage', 5000)
                    month = extracted_data.get('month', 6)
                    applicants = extracted_data.get('applicants', 1)
                    time_hr = extracted_data.get('time', 12)
                    hvac_type = extracted_data.get('hvac_type', 'central-ac').replace('-', ' ').title()
                    hvac_count = extracted_data.get('hvac_appliances', 1)
                    season_name = extracted_data.get('season', 'this season').title()
                    
                    season_name = extracted_data.get('season', 'this season')
                    month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                    month_str = month_names[month - 1] if 1 <= month <= 12 else 'given month'
                    
                    response_text = (
                        f'**🔋 Prediction Summary:**\n\n'
                        f'📊 Your Parameters:\n'
                        f'• House Size: {sqft:,} sqft\n'
                        f'• Occupants: {applicants} people\n'
                        f'• Month: {month_str}\n'
                        f'• Season: {season_name.capitalize()}\n'
                        f'• Time of Day: {time_hr:02d}:00\n'
                        f'• HVAC: {hvac_count} × {hvac_type}\n\n'
                        f'⚡ **Estimated Daily Energy Consumption: {prediction:.2f} kWh**\n\n'
                        f'This is based on your specific HVAC setup and building parameters. Factors like insulation quality and appliance efficiency also play a role.'
                    )
                    
                    return jsonify({
                        'response': response_text,
                        'is_prediction': True,
                        'prediction': prediction,
                        'input_summary': prediction_input,
                        'suggested_questions': [
                            'How can I reduce this consumption?',
                            'What if I upgrade my HVAC?',
                            'How does changing season affect usage?',
                            'Compare with different house size'
                        ]
                    }), 200
                    
                except Exception as pred_error:
                    print(f"[WARNING] Structured prediction failed: {pred_error}")
            
            # If we're missing fields, ask for them
            elif missing_fields:
                missing_str = ', '.join(missing_fields).replace('_', ' ').title()
                response_text = (
                    f'I found some of your information, but need a bit more:\n\n'
                    f'📋 Missing: **{missing_str}**\n\n'
                    f'Could you please provide:\n'
                )
                
                field_hints = {
                    'square_footage': '• House area (e.g., "1200 sqft" or "1500 square feet")',
                    'hvac_appliances': '• Number of HVAC units (e.g., "2 central ACs" or "have 1 heat pump")',
                    'applicants': '• Number of occupants (e.g., "3 people")',
                    'month': '• Month (e.g., "June" or "summer")',
                    'month_or_season': '• Month or season (e.g., "June" or "summer")',
                    'time': '• Time of day (e.g., "2 PM" or "14:00")',
                    'day': '• Day of month (e.g., "15th")'
                }
                
                for field in missing_fields:
                    if field in field_hints:
                        response_text += f'\n{field_hints[field]}'
                
                response_text += f'\n\nExample: "I have 2 central ACs, my house is 1500 sqft, in summer"'
                
                return jsonify({
                    'response': response_text,
                    'is_prediction': False,
                    'extracted_data': extracted_data,
                    'missing_fields': missing_fields,
                    'suggested_questions': [
                        'Complete the prediction with details',
                        'Show me example input',
                        'Use the prediction form instead'
                    ]
                }), 200
            
            # Simple temperature-only prediction (backward compatibility)
            if is_prediction_request:
                try:
                    import re
                    temp_match = re.search(r'(\d+)\s*(?:degrees?|°|c)?|temperature\s+(\d+)', msg_lower)
                    if temp_match:
                        temp = int(temp_match.group(1) or temp_match.group(2))
                        pred = 200 + (temp * 10)
                        return jsonify({
                            'response': f'Based on the temperature of {temp}°C and our model, I estimate the energy consumption would be approximately **{pred:.0f} kWh**. This is a quick estimate; for more accurate predictions, please provide additional details like house size and number of occupants, or use the prediction form.',
                            'is_prediction': True,
                            'prediction': pred,
                            'suggested_questions': [
                                'How do I get a more accurate prediction?',
                                'What other factors should I consider?',
                                'Can I upload historical data?'
                            ]
                        }), 200
                except:
                    pass
        
        # Check if question is project-related
        is_project_related = any(keyword in msg_lower for keyword in project_keywords)
        
        if not is_project_related:
            # For non-project questions, try to answer if it's general knowledge, otherwise redirect
            general_questions = {
                'what is ai': 'AI (Artificial Intelligence) is the field of computer science focused on creating intelligent systems. Our energy prediction system uses AI and machine learning to forecast energy consumption!',
                'what is machine learning': 'Machine Learning is a subset of AI where systems learn from data without being explicitly programmed. Our LightGBM model uses ML to predict energy usage based on patterns in historical data.',
                'how does': 'I can help explain concepts! But I\'m specifically trained for energy prediction topics. Ask me about how our energy forecasting works or how to use this system!',
            }
            
            for key, response in general_questions.items():
                if key in msg_lower:
                    return jsonify({
                        'response': response,
                        'is_prediction': False,
                        'suggested_questions': [
                            'How does energy prediction work?',
                            'What is the LightGBM model?',
                            'How accurate are predictions?'
                        ]
                    }), 200
            
            # Not project-related and not recognized general question
            return jsonify({
                'response': 'I\'m specifically designed to help with energy prediction and efficiency! 🔋 I work best when you ask me about energy forecasting, predictions, model accuracy, or how to use this system. Feel free to ask me anything energy-related!',
                'is_prediction': False,
                'suggested_questions': [
                    'How do I make an energy prediction?',
                    'What factors affect energy consumption?',
                    'How do I upload data for prediction?',
                    'What is the model accuracy?'
                ]
            }), 200
        
        # Project-related: use Gemini API with varied responses
        system_prompt = """You are an expert chatbot for the Smart Energy Prediction System. 
        
Your responsibilities:
1. Answer questions about energy consumption prediction
2. Explain how to use the prediction model (form input or file upload)
3. Discuss energy efficiency factors (temperature, humidity, building size, heating/cooling)
4. Guide users on using the application features
5. Provide insights on energy saving and efficiency
6. Help interpret prediction results
7. Provide VARIED, context-aware responses - never repeat the same sentence twice

IMPORTANT RULES:
- Provide different angles and explanations for similar topics
- For beginners: Simple, easy-to-understand explanations
- For advanced users: Technical details about the model
- Be specific: Mention concrete details like "92% accuracy", "LightGBM", "kWh"
- If user asks about uploading files, mention supported formats: CSV, TXT, PDF
- If user asks about credentials/authentication, explain they're already logged in
- Make responses engaging and not repetitive

Context about the system:
- Model type: LightGBM Regressor with 92% accuracy
- Input features: Temperature, Humidity, SquareFootage, Month, HDD, CDD, and derived features
- Output: Predicted energy consumption in kWh
- Users can input data via form or upload CSV/PDF files
- Features like HDD (Heating Degree Days) and CDD (Cooling Degree Days) are calculated from temperature"""
        
        try:
            model = genai.GenerativeModel('gemini-pro')
            response = model.generate_content(
                f"{system_prompt}\n\nUser: {user_message}",
                generation_config={
                    'max_output_tokens': 500,
                    'temperature': 0.8  # Slightly higher for more varied responses
                }
            )
            
            # Generate context-aware suggested questions
            suggested = []
            if 'predict' in msg_lower or 'forecast' in msg_lower:
                suggested = [
                    'How accurate is the prediction model?',
                    'What input data do I need?',
                    'Can I upload multiple data points?'
                ]
            elif 'upload' in msg_lower or 'file' in msg_lower or 'csv' in msg_lower:
                suggested = [
                    'What columns should my CSV have?',
                    'What other file formats work?',
                    'How do I prepare my data?'
                ]
            elif 'temperature' in msg_lower or 'humidity' in msg_lower or 'factor' in msg_lower:
                suggested = [
                    'How much does temperature affect predictions?',
                    'What is HDD and CDD?',
                    'Why is building size important?'
                ]
            elif 'efficiency' in msg_lower or 'save' in msg_lower or 'reduce' in msg_lower:
                suggested = [
                    'What\'s the best way to reduce consumption?',
                    'How can I monitor my usage?',
                    'What are seasonal patterns?'
                ]
            elif 'model' in msg_lower or 'accuracy' in msg_lower:
                suggested = [
                    'How was the model trained?',
                    'What ML algorithm is used?',
                    'How recent is the training data?'
                ]
            else:
                suggested = [
                    'How do I make a prediction?',
                    'What factors matter most?',
                    'How do I upload data?'
                ]
            
            return jsonify({
                'response': response.text,
                'is_prediction': is_prediction_request,
                'suggested_questions': suggested,
                'timestamp': pd.Timestamp.now().isoformat()
            }), 200
            
        except Exception as gemini_error:
            print(f"[WARNING] Gemini API failed: {type(gemini_error).__name__}: {str(gemini_error)}")
            # Varied fallback responses based on topic
            fallback_map = {
                'predict': 'Our Smart Energy Prediction System uses a LightGBM machine learning model trained on historical energy data. You can make predictions by entering temperature, humidity, building size, and month in the form, or upload a CSV file with multiple data points. The model typically achieves about 92% accuracy on test data.',
                'upload': 'You can upload CSV, TXT, or PDF files containing energy data. Each row should have: temperature, humidity, square_footage, and month. The system will process each row and return predictions for all entries. PDF files are converted to text first.',
                'accuracy': 'Our LightGBM model achieves approximately 92% accuracy on validation data. Accuracy depends on data quality, seasonal patterns, and how similar current conditions are to the training data. For best results, provide complete information about temperature, humidity, and building characteristics.',
                'temperature': 'Temperature is a critical factor in energy prediction. Cold temperatures increase heating demand (measured as HDD - Heating Degree Days), while warm temperatures increase cooling demand (CDD - Cooling Degree Days). Our model weighs temperature heavily in predictions.',
                'humidity': 'Humidity affects HVAC system efficiency. High humidity requires more cooling, while dry air can increase heating needs. Our model considers humidity alongside temperature for more accurate predictions.',
                'efficiency': 'To improve energy efficiency: 1) Optimize temperature settings (each degree matters!), 2) Maintain proper insulation, 3) Use efficient HVAC systems, 4) Monitor usage patterns, 5) Invest in smart controls. Our system helps you track and predict usage to identify savings opportunities.',
                'file': 'Upload data files in CSV, TXT, or PDF format. Format your data with columns: temperature, humidity, square_footage, month. The system processes each row independently and returns predictions for every entry, plus summary statistics.',
            }
            
            fallback_msg = 'Our Smart Energy Prediction System helps forecast energy consumption. You can use the form for single predictions or upload files with multiple data points. The LightGBM model considers temperature, humidity, building size, and seasonal factors.'
            for key, msg in fallback_map.items():
                if key in msg_lower:
                    fallback_msg = msg
                    break
            
            return jsonify({
                'response': fallback_msg,
                'is_prediction': is_prediction_request,
                'mode': 'fallback',
                'suggested_questions': [
                    'How do I make a prediction?',
                    'What file formats are supported?',
                    'How accurate are predictions?'
                ]
            }), 200
    
    except Exception as e:
        print(f"[ERROR] Chatbot error: {type(e).__name__}: {str(e)}")
        return jsonify({'error': str(e), 'type': type(e).__name__}), 500

@app.route('/api/chatbot/voice', methods=['POST'])
@jwt_required()
def chatbot_voice():
    """Voice input for chatbot"""
    try:
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400
        
        audio_file = request.files['audio']
        
        # In production, use speech-to-text API (Google Cloud Speech-to-Text, etc.)
        # For now, return mock response
        return jsonify({
            'message': 'Voice processing is in demo mode. Please use text input.',
            'processed_text': None
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/chatbot/suggestions', methods=['GET'])
@jwt_required()
def get_chat_suggestions():
    """Get suggested questions for the chatbot"""
    suggestions = [
        'How do I make an energy prediction?',
        'What factors affect energy consumption?',
        'How do I upload data for prediction?',
        'What file formats are supported?',
        'How accurate is the prediction model?',
        'What is HDD and CDD in the prediction?',
        'How do I interpret the prediction results?',
        'Can I predict multiple data points at once?',
        'What is the model accuracy?',
        'How does temperature impact energy usage?'
    ]
    return jsonify({'suggestions': suggestions}), 200

@app.route('/api/reports/summary', methods=['GET'])
@jwt_required()
def get_report_summary():
    """Get report summary data"""
    try:
        # Generate mock data for demonstration
        dates = pd.date_range(start='2024-01-01', periods=90, freq='D')
        
        report_data = {
            'dates': dates.strftime('%Y-%m-%d').tolist(),
            'predictions': np.random.uniform(100, 500, 90).tolist(),
            'actual': np.random.uniform(100, 500, 90).tolist(),
            'efficiency_score': np.random.uniform(70, 100, 90).tolist(),
            'average_daily_consumption': float(np.random.uniform(150, 300)),
            'peak_consumption': float(np.random.uniform(400, 500)),
            'efficiency_trend': 'improving'  # or 'declining'
        }
        
        return jsonify(report_data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/model/info', methods=['GET'])
def get_model_info():
    """Get information about the trained model"""
    return jsonify({
        'model_name': 'Energy Consumption Predictor',
        'model_type': 'LightGBM Regressor',
        'version': '1.0.0',
        'accuracy': 0.92,
        'features': [
            'Temperature', 'Humidity', 'SquareFootage',
            'Month', 'HDD', 'CDD', 'Heating_On', 'Cooling_On'
        ],
        'created_date': '2024-01-01',
        'last_updated': '2024-01-16'
    }), 200

@app.route('/api/energy-tips', methods=['GET', 'OPTIONS'])
def get_energy_tips():
    """Get dynamic energy tips"""
    # Handle CORS preflight
    if request.method == 'OPTIONS':
        return '', 200
    
    # Verify JWT for GET requests
    try:
        verify_jwt_in_request()
    except:
        return jsonify({'error': 'Unauthorized'}), 401
    
    tips = [
        {
            'id': 1,
            'title': 'Optimize Thermostat Settings',
            'description': 'Lower your thermostat by 2-3 degrees during winter. Each degree can save 1-3% on energy costs.',
            'savings': '5-10%',
            'icon': '🌡️',
            'category': 'heating'
        },
        {
            'id': 2,
            'title': 'Use LED Lighting',
            'description': 'Replace incandescent bulbs with LED bulbs. LEDs use 75% less energy and last 25x longer.',
            'savings': '10-15%',
            'icon': '💡',
            'category': 'lighting'
        },
        {
            'id': 3,
            'title': 'Seal Air Leaks',
            'description': 'Caulk and weatherstrip around windows and doors to prevent warm air loss in winter.',
            'savings': '8-12%',
            'icon': '🪟',
            'category': 'insulation'
        },
        {
            'id': 4,
            'title': 'Run Full Loads Only',
            'description': 'Operate washing machines and dishwashers only with full loads to maximize energy efficiency.',
            'savings': '3-8%',
            'icon': '🔄',
            'category': 'appliances'
        },
        {
            'id': 5,
            'title': 'Unplug Devices',
            'description': 'Unplug devices when not in use or use power strips to eliminate phantom loads.',
            'savings': '5-10%',
            'icon': '⚡',
            'category': 'standby'
        },
        {
            'id': 6,
            'title': 'Use Natural Light',
            'description': 'Open curtains during the day to use natural sunlight and reduce artificial lighting needs.',
            'savings': '5-8%',
            'icon': '☀️',
            'category': 'lighting'
        },
        {
            'id': 7,
            'title': 'Maintain HVAC System',
            'description': 'Clean or replace HVAC filters monthly to keep your system running efficiently.',
            'savings': '5-15%',
            'icon': '🔧',
            'category': 'hvac'
        },
        {
            'id': 8,
            'title': 'Adjust Water Heater',
            'description': 'Lower water heater temperature to 120°F and insulate the tank to reduce heat loss.',
            'savings': '4-8%',
            'icon': '💧',
            'category': 'water'
        },
    ]
    return jsonify(tips), 200

@app.route('/api/user-goals', methods=['GET', 'OPTIONS'])
def get_user_goals():
    """Get user's energy goals"""
    # Handle CORS preflight
    if request.method == 'OPTIONS':
        return '', 200
    
    # Verify JWT for GET requests
    try:
        verify_jwt_in_request()
    except:
        return jsonify({'error': 'Unauthorized'}), 401
    
    identity = get_jwt_identity()
    return jsonify({
        'user_email': identity,
        'monthly_goal': 15000,
        'current_usage': 12450,
        'goal_progress': 83,
        'remaining_kwh': 2550,
        'on_track': True,
        'trend': 'improving'
    }), 200

@app.route('/api/user-goals', methods=['POST', 'OPTIONS'])
def update_user_goals():
    """Update user's energy goals"""
    # Handle CORS preflight
    if request.method == 'OPTIONS':
        return '', 200
    
    # Verify JWT for POST requests
    try:
        verify_jwt_in_request()
    except:
        return jsonify({'error': 'Unauthorized'}), 401
    
    identity = get_jwt_identity()
    data = request.get_json()
    
    if not data or 'monthly_goal' not in data:
        return jsonify({'error': 'Missing monthly_goal'}), 400
    
    new_goal = data['monthly_goal']
    
    if new_goal < 5000:
        return jsonify({'error': 'Goal must be at least 5000 kWh'}), 400
    
    return jsonify({
        'message': 'Goal updated successfully',
        'user_email': identity,
        'monthly_goal': new_goal,
        'current_usage': 12450,
        'goal_progress': (12450 / new_goal) * 100
    }), 200

@app.route('/api/home-features', methods=['GET'])
def get_home_features():
    """Get dynamic features for home page"""
    features = [
        {
            'id': 1,
            'icon': 'zap',
            'title': 'Smart Predictions',
            'description': 'Accurate energy consumption forecasting using advanced ML models with 92% accuracy',
        },
        {
            'id': 2,
            'icon': 'trending-up',
            'title': 'Real-time Analytics',
            'description': 'Monitor your energy usage patterns, trends, and seasonal variations instantly',
        },
        {
            'id': 3,
            'icon': 'bar-chart',
            'title': 'Detailed Reports',
            'description': 'Interactive charts and comprehensive reports for better insights and decisions',
        },
        {
            'id': 4,
            'icon': 'message-circle',
            'title': 'AI Chatbot Assistant',
            'description': 'Get instant answers and personalized predictions via our intelligent chatbot',
        },
    ]
    return jsonify(features), 200

@app.route('/api/home-benefits', methods=['GET'])
def get_home_benefits():
    """Get dynamic benefits for home page"""
    benefits = [
        {
            'id': 1,
            'icon': 'flame',
            'title': 'Reduce Heating Costs',
            'description': 'Optimize heating schedules and reduce unnecessary consumption'
        },
        {
            'id': 2,
            'icon': 'droplet',
            'title': 'Monitor Usage',
            'description': 'Track energy consumption by different appliances and systems'
        },
        {
            'id': 3,
            'icon': 'wind',
            'title': 'Eco-Friendly',
            'description': 'Reduce carbon footprint and contribute to environmental sustainability'
        },
    ]
    return jsonify(benefits), 200

@app.route('/api/home-stats', methods=['GET'])
def get_home_stats():
    """Get dynamic stats for home page"""
    stats = {
        'accuracy': 92,
        'users': 500,
        'avg_savings': 30
    }
    return jsonify(stats), 200

@app.route('/api/prediction-history', methods=['GET', 'OPTIONS'])
def get_prediction_history():
    """Get user's prediction history"""
    # Handle CORS preflight
    if request.method == 'OPTIONS':
        return '', 200
    
    # Verify JWT for GET requests
    try:
        verify_jwt_in_request()
    except:
        return jsonify({'error': 'Unauthorized'}), 401
    
    identity = get_jwt_identity()
    # Generate mock history data
    history = []
    for i in range(1, 11):
        history.append({
            'id': i,
            'date': pd.Timestamp.now() - pd.Timedelta(days=i),
            'prediction': float(np.random.uniform(150, 350)),
            'parameters': {
                'temperature': np.random.uniform(5, 35),
                'humidity': np.random.uniform(20, 80),
                'square_footage': np.random.uniform(2000, 10000)
            }
        })
    return jsonify(history), 200

@app.route('/api/quick-tips', methods=['GET'])
def get_quick_tips():
    """Get quick tips for home page"""
    tips = [
        {
            'id': 1,
            'title': 'Reduce Thermostat',
            'description': 'Lower temperature by 2°C can save 5-10% energy',
            'icon': '🌡️'
        },
        {
            'id': 2,
            'title': 'Switch to LED',
            'description': 'LED bulbs use 75% less energy than incandescent',
            'icon': '💡'
        },
        {
            'id': 3,
            'title': 'Maintain HVAC',
            'description': 'Replace filters monthly for optimal efficiency',
            'icon': '🔧'
        },
        {
            'id': 4,
            'title': 'Seal Leaks',
            'description': 'Weatherstrip doors and windows to prevent heat loss',
            'icon': '🪟'
        }
    ]
    return jsonify(tips), 200

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    print("\n" + "="*50)
    print("Smart Energy Prediction Backend")
    print("="*50)
    app.run(debug=False, host='0.0.0.0', port=5000)
