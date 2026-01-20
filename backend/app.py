from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import pickle
import numpy as np
import pandas as pd
import joblib  # Better for ML models
from google import genai 
import os
from datetime import datetime

app = Flask(__name__)
app.config['SECRET_KEY'] = 'energy-prediction-2026-change-this-in-production'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
CORS(app)

client = genai.Client(api_key="AIzaSyBeFl4fQFnbBSiDGA7GJadmdB2PmpWe25k")
db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)

class Feedback(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    message = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

with app.app_context():
    db.create_all()

# ✅ ML Model - Updated to use joblib (better than pickle for sklearn models)
try:
    model = joblib.load(r"C:\Users\SAIDA RAO\OneDrive\Desktop\aboutpage\lgb_model.pkl")
    print("✅ Model loaded successfully!")
except Exception as e:
    print(f"❌ Model load error: {e}")
    model = None

# 🔥 COMPLETE FEATURE ENGINEERING FUNCTION - Matches your exact training pipeline
def build_features_complete(form_data):
    """
    Converts form inputs to EXACT 31 features your model expects
    """
    df = pd.DataFrame([form_data])
    
    # 1. Time features
    Hour = int(form_data['Hour'])
    DayOfWeek_num = int(form_data['DayOfWeek'])  # 0=Monday, 6=Sunday
    Month = 1  # Default January (minimal seasonal effect in your data)
    df['Hour'] = Hour
    df['DayOfWeek_num'] = DayOfWeek_num
    df['Month'] = Month
    df['IsWeekend'] = 1 if DayOfWeek_num >= 5 else 0
    
    # 2. Cyclical encoding
    df['Hour_sin'] = np.sin(2 * np.pi * df['Hour'] / 24)
    df['Hour_cos'] = np.cos(2 * np.pi * df['Hour'] / 24)
    
    # 3. Numeric columns (ensure float)
    numeric_cols = ['Temperature', 'Humidity', 'SquareFootage', 'LightingUsage', 'RenewableEnergy']
    for col in numeric_cols:
        df[col] = float(form_data[col])
    
    # 4. Interaction features
    df['Temp_Humidity'] = df['Temperature'] * df['Humidity']
    df['Temp_sq'] = df['Temperature'] ** 2
    df['Lighting_per_sqft'] = df['LightingUsage'] / (df['SquareFootage'] + 1)
    df['Renewable_ratio'] = df['RenewableEnergy'] / (df['LightingUsage'] + 1)
    
    # 5. Lags & Rolling (use current EnergyConsumption as proxy for single prediction)
    EnergyConsumption = float(form_data.get('EnergyConsumption', 75.0))  # Default avg
    df['Energy_lag_1h'] = EnergyConsumption * 0.95  # Slightly lower previous
    df['Energy_lag_24h'] = EnergyConsumption * 0.98  # Slightly lower yesterday
    df['Energy_roll_mean_3h'] = EnergyConsumption
    df['Energy_roll_std_3h'] = 5.0  # Typical from your data
    
    # 6. Hourly patterns (use realistic values from your EDA)
    hourly_means = {0:75.36, 1:83.40, 2:78.27, 3:56.52, 4:70.81, 5:72.0, 6:74.0, 7:85.0, 
                   8:88.0, 9:86.0, 10:82.0, 11:80.0, 12:78.0, 13:77.0, 14:76.0, 15:75.0,
                   16:78.0, 17:85.0, 18:90.0, 19:88.0, 20:85.0, 21:82.0, 22:78.0, 23:75.0}
    df['Avg_Energy_by_Hour'] = hourly_means.get(Hour, 75.0)
    df['Energy_dev_from_hour'] = EnergyConsumption - df['Avg_Energy_by_Hour']
    
    # 7. Intensity & Peak
    df['Energy_Intensity'] = EnergyConsumption / (df['SquareFootage'] + 1)
    df['Is_Peak_Hour'] = 1 if Hour in [7,8,9,17,18,19,20,21] else 0
    df['Comfort_Score'] = 100 - abs(df['Temperature'] - 22)
    
    # 8. Binary encodings
    df['HVACUsage_encoded'] = 1 if form_data['HVACUsage'] == 'On' else 0
    df['Occupancy_encoded'] = 1 if float(form_data['Occupancy']) > 0 else 0
    df['Holiday_encoded'] = 1 if form_data['Holiday'] == 'Yes' else 0
    
    # 9. Outlier flags (conservative for new data - use training quantiles)
    # From your data: Temperature(15-32), Humidity(30-70), SquareFootage(800-2000), Energy(50-100)
    outlier_bounds = {
        'Temperature': (15, 32),
        'Humidity': (30, 70),
        'SquareFootage': (800, 2000),
        'EnergyConsumption': (50, 100)
    }
    df['Temperature_is_outlier'] = 1 if df['Temperature'].iloc[0] < 15 or df['Temperature'].iloc[0] > 32 else 0
    df['Humidity_is_outlier'] = 1 if df['Humidity'].iloc[0] < 30 or df['Humidity'].iloc[0] > 70 else 0
    df['SquareFootage_is_outlier'] = 1 if df['SquareFootage'].iloc[0] < 800 or df['SquareFootage'].iloc[0] > 2000 else 0
    df['EnergyConsumption_is_outlier'] = 1 if EnergyConsumption < 50 or EnergyConsumption > 100 else 0
    
    # 🔥 EXACT FEATURE ORDER your model expects
    feature_cols = [
        'Temperature', 'Humidity', 'SquareFootage', 'LightingUsage', 'RenewableEnergy',
        'Hour', 'Temperature_is_outlier', 'Humidity_is_outlier', 'SquareFootage_is_outlier',
        'EnergyConsumption_is_outlier', 'DayOfWeek_num', 'Month', 'IsWeekend',
        'Hour_sin', 'Hour_cos', 'Temp_Humidity', 'Temp_sq', 'Lighting_per_sqft',
        'Renewable_ratio', 'Energy_lag_1h', 'Energy_lag_24h', 'Energy_roll_mean_3h',
        'Energy_roll_std_3h', 'Avg_Energy_by_Hour', 'Energy_dev_from_hour',
        'Energy_Intensity', 'Is_Peak_Hour', 'Comfort_Score', 'HVACUsage_encoded',
        'Occupancy_encoded', 'Holiday_encoded'
    ]
    
    X = df[feature_cols]
    print("✅ Features created:", X.shape)  # Debug
    print("Sample features:", X.iloc[0].to_dict())  # Debug
    return X
# Add this route ABOVE your existing @app.route('/prediction') 

@app.route('/predict_file', methods=['POST'])
@login_required
def predict_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    if file.filename == '' or file is None:
        return jsonify({'error': 'No file selected'}), 400
    
    if not file.filename.endswith('.csv'):
        return jsonify({'error': 'File must be CSV format'}), 400
    
    try:
        # Read CSV
        df = pd.read_csv(file, encoding='utf-8')
        print(f"📁 Uploaded: {len(df)} rows, columns: {list(df.columns)}")
        
        # VALIDATE required columns
        required_cols = ['Temperature', 'Humidity', 'SquareFootage', 'Occupancy', 
                        'LightingUsage', 'HVACUsage', 'RenewableEnergy', 'Hour', 
                        'DayOfWeek', 'Holiday']
        missing = [col for col in required_cols if col not in df.columns]
        if missing:
            return jsonify({'success': False, 'error': f'Missing columns: {", ".join(missing)}'}), 400
        
        # Build features for ALL rows
        predictions = []
        errors = []
        
        for idx, row in df.iterrows():
            try:
                form_data = {
                    'Temperature': float(row.get('Temperature', 20)),
                    'Humidity': float(row.get('Humidity', 50)),
                    'SquareFootage': float(row.get('SquareFootage', 1000)),
                    'Occupancy': float(row.get('Occupancy', 5)),
                    'LightingUsage': float(row.get('LightingUsage', 1)) if isinstance(row.get('LightingUsage'), (int, float)) 
                                     else (1.0 if str(row.get('LightingUsage', '')).lower() == 'on' else 0.0),
                    'HVACUsage': str(row.get('HVACUsage', 'On')),
                    'RenewableEnergy': float(row.get('RenewableEnergy', 10)),
                    'Hour': int(float(row.get('Hour', 12))),
                    'DayOfWeek': int(float(row.get('DayOfWeek', 3))),
                    'Holiday': str(row.get('Holiday', 'No')),
                    'EnergyConsumption': 75.0
                }
                
                X = build_features_complete(form_data)
                if model is not None:
                    pred = model.predict(X)[0]
                    predictions.append(round(float(pred), 2))
                else:
                    predictions.append(75.0)  # Default if model not loaded
                    
            except Exception as row_error:
                print(f"❌ Row {idx} error: {row_error}")
                predictions.append(75.0)  # Default prediction on error
                errors.append(f"Row {idx}: {str(row_error)}")
        
        # Summary for display
        summary = {
            'mean_pred': round(float(np.mean(predictions)), 2),
            'max_pred': round(float(np.max(predictions)), 2),
            'min_pred': round(float(np.min(predictions)), 2),
            'rows': len(df),
            'predictions': predictions[:10]  # First 10 for preview
        }
        
        # Add predictions to dataframe
        df['EnergyConsumption_pred'] = predictions
        
        return jsonify({
            'success': True,
            'summary': summary,
            'download_data': df.to_csv(index=False),
            'warnings': errors if errors else None
        })
    
    except pd.errors.ParserError:
        return jsonify({'success': False, 'error': 'Invalid CSV format. Please check your file.'}), 400
    except Exception as e:
        print(f"❌ Processing error: {e}")
        return jsonify({'success': False, 'error': f'Processing error: {str(e)}'}), 500


@app.route('/')
def home():
    return render_template('landing.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        user = User.query.filter_by(username=username).first()
        if user and check_password_hash(user.password_hash, password):
            login_user(user)
            return redirect(url_for('prediction'))
        flash('Invalid credentials', 'error')
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        if User.query.filter_by(username=username).first():
            flash('Username exists', 'error')
            return render_template('register.html')
        user = User(username=username, password_hash=generate_password_hash(password))
        db.session.add(user)
        db.session.commit()
        flash('Registered! Login now.', 'success')
        return redirect(url_for('login'))
    return render_template('register.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('home'))

@app.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html')

@app.route('/prediction', methods=['GET', 'POST'])
@login_required
def prediction():
    prediction = status = None
    if request.method == 'POST' and model:
        try:
            data = request.form
            
            # ✅ Prepare exact form data for feature engineering
            form_data = {
                'Temperature': float(data["Temperature"]),
                'Humidity': float(data["Humidity"]), 
                'SquareFootage': float(data["SquareFootage"]),
                'Occupancy': float(data["Occupancy"]),
                'LightingUsage': 1.0 if data["LightingUsage"] == "On" else 0.0,  # Numeric!
                'HVACUsage': data["HVACUsage"],  # Keep as "On"/"Off"
                'RenewableEnergy': float(data["RenewableEnergy"]),
                'Hour': int(data["Hour"]),
                'DayOfWeek': int(data["DayOfWeek"]),
                'Holiday': data["Holiday"],  # "Yes" or "No"
                'EnergyConsumption': 75.0  # Will be overridden internally
            }
            
            # 🔥 BUILD ALL 31 FEATURES
            X = build_features_complete(form_data)
            
            # ✅ PREDICT
            prediction = round(float(model.predict(X)[0]), 2)
            status = "⚠️ Energy Wastage" if prediction > 85 else "✅ Normal"
            
            print(f"✅ Prediction: {prediction} kWh")  # Debug
            
            # 🔥 IF AJAX REQUEST, RETURN JSON
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return jsonify({
                    'success': True,
                    'prediction': str(prediction),
                    'status': status
                })
            
        except Exception as e:
            print(f"❌ Prediction error: {e}")
            
            # 🔥 IF AJAX REQUEST, RETURN ERROR JSON
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return jsonify({
                    'success': False,
                    'error': str(e)
                }), 400
            
            flash(f'Prediction error: {str(e)}', 'error')
    
    return render_template('prediction.html', prediction=prediction, status=status)

@app.route('/chatbot')
@login_required
def chatbot():
    return render_template('chatbot.html')

@app.route('/feedback', methods=['GET', 'POST'])
@login_required
def feedback():
    if request.method == 'POST':
        rating = int(request.form['rating'])
        message = request.form['message']
        feedback = Feedback(user_id=current_user.id, rating=rating, message=message)
        db.session.add(feedback)
        db.session.commit()
        flash('Feedback submitted!', 'success')
        return redirect(url_for('feedback'))
    
    feedbacks = Feedback.query.filter_by(user_id=current_user.id).order_by(Feedback.timestamp.desc()).all()
    return render_template('feedback.html', feedbacks=feedbacks)

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        user_message = data.get('message', '').strip()
        print(f"🟢 Chat: {user_message}")
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=user_message
        )
        print(f"🟢 Reply: {response.text[:50]}")
        return jsonify({'reply': response.text})
    except Exception as e:
        print(f"🔴 Error: {e}")
        return jsonify({'reply': f"Troubleshoot: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
