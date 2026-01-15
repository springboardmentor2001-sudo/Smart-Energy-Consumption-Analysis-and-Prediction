from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import numpy as np
import joblib
import os
import json
from datetime import timedelta
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

app = Flask(__name__)
# Enable CORS for all domains, specifically allowing headers for axios
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# --- Configuration & Global Data ---
SETTINGS_FILE = os.path.join(os.path.dirname(__file__), 'settings.json')
DATASET_PATH = os.path.join(os.path.dirname(__file__), 'Dataset', 'Energy_consumption.csv')
MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'Models', 'lgb_model_clean.pkl')

df = None
model = None

# Default Settings
DEFAULT_SETTINGS = {
    "profile": {
        "name": "Rahul Rai",
        "email": "rahul@infosys.com",
        "phone": "+91 98765 43210",
        "role": "Admin"
    },
    "energy": {
        "squareFootage": 1500,
        "occupants": 4,
        "budgetLimit": 5000,
        "currency": "INR",
        "baseLoad": 12,
        "electricityRate": 9.0,
        "residential_factor": 0.02 # Default scaling factor
    },
    "preferences": {
        "theme": "dark",
        "notifications": True,
        "emailReports": True,
        "dataSharing": False,
        "compactMode": False
    }
}

# --- Helper Functions ---

def load_data():
    global df
    try:
        if os.path.exists(DATASET_PATH):
            df = pd.read_csv(DATASET_PATH)
            df['Timestamp'] = pd.to_datetime(df['Timestamp'])
            print(f"Dataset loaded successfully: {len(df)} records")
        else:
            print(f"Error: Dataset not found at {DATASET_PATH}")
            df = pd.DataFrame() # Empty fallback
    except Exception as e:
        print(f"Error loading dataset: {e}")
        df = pd.DataFrame()

def load_model():
    global model
    try:
        model = joblib.load(MODEL_PATH)
        print("Model loaded successfully")
    except Exception as e:
        print(f"Error loading model: {e}")
        model = None

def get_settings():
    if os.path.exists(SETTINGS_FILE):
        try:
            with open(SETTINGS_FILE, 'r') as f:
                return json.load(f)
        except:
            return DEFAULT_SETTINGS
    return DEFAULT_SETTINGS

def save_settings(new_settings):
    try:
        with open(SETTINGS_FILE, 'w') as f:
            json.dump(new_settings, f, indent=4)
        return True
    except Exception as e:
        print(f"Error saving settings: {e}")
        return False

# Initialize
load_data()
load_model()

# --- Gemini AI Setup ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    print("Warning: GEMINI_API_KEY not found in .env. AI assistant features will be unavailable.")
    gemini_model = None
else:
    genai.configure(api_key=GEMINI_API_KEY)
    gemini_model = genai.GenerativeModel('gemini-1.5-flash')

# --- Prediction Helper ---
def calculate_energy_prediction(data, use_scaling=True):
    if model is None:
        raise Exception("Model not loaded")

    input_data = {
        'Temperature': float(data.get('Temperature', 25)),
        'Humidity': float(data.get('Humidity', 50)),
        'SquareFootage': float(data.get('SquareFootage', 1500)),
        'Occupancy': int(data.get('Occupancy', 1)),
        'HVACUsage': 1 if data.get('HVACUsage') in ['On', True, 1] else 0,
        'LightingUsage': 1 if data.get('LightingUsage') in ['On', True, 1] else 0,
        'RenewableEnergy': float(data.get('RenewableEnergy', 0)),
        'DayOfWeek': data.get('DayOfWeek', 'Monday'),
        'Holiday': 1 if data.get('Holiday') in ['Yes', True, 1] else 0,
        'Timestamp': pd.to_datetime(data.get('Timestamp', pd.Timestamp.now()))
    }
    
    df_input = pd.DataFrame([input_data])
    
    # Derived features
    df_input['hour'] = df_input['Timestamp'].dt.hour
    df_input['weekday'] = df_input['Timestamp'].dt.weekday
    df_input['month'] = df_input['Timestamp'].dt.month
    df_input['is_day'] = df_input['hour'].apply(lambda x: 1 if 6 <= x < 18 else 0)
    
    df_input['temp_hvac_interaction'] = df_input['Temperature'] * df_input['HVACUsage']
    df_input['humidity_hvac_interaction'] = df_input['Humidity'] * df_input['HVACUsage']
    
    df_input['DayOfWeek'] = df_input['DayOfWeek'].astype('category')
    
    selected_features = [
        'Temperature', 'Humidity', 'SquareFootage', 'Occupancy',
        'HVACUsage', 'LightingUsage', 'RenewableEnergy',
        'DayOfWeek', 'Holiday', 'hour', 'weekday', 'month', 'is_day',
        'temp_hvac_interaction', 'humidity_hvac_interaction'
    ]
    
    X = df_input[selected_features]
    prediction_raw = model.predict(X)[0]
    
    # Apply Scaling
    settings = get_settings()
    factor = float(settings['energy'].get('residential_factor', 0.02)) if use_scaling else 1.0
    prediction = prediction_raw * factor
    
    return prediction, input_data

# --- Gemini Configuration ---
gemini_model = genai.GenerativeModel(
    "gemini-flash-latest",
    system_instruction=(
        "You are a Smart Energy Assistant. "
        "Your responsibilities:\n"
        "1) Answer energy-related questions.\n"
        "2) PREDICTION capability: If the user asks to predict/forecast energy and provides specific parameters (like Temperature, Humidity, Area, Occupancy), "
        "DO NOT guess. Instead, output a JSON object prefixed with 'PREDICT_JSON:' containing the parameters. "
        "Format: PREDICT_JSON: {\"Temperature\": 25, \"Humidity\": 50, \"SquareFootage\": 1500, \"Occupancy\": 2, \"HVACUsage\": \"On\", \"LightingUsage\": \"Off\", \"RenewableEnergy\": 0, \"Holiday\": \"No\"}. "
        "Use reasonable defaults for missing values (Temp=25, Hum=50, Area=1500, Occ=2, HVAC=On, Light=On). "
        "Wait for the system to provide the calculated value, then explain it.\n"
        "3) If no parameters are provided, give a general advice or ask for inputs."
    )
)

def generate_ai_response(prompt: str) -> str:
    if not GEMINI_API_KEY:
        return "Error: GEMINI_API_KEY not found"

    try:
        # 1. First Pass: Check intent & parameters
        chat = gemini_model.start_chat(history=[])
        response = chat.send_message(prompt)
        text_response = response.text.strip()

        # 2. Check for Prediction Command
        if "PREDICT_JSON:" in text_response:
            try:
                json_str = text_response.replace("PREDICT_JSON:", "").strip()
                # Clean up potential markdown formatting
                json_str = json_str.replace("```json", "").replace("```", "").strip()
                params = json.loads(json_str)
                
                # 3. Run ML Model
                prediction_val, used_params = calculate_energy_prediction(params, use_scaling=True) # Default to scaling for chat
                
                # 4. Second Pass: Generate Explanation
                follow_up = (
                    f"The ML model calculated a prediction of {prediction_val:.2f} kWh for the provided parameters: {used_params}. "
                    "Please present this result to the user and give 2 brief efficiency tips based on these conditions."
                )
                final_response = chat.send_message(follow_up)
                return final_response.text.strip()
                
            except Exception as e:
                return f"Error running prediction model: {str(e)}"
        
        return text_response

    except Exception as e:
        return f"Gemini Error: {str(e)}"

# --- Helper Variables ---
# Kept for reference or fallback, but logic now uses settings
RESIDENTIAL_FACTOR = 0.02

@app.route('/api/settings', methods=['GET', 'POST'])
def handle_settings():
    if request.method == 'GET':
        return jsonify(get_settings())
    
    if request.method == 'POST':
        new_settings = request.json
        if save_settings(new_settings):
            return jsonify({"status": "success", "settings": new_settings})
        return jsonify({"error": "Failed to save settings"}), 500

@app.route('/api/summary', methods=['GET'])
def get_summary():
    if df is None or df.empty:
        return jsonify({
            "current_usage": 0, "today_consumption": 0,
            "monthly_consumption": 0, "cost_estimate": 0,
            "efficiency_score": 0
        })

    # Get the latest data point
    latest = df.iloc[-1]
    
    # Calculate Today's Consumption (Last 24 records)
    last_24h = df.tail(24)
    raw_today = last_24h['EnergyConsumption'].sum()
    
    # Estimate Monthly
    raw_monthly = df['EnergyConsumption'].sum() if len(df) < 720 else df.tail(720)['EnergyConsumption'].sum()
    
    # Apply Residential Scaling (Using settings now)
    settings = get_settings()
    # For summary, we always use the Residential scaling because it's the dashboard view
    factor = float(settings['energy'].get('residential_factor', 0.02))
    
    current_usage = latest['EnergyConsumption'] * factor
    today_consumption = raw_today * factor
    monthly_consumption = raw_monthly * factor
    
    # Cost Config
    rate = float(settings['energy'].get('electricityRate', 9.0))
    
    today_cost = today_consumption * rate
    # For monthly cost, we project if we don't have enough data, or just use the sum
    # If using tail(720) which is 30 days * 24h, it's accurate.
    monthly_cost = monthly_consumption * rate

    # Efficiency Score Logic (100 - relative usage intensity)
    # Assume distinct "efficient" daily usage is around 30kWh.
    # Score = 100 - (Excess over 15) * 2? 
    # Let's simple inverse: 50kWh -> 50 score. 20kWh -> 80 score.
    # Formula: 100 - (today_consumption - 10) * 1.5, clamped 0-100
    efficiency_score = max(0, min(100, 100 - int((today_consumption - 15) * 2)))

    return jsonify({
        "current_usage": round(current_usage, 2),
        "today_consumption": round(today_consumption, 2),
        "monthly_consumption": round(monthly_consumption, 2),
        "today_cost": round(today_cost, 2),
        "monthly_cost": round(monthly_cost, 2),
        "efficiency_score": int(efficiency_score),
        "unit_rate": rate,
        "currency": settings['energy'].get('currency', 'INR')
    })

@app.route('/api/chart-data', methods=['GET'])
def get_chart_data():
    if df is None or df.empty:
        return jsonify([])
    
    # Return last 24 hours
    data = df.tail(24).copy()
    settings = get_settings()
    factor = float(settings['energy'].get('residential_factor', 0.02))
    
    chart_data = []
    for _, row in data.iterrows():
        ts = row['Timestamp']
        chart_data.append({
            "name": ts.strftime('%H:%M'),
            "full_date": ts.isoformat(),
            "value": round(row['EnergyConsumption'] * factor, 2),
            "temp": round(row['Temperature'], 1)
        })
        
    return jsonify(chart_data)

@app.route('/api/device-usage', methods=['GET'])
def get_device_usage():
    if df is None or df.empty:
        return jsonify([])

    latest = df.iloc[-1]
    settings = get_settings()
    factor = float(settings['energy'].get('residential_factor', 0.02))
    
    # Apply scaling to total load
    total_load = latest['EnergyConsumption'] * factor
    
    hvac_status = latest.get('HVACUsage', 'Off')
    light_status = latest.get('LightingUsage', 'Off')
    
    weights = {'Fridge': 30, 'TV': 15, 'Others': 15}
    if hvac_status == 'On' or hvac_status == 1: weights['HVAC'] = 150
    else: weights['HVAC'] = 10
        
    if light_status == 'On' or light_status == 1: weights['Lights'] = 40
    else: weights['Lights'] = 5
        
    total_weight = sum(weights.values())
    
    usage_data = []
    for device, weight in weights.items():
        kwh = (weight / total_weight) * total_load
        
        # Simple trend simulation
        prev = df.iloc[-2] if len(df) > 1 else latest
        prev_load = prev['EnergyConsumption']
        trend = "stable"
        if latest['EnergyConsumption'] > prev_load * 1.05: trend = "up"
        elif latest['EnergyConsumption'] < prev_load * 0.95: trend = "down"
        
        usage_data.append({
            "name": device,
            "value": round(kwh, 2),
            "trend": trend
        })
        
    usage_data.sort(key=lambda x: x['value'], reverse=True)
    return jsonify(usage_data)

@app.route('/api/predict-energy', methods=['POST'])
def predict_energy():
    if model is None:
        return jsonify({"error": "Model not loaded"}), 500

    try:
        data = request.json
        use_scaling = data.get('use_scaling', True) # Default true
        prediction, _ = calculate_energy_prediction(data, use_scaling=use_scaling)
        
        # --- Gemini Analysis ---
        analysis_prompt = (
            f"Context: Daily energy use is {prediction:.2f} kWh. "
            f"Temp: {data.get('Temperature')}C. Devices: HVAC {data.get('HVACUsage')}. "
            f"Give 2 brief tips to save energy."
        )
        ai_analysis = generate_ai_response(analysis_prompt)

        return jsonify({
            "predicted_energy_consumption": prediction,
            "ai_analysis": ai_analysis
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/predict-batch', methods=['POST'])
def predict_batch():
    if model is None:
        return jsonify({"error": "Model not loaded"}), 500

    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    try:
        df_batch = None
        
        # Scaling Flag
        use_scaling = request.form.get('use_scaling', 'true').lower() == 'true'

        # --- PDF HANDLING ---
        if file.filename.lower().endswith('.pdf'):
            if not GEMINI_API_KEY:
                return jsonify({"error": "Gemini API Key required for PDF processing"}), 400
            
            import tempfile
            import time
            
            # 1. Save PDF locally temporarily
            with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp:
                file.save(tmp.name)
                tmp_path = tmp.name
                
            try:
                # 2. Upload to Gemini
                uploaded_file = genai.upload_file(tmp_path, mime_type="application/pdf")
                
                # Wait for processing
                while uploaded_file.state.name == "PROCESSING":
                    time.sleep(1)
                    uploaded_file = genai.get_file(uploaded_file.name)
                    
                if uploaded_file.state.name == "FAILED":
                    raise Exception("Gemini failed to process the PDF.")
                
                # 3. Prompt for Extraction
                prompt = (
                    "Extract the energy data table from this PDF document. "
                    "Return ONLY a valid JSON array of objects. "
                    "Each object should try to map to these keys: Timestamp, Temperature, Humidity, SquareFootage, Occupancy, HVACUsage, LightingUsage, RenewableEnergy, Holiday. "
                    "Infer missing columns if possible or omit them. "
                    "Ensure Timestamp is in ISO format (YYYY-MM-DDTHH:MM:SS)."
                )
                
                response = gemini_model.generate_content([uploaded_file, prompt])
                
                # 4. Parse JSON
                json_text = response.text.replace("```json", "").replace("```", "").strip()
                data_list = json.loads(json_text)
                df_batch = pd.DataFrame(data_list)
                
            finally:
                # Cleanup
                if os.path.exists(tmp_path):
                    os.remove(tmp_path)
                    
        else:
            # --- CSV HANDLING ---
            df_batch = pd.read_csv(file)
        
        # 1. Normalize columns (stripping whitespace and lowercasing for matching)
        # Create a mapping from lowercased -> original if needed, or just standardizing
        df_batch.columns = df_batch.columns.str.strip()
        col_map = {c.lower(): c for c in df_batch.columns}
        
        # 2. Column Aliasing Map (Key = Lowercase expected, Value = List of possible user inputs)
        # We need to map USER inputs to the MODEL expected features.
        # Model expects: ['Timestamp', 'Temperature', 'Humidity', 'SquareFootage', 'Occupancy', 'HVACUsage', 'LightingUsage', 'RenewableEnergy', 'DayOfWeek', 'Holiday']
        
        # Standardize df to have Model Column Names
        alias_map = {
            'Timestamp': ['timestamp', 'date', 'datetime'],
            'Temperature': ['temperature', 'temp'],
            'Humidity': ['humidity', 'hum'],
            'SquareFootage': ['squarefootage', 'area', 'sqft', 'size'],
            'Occupancy': ['occupancy', 'occupants', 'people'],
            'HVACUsage': ['hvacusage', 'hvac', 'ac', 'hvac_level', 'hvac_status'],
            'LightingUsage': ['lightingusage', 'lighting', 'lights', 'lighting_level', 'light_status'],
            'RenewableEnergy': ['renewableenergy', 'renewable', 'solar', 'renewable_percentage'],
            'DayOfWeek': ['dayofweek', 'day', 'weekday', 'day_type'],
            'Holiday': ['holiday', 'is_holiday']
        }
        
        # Renaming columns based on aliases
        for standard_col, aliases in alias_map.items():
            if standard_col in df_batch.columns: continue # Already exists
            for alias in aliases:
                if alias in col_map:
                    df_batch.rename(columns={col_map[alias]: standard_col}, inplace=True)
                    break
        
        # 3. Validation & Timestamps
        if 'Timestamp' not in df_batch.columns:
             return jsonify({"error": "Missing required column: Timestamp"}), 400
             
        df_batch['Timestamp'] = pd.to_datetime(df_batch['Timestamp'])
        
        # 4. Clean & Coerce Numerics (Before Interactions)
        # Defaults
        defaults = {
            'Temperature': 25, 'Humidity': 50, 'SquareFootage': 1500, 'Occupancy': 2,
            'RenewableEnergy': 0
        }
        
        # Ensure columns exist and are numeric
        for col, default_val in defaults.items():
            if col not in df_batch.columns:
                df_batch[col] = default_val
            else:
                df_batch[col] = pd.to_numeric(df_batch[col], errors='coerce').fillna(default_val)

        # 5. Map Categoricals / Binaries
        def map_binary_usage(val):
            if isinstance(val, (int, float)): return 1 if val > 0 else 0
            s = str(val).lower()
            if s in ['on', 'yes', 'true', 'high', 'medium', 'low', '1']: return 1
            return 0
            
        def map_holiday(val):
            if isinstance(val, (int, float)): return 1 if val > 0 else 0
            s = str(val).lower()
            if s in ['yes', 'true', '1', 'holiday']: return 1
            return 0

        if 'HVACUsage' not in df_batch.columns: df_batch['HVACUsage'] = 0
        df_batch['HVACUsage'] = df_batch['HVACUsage'].apply(map_binary_usage)
        
        if 'LightingUsage' not in df_batch.columns: df_batch['LightingUsage'] = 0
        df_batch['LightingUsage'] = df_batch['LightingUsage'].apply(map_binary_usage)
         
        if 'Holiday' not in df_batch.columns: df_batch['Holiday'] = 0
        df_batch['Holiday'] = df_batch['Holiday'].apply(map_holiday)

        # 6. Derby Time Features (ALWAYS from Timestamp)
        df_batch['hour'] = df_batch['Timestamp'].dt.hour
        df_batch['weekday'] = df_batch['Timestamp'].dt.weekday
        df_batch['month'] = df_batch['Timestamp'].dt.month
        df_batch['is_day'] = df_batch['hour'].apply(lambda x: 1 if 6 <= x < 18 else 0)
        
        # FIX: Explicitly set categories for DayOfWeek to match model training
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        df_batch['DayOfWeek'] = pd.Categorical(df_batch['Timestamp'].dt.day_name(), categories=days, ordered=False)
        
        # 7. Calculate Interactions (Now safe with numerics)
        df_batch['temp_hvac_interaction'] = df_batch['Temperature'] * df_batch['HVACUsage']
        df_batch['humidity_hvac_interaction'] = df_batch['Humidity'] * df_batch['HVACUsage']
        
        selected_features = [
            'Temperature', 'Humidity', 'SquareFootage', 'Occupancy',
            'HVACUsage', 'LightingUsage', 'RenewableEnergy',
            'DayOfWeek', 'Holiday', 'hour', 'weekday', 'month', 'is_day',
            'temp_hvac_interaction', 'humidity_hvac_interaction'
        ]
        
        # Verify final dataframe
        X_batch = df_batch[selected_features]
        predictions_raw = model.predict(X_batch)
        
        # Apply Scaling Logic
        settings = get_settings()
        factor = float(settings['energy'].get('residential_factor', 0.02)) if use_scaling else 1.0
        predictions = predictions_raw * factor
        
        results = []
        for i, pred in enumerate(predictions):
            row = df_batch.iloc[i]
            results.append({
                "timestamp": row['Timestamp'].isoformat(),
                "predicted_consumption": float(round(pred, 2)),
                # Extended Fields
                "temperature": float(row.get('Temperature', 0)),
                "humidity": float(row.get('Humidity', 0)),
                "hvac_usage": int(row.get('HVACUsage', 0)),
                "lighting_usage": int(row.get('LightingUsage', 0)),
                "occupancy": int(row.get('Occupancy', 0)),
                "renewable_energy": float(row.get('RenewableEnergy', 0)),
                "holiday": int(row.get('Holiday', 0))
            })
            
        return jsonify(results)

    except Exception as e:
        return jsonify({"error": f"Processing Failed: {str(e)}"}), 400

@app.route('/api/chat', methods=['POST'])
def chat_with_ai():
    data = request.json
    user_message = data.get('message', '')
    response_text = generate_ai_response(user_message)
    return jsonify({
        "role": "assistant",
        "content": response_text
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
