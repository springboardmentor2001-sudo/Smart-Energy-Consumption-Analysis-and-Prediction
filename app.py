# app.py - Enhanced Version with Suggestions & Device Survey
from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import pandas as pd
import PyPDF2
import io
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
import pickle
import os
from datetime import datetime
import requests

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "dev-secret-key")
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///energy_predictor.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# OpenWeatherMap API Key (Get free key from https://openweathermap.org/api)
WEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")  # Replace with your API key

db = SQLAlchemy(app)

with app.app_context():
    db.create_all()

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'csv', 'pdf'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Database Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    predictions = db.relationship('Prediction', backref='user', lazy=True)
    device_profile = db.relationship('DeviceProfile', backref='user', uselist=False)

class Prediction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    temperature = db.Column(db.Float)
    humidity = db.Column(db.Float)
    square_footage = db.Column(db.Float)
    occupancy = db.Column(db.Integer)
    hvac_usage = db.Column(db.Integer)
    lighting_usage = db.Column(db.Integer)
    renewable_energy = db.Column(db.Float)
    predicted_consumption = db.Column(db.Float)

class DeviceProfile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    tvs = db.Column(db.Integer, default=0)
    refrigerators = db.Column(db.Integer, default=0)
    washing_machines = db.Column(db.Integer, default=0)
    dryers = db.Column(db.Integer, default=0)
    computers = db.Column(db.Integer, default=0)
    ac_units = db.Column(db.Integer, default=0)
    water_heaters = db.Column(db.Integer, default=0)
    dishwashers = db.Column(db.Integer, default=0)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow)

class Contact(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    query = db.Column(db.Text, nullable=False)
    rating = db.Column(db.Integer)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

# Simple mock model
class MockEnergyModel:
    def predict(self, features):
        base = 50
        temp_factor = features['Temperature'] * 0.5
        humidity_factor = features['Humidity'] * 0.1
        size_factor = features['SquareFootage'] * 0.02
        occupancy_factor = features['Occupancy'] * 5
        hvac_factor = features['HVACUsage'] * 15
        lighting_factor = features['LightingUsage'] * 3
        
        hour = features['Hour']
        if 17 <= hour <= 21:
            time_factor = 10
        elif 0 <= hour <= 6:
            time_factor = -5
        else:
            time_factor = 0
        
        weekend_factor = -3 if features['IsWeekend'] else 0
        renewable_reduction = features['RenewableEnergy'] * 0.5
        
        total = (base + temp_factor + humidity_factor + size_factor + 
                occupancy_factor + hvac_factor + lighting_factor + 
                time_factor + weekend_factor - renewable_reduction)
        
        return max(20, min(total, 200))

model = MockEnergyModel()

def get_weather_data(city):
    """Fetch live weather data from OpenWeatherMap API"""
    if not WEATHER_API_KEY:
        # Return mock data if no API key
        return {'temperature': 22, 'humidity': 55, 'description': 'Clear sky'}
    
    try:
        url = "https://api.openweathermap.org/data/2.5/weather"
        params = {
            "q": city,
            "appid": WEATHER_API_KEY,
            "units": "metric"
        }

        response = requests.get(url, params=params, timeout=5)
        response.raise_for_status()  # raises error for 4xx / 5xx

        data = response.json()

        return {
            'temperature': round(data['main']['temp'], 1),
            'humidity': data['main']['humidity'],
            'description': data['weather'][0]['description']
        }

    except requests.exceptions.RequestException as e:
        print("Weather API error:", e)
        return None

def generate_suggestions(prediction_data, predicted_value, device_profile=None):
    """Generate personalized energy-saving suggestions"""
    suggestions = []
    savings_potential = 0
    
    # HVAC Suggestions
    if prediction_data['HVACUsage'] == 1:
        hvac_consumption = 15
        suggestions.append({
            'category': 'HVAC Optimization',
            'icon': '❄️',
            'message': f'Your HVAC is contributing ~{hvac_consumption} kWh ({int(hvac_consumption/predicted_value*100)}% of total)',
            'action': 'Adjust thermostat by 2-3°F when away. Install a programmable thermostat.',
            'savings': '10-15 kWh/day'
        })
        savings_potential += 12
    
    # Temperature-based suggestions
    temp = prediction_data['Temperature']
    if temp > 26:
        suggestions.append({
            'category': 'Cooling Efficiency',
            'icon': '🌡️',
            'message': f'Current temperature is {temp}°C - high cooling demand',
            'action': 'Use fans alongside AC. Close blinds during peak sun hours.',
            'savings': '5-8 kWh/day'
        })
        savings_potential += 6
    elif temp < 18:
        suggestions.append({
            'category': 'Heating Efficiency',
            'icon': '🔥',
            'message': f'Current temperature is {temp}°C - high heating demand',
            'action': 'Seal air leaks, add insulation. Wear layers indoors.',
            'savings': '8-12 kWh/day'
        })
        savings_potential += 10
    
    # Lighting suggestions
    if prediction_data['LightingUsage'] == 1:
        suggestions.append({
            'category': 'Lighting Upgrade',
            'icon': '💡',
            'message': 'Lighting contributes ~3 kWh to your consumption',
            'action': 'Switch to LED bulbs (75% more efficient). Use natural light during daytime.',
            'savings': '2-3 kWh/day'
        })
        savings_potential += 2.5
    
    # Time-based suggestions
    hour = datetime.now().hour
    if 17 <= hour <= 21:
        suggestions.append({
            'category': 'Peak Hour Alert',
            'icon': '🕐',
            'message': 'You\'re using energy during peak hours (5 PM - 9 PM)',
            'action': 'Shift heavy appliance use (washing, drying) to off-peak hours (after 9 PM).',
            'savings': '15-20% cost reduction'
        })
    
    # Renewable energy suggestions
    renewable = prediction_data['RenewableEnergy']
    renewable_percentage = (renewable / predicted_value * 100) if predicted_value > 0 else 0
    
    if renewable_percentage < 20:
        suggestions.append({
            'category': 'Renewable Energy',
            'icon': '☀️',
            'message': f'Only {renewable_percentage:.1f}% of your energy is renewable',
            'action': 'Consider solar panels or switch to a green energy plan from your utility provider.',
            'savings': f'Offset {predicted_value * 0.3:.1f} kWh with solar'
        })
        savings_potential += predicted_value * 0.3
    
    # Occupancy-based suggestions
    if prediction_data['Occupancy'] == 0:
        suggestions.append({
            'category': 'Unoccupied Home',
            'icon': '🏠',
            'message': 'Your home is currently unoccupied',
            'action': 'Turn off HVAC, lights, and unplug devices. Use smart plugs for automation.',
            'savings': '20-30 kWh/day'
        })
        savings_potential += 25

    # Device-specific suggestions
    if device_profile:
        if device_profile.refrigerators > 1:
            suggestions.append({
                'category': 'Appliance Efficiency',
                'icon': '🧊',
                'message': f'You have {device_profile.refrigerators} refrigerators',
                'action': 'Each refrigerator uses ~100-150 kWh/month. Consider replacing old units with Energy Star models.',
                'savings': '30-50 kWh/month per old unit'
            })
        
        if device_profile.tvs > 2:
            suggestions.append({
                'category': 'Entertainment Devices',
                'icon': '📺',
                'message': f'You have {device_profile.tvs} TVs',
                'action': 'Enable power-saving modes. Unplug when not in use (phantom load can waste 5-10% of energy).',
                'savings': '2-4 kWh/day'
            })
        
        if device_profile.water_heaters > 0:
            suggestions.append({
                'category': 'Water Heating',
                'icon': '💧',
                'message': 'Water heaters are major energy consumers',
                'action': 'Lower temperature to 49°C. Insulate tank and pipes. Consider tankless heater.',
                'savings': '10-15 kWh/day'
            })
    
    return suggestions, savings_potential

def calculate_comparison(predicted_value, square_footage, occupancy):
    """Calculate comparison with similar homes"""
    # Average consumption per sq ft per person
    avg_consumption_per_sqft = 0.03  # kWh per sq ft
    avg_consumption_per_person = 10  # kWh per person
    
    typical_consumption = (square_footage * avg_consumption_per_sqft) + (occupancy * avg_consumption_per_person)
    
    difference_percentage = ((predicted_value - typical_consumption) / typical_consumption * 100) if typical_consumption > 0 else 0
    
    return {
        'your_usage': round(predicted_value, 2),
        'typical_usage': round(typical_consumption, 2),
        'difference': round(predicted_value - typical_consumption, 2),
        'percentage': round(difference_percentage, 1),
        'status': 'above' if difference_percentage > 0 else 'below'
    }

def prepare_features(data):
    now = datetime.now()
    
    features = {
        'Temperature': float(data.get('temperature', 20)),
        'Humidity': float(data.get('humidity', 50)),
        'SquareFootage': float(data.get('square_footage', 2000)),
        'Occupancy': int(data.get('occupancy', 2)),
        'HVACUsage': int(data.get('hvac_usage', 0)),
        'LightingUsage': int(data.get('lighting_usage', 0)),
        'Holiday': int(data.get('holiday', 0)),
        'RenewableEnergy': float(data.get('renewable_energy', 10)),
        'Hour': now.hour,
        'Day': now.day,
        'Month': now.month,
        'IsWeekend': 1 if now.strftime('%A') in ['Saturday', 'Sunday'] else 0
    }
    
    return features

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def parse_csv_file(file):
    """Parse CSV file and return list of prediction data"""
    try:
        df = pd.read_csv(file)
        
        # Expected columns (can be flexible with naming)
        required_cols = ['temperature', 'humidity', 'square_footage', 'occupancy', 
                        'hvac_usage', 'lighting_usage', 'renewable_energy']
        
        # Normalize column names
        df.columns = df.columns.str.lower().str.strip()
        
        predictions = []
        for index, row in df.iterrows():
            data = {
                'temperature': row.get('temperature', 20),
                'humidity': row.get('humidity', 50),
                'square_footage': row.get('square_footage', 2000),
                'occupancy': row.get('occupancy', 2),
                'hvac_usage': int(row.get('hvac_usage', 0)),
                'lighting_usage': int(row.get('lighting_usage', 0)),
                'holiday': int(row.get('holiday', 0)),
                'renewable_energy': row.get('renewable_energy', 10)
            }
            predictions.append(data)
        
        return predictions, None
    except Exception as e:
        return None, f"Error parsing CSV: {str(e)}"

def parse_pdf_file(file):
    """Parse PDF file and extract energy data"""
    try:
        pdf_reader = PyPDF2.PdfReader(file)
        text = ""
        
        for page in pdf_reader.pages:
            text += page.extract_text()
        
        # Simple parsing - look for key-value pairs
        # Format expected: "Temperature: 25", "Humidity: 60%", etc.
        data = {
            'temperature': 20,
            'humidity': 50,
            'square_footage': 2000,
            'occupancy': 2,
            'hvac_usage': 0,
            'lighting_usage': 0,
            'holiday': 0,
            'renewable_energy': 10
        }
        
        lines = text.split('\n')
        for line in lines:
            line_lower = line.lower().strip()
            
            if 'temperature' in line_lower:
                try:
                    temp = float(''.join(filter(str.isdigit, line.split(':')[-1])))
                    if temp > 0 and temp < 50:
                        data['temperature'] = temp
                except:
                    pass
            
            elif 'humidity' in line_lower:
                try:
                    hum = float(''.join(filter(str.isdigit, line.split(':')[-1])))
                    if hum > 0 and hum <= 100:
                        data['humidity'] = hum
                except:
                    pass
            
            elif 'square' in line_lower or 'footage' in line_lower:
                try:
                    sqft = float(''.join(filter(str.isdigit, line.split(':')[-1])))
                    if sqft > 0:
                        data['square_footage'] = sqft
                except:
                    pass
            
            elif 'occupancy' in line_lower or 'people' in line_lower:
                try:
                    occ = int(''.join(filter(str.isdigit, line.split(':')[-1])))
                    if occ >= 0:
                        data['occupancy'] = occ
                except:
                    pass
            
            elif 'hvac' in line_lower:
                if 'on' in line_lower or '1' in line:
                    data['hvac_usage'] = 1
                else:
                    data['hvac_usage'] = 0
            
            elif 'lighting' in line_lower or 'lights' in line_lower:
                if 'on' in line_lower or '1' in line:
                    data['lighting_usage'] = 1
                else:
                    data['lighting_usage'] = 0
            
            elif 'renewable' in line_lower:
                try:
                    ren = float(''.join(filter(str.isdigit, line.split(':')[-1])))
                    if ren >= 0:
                        data['renewable_energy'] = ren
                except:
                    pass
        
        return [data], None
    except Exception as e:
        return None, f"Error parsing PDF: {str(e)}"

# Routes
@app.route('/')
def index():
    if 'user_id' in session:
        return redirect(url_for('home'))
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        
        user = User.query.filter_by(email=email).first()
        
        if user and check_password_hash(user.password, password):
            session['user_id'] = user.id
            session['email'] = user.email
            return redirect(url_for('home'))
        else:
            return render_template('login.html', error='Invalid credentials')
    
    return render_template('login.html')

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        
        if User.query.filter_by(email=email).first():
            return render_template('signup.html', error='Email already exists')
        
        hashed_password = generate_password_hash(password)
        new_user = User(email=email, password=hashed_password)
        db.session.add(new_user)
        db.session.commit()
        
        return redirect(url_for('login'))
    
    return render_template('signup.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

@app.route('/home')
def home():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    return render_template('home.html')

@app.route('/about')
def about():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    return render_template('about.html')

@app.route('/prediction', methods=['GET', 'POST'])
def prediction():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    if request.method == 'POST':
        data = request.form
        features = prepare_features(data)
        predicted_value = model.predict(features)
        
        # Get device profile
        device_profile = DeviceProfile.query.filter_by(user_id=session['user_id']).first()
        
        # Generate suggestions
        suggestions, savings = generate_suggestions(features, predicted_value, device_profile)
        
        # Calculate comparison
        comparison = calculate_comparison(
            predicted_value,
            features['SquareFootage'],
            features['Occupancy']
        )
        
        # Save prediction
        new_prediction = Prediction(
            user_id=session['user_id'],
            temperature=features['Temperature'],
            humidity=features['Humidity'],
            square_footage=features['SquareFootage'],
            occupancy=features['Occupancy'],
            hvac_usage=features['HVACUsage'],
            lighting_usage=features['LightingUsage'],
            renewable_energy=features['RenewableEnergy'],
            predicted_consumption=predicted_value
        )
        db.session.add(new_prediction)
        db.session.commit()
        
        return jsonify({
            'prediction': round(predicted_value, 2),
            'suggestions': suggestions,
            'savings_potential': round(savings, 2),
            'comparison': comparison
        })
    
    return render_template('prediction.html')

@app.route('/device-survey', methods=['GET', 'POST'])
def device_survey():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    if request.method == 'POST':
        data = request.form
        
        device_profile = DeviceProfile.query.filter_by(user_id=session['user_id']).first()
        
        if device_profile:
            device_profile.tvs = int(data.get('tvs', 0))
            device_profile.refrigerators = int(data.get('refrigerators', 0))
            device_profile.washing_machines = int(data.get('washing_machines', 0))
            device_profile.dryers = int(data.get('dryers', 0))
            device_profile.computers = int(data.get('computers', 0))
            device_profile.ac_units = int(data.get('ac_units', 0))
            device_profile.water_heaters = int(data.get('water_heaters', 0))
            device_profile.dishwashers = int(data.get('dishwashers', 0))
            device_profile.updated_at = datetime.utcnow()
        else:
            device_profile = DeviceProfile(
                user_id=session['user_id'],
                tvs=int(data.get('tvs', 0)),
                refrigerators=int(data.get('refrigerators', 0)),
                washing_machines=int(data.get('washing_machines', 0)),
                dryers=int(data.get('dryers', 0)),
                computers=int(data.get('computers', 0)),
                ac_units=int(data.get('ac_units', 0)),
                water_heaters=int(data.get('water_heaters', 0)),
                dishwashers=int(data.get('dishwashers', 0))
            )
            db.session.add(device_profile)
        
        db.session.commit()
        return redirect(url_for('prediction'))
    
    device_profile = DeviceProfile.query.filter_by(user_id=session['user_id']).first()
    return render_template('device_survey.html', profile=device_profile)

@app.route('/api/weather/<city>')
def get_weather(city):
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    weather_data = get_weather_data(city)
    
    if weather_data:
        return jsonify(weather_data)
    else:
        return jsonify({'error': 'Could not fetch weather data'}), 404

@app.route('/chatbot')
def chatbot():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    return render_template('chatbot.html')

@app.route('/chatbot/predict', methods=['POST'])
def chatbot_predict():
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    data = request.json
    features = prepare_features(data)
    predicted_value = model.predict(features)
    
    new_prediction = Prediction(
        user_id=session['user_id'],
        temperature=features['Temperature'],
        humidity=features['Humidity'],
        square_footage=features['SquareFootage'],
        occupancy=features['Occupancy'],
        hvac_usage=features['HVACUsage'],
        lighting_usage=features['LightingUsage'],
        renewable_energy=features['RenewableEnergy'],
        predicted_consumption=predicted_value
    )
    db.session.add(new_prediction)
    db.session.commit()
    
    return jsonify({'prediction': round(predicted_value, 2)})

@app.route('/contact', methods=['GET', 'POST'])
def contact():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    if request.method == 'POST':
        name = request.form['name']
        email = request.form['email']
        query = request.form['query']
        rating = int(request.form['rating'])
        
        new_contact = Contact(name=name, email=email, query=query, rating=rating)
        db.session.add(new_contact)
        db.session.commit()
        
        return render_template('contact.html', success=True)
    
    return render_template('contact.html')

@app.route('/api/prediction_history')
def prediction_history():
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    predictions = Prediction.query.filter_by(user_id=session['user_id']).order_by(Prediction.timestamp.desc()).limit(10).all()
    
    history = [{
        'timestamp': p.timestamp.strftime('%Y-%m-%d %H:%M'),
        'consumption': round(p.predicted_consumption, 2)
    } for p in predictions]
    
    return jsonify(history)

@app.route('/prediction/upload', methods=['POST'])
def upload_prediction_file():
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type. Please upload CSV or PDF'}), 400
    
    try:
        filename = secure_filename(file.filename)
        file_ext = filename.rsplit('.', 1)[1].lower()
        
        # Parse file based on type
        if file_ext == 'csv':
            predictions_data, error = parse_csv_file(file)
        elif file_ext == 'pdf':
            predictions_data, error = parse_pdf_file(file)
        else:
            return jsonify({'error': 'Unsupported file type'}), 400
        
        if error:
            return jsonify({'error': error}), 400
        
        # Make predictions for all data
        results = []
        device_profile = DeviceProfile.query.filter_by(user_id=session['user_id']).first()
        
        for data in predictions_data:
            features = prepare_features(data)
            predicted_value = model.predict(features)
            
            # Generate suggestions
            suggestions, savings = generate_suggestions(features, predicted_value, device_profile)
            
            # Calculate comparison
            comparison = calculate_comparison(
                predicted_value,
                features['SquareFootage'],
                features['Occupancy']
            )
            
            # Save to database
            new_prediction = Prediction(
                user_id=session['user_id'],
                temperature=features['Temperature'],
                humidity=features['Humidity'],
                square_footage=features['SquareFootage'],
                occupancy=features['Occupancy'],
                hvac_usage=features['HVACUsage'],
                lighting_usage=features['LightingUsage'],
                renewable_energy=features['RenewableEnergy'],
                predicted_consumption=predicted_value
            )
            db.session.add(new_prediction)
            
            results.append({
                'prediction': round(predicted_value, 2),
                'suggestions': suggestions,
                'savings_potential': round(savings, 2),
                'comparison': comparison,
                'input_data': {
                    'temperature': features['Temperature'],
                    'humidity': features['Humidity'],
                    'square_footage': features['SquareFootage'],
                    'occupancy': features['Occupancy']
                }
            })
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'total_predictions': len(results),
            'results': results
        })
        
    except Exception as e:
        return jsonify({'error': f'Processing error: {str(e)}'}), 500

if __name__ == '__main__':
    app.run()    

