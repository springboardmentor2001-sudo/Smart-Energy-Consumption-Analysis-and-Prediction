# app.py - CORRECTED VERSION with Chatbot Chat Endpoint
from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import csv
import io
import PyPDF2
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
import os
from datetime import datetime
import requests

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "your-secret-key-here-change-in-production")
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///energy_predictor.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# OpenWeatherMap API Key
WEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "")

db = SQLAlchemy(app)

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'csv', 'pdf'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB

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

# Mock energy model
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
    """Fetch weather data from API"""
    if not WEATHER_API_KEY:
        return {'temperature': 22, 'humidity': 55, 'description': 'Clear sky'}
    
    try:
        url = "https://api.openweathermap.org/data/2.5/weather"
        params = {"q": city, "appid": WEATHER_API_KEY, "units": "metric"}
        response = requests.get(url, params=params, timeout=5)
        response.raise_for_status()
        data = response.json()
        return {
            'temperature': round(data['main']['temp'], 1),
            'humidity': data['main']['humidity'],
            'description': data['weather'][0]['description']
        }
    except:
        return None

def generate_suggestions(prediction_data, predicted_value, device_profile=None):
    """Generate energy-saving suggestions"""
    suggestions = []
    savings_potential = 0
    
    # HVAC
    if prediction_data['HVACUsage'] == 1:
        hvac_consumption = 15
        suggestions.append({
            'category': 'HVAC Optimization',
            'icon': '❄️',
            'message': f'HVAC is {int(hvac_consumption/predicted_value*100)}% of total consumption',
            'action': 'Adjust thermostat by 2-3°F when away',
            'savings': '10-15 kWh/day'
        })
        savings_potential += 12
    
    # Temperature
    temp = prediction_data['Temperature']
    if temp > 26:
        suggestions.append({
            'category': 'Cooling Efficiency',
            'icon': '🌡️',
            'message': f'High temperature ({temp}°C) increases cooling demand',
            'action': 'Use fans alongside AC. Close blinds during peak sun',
            'savings': '5-8 kWh/day'
        })
        savings_potential += 6
    elif temp < 18:
        suggestions.append({
            'category': 'Heating Efficiency',
            'icon': '🔥',
            'message': f'Low temperature ({temp}°C) increases heating demand',
            'action': 'Seal air leaks and add insulation',
            'savings': '8-12 kWh/day'
        })
        savings_potential += 10
    
    # Lighting
    if prediction_data['LightingUsage'] == 1:
        suggestions.append({
            'category': 'Lighting Upgrade',
            'icon': '💡',
            'message': 'Lighting contributes ~3 kWh to consumption',
            'action': 'Switch to LED bulbs (75% more efficient)',
            'savings': '2-3 kWh/day'
        })
        savings_potential += 2.5
    
    # Peak hours
    hour = datetime.now().hour
    if 17 <= hour <= 21:
        suggestions.append({
            'category': 'Peak Hour Alert',
            'icon': '🕐',
            'message': 'Currently in peak hours (5-9 PM)',
            'action': 'Shift heavy appliance use to off-peak hours',
            'savings': '15-20% cost reduction'
        })
    
    # Renewable energy
    renewable = prediction_data['RenewableEnergy']
    renewable_pct = (renewable / predicted_value * 100) if predicted_value > 0 else 0
    if renewable_pct < 20:
        suggestions.append({
            'category': 'Renewable Energy',
            'icon': '☀️',
            'message': f'Only {renewable_pct:.1f}% renewable energy',
            'action': 'Consider solar panels or green energy plan',
            'savings': f'Offset {predicted_value * 0.3:.1f} kWh with solar'
        })
        savings_potential += predicted_value * 0.3
    
    # Devices
    if device_profile:
        if device_profile.refrigerators > 1:
            suggestions.append({
                'category': 'Appliance Efficiency',
                'icon': '🧊',
                'message': f'{device_profile.refrigerators} refrigerators detected',
                'action': 'Replace old units with Energy Star models',
                'savings': '30-50 kWh/month per unit'
            })
        if device_profile.water_heaters > 0:
            suggestions.append({
                'category': 'Water Heating',
                'icon': '💧',
                'message': 'Water heaters are major consumers',
                'action': 'Lower to 49°C and insulate tank',
                'savings': '10-15 kWh/day'
            })
    
    return suggestions, savings_potential

def calculate_comparison(predicted_value, square_footage, occupancy):
    """Compare with typical homes"""
    typical = (square_footage * 0.03) + (occupancy * 10)
    diff_pct = ((predicted_value - typical) / typical * 100) if typical > 0 else 0
    return {
        'your_usage': round(predicted_value, 2),
        'typical_usage': round(typical, 2),
        'difference': round(predicted_value - typical, 2),
        'percentage': round(abs(diff_pct), 1),
        'status': 'above' if diff_pct > 0 else 'below'
    }

def prepare_features(data):
    now = datetime.now()
    return {
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

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def parse_csv_file(file):
    """Parse CSV file using built-in csv module"""
    try:
        # Read file content
        content = file.read().decode('utf-8')
        file.seek(0)  # Reset file pointer
        
        # Parse CSV
        csv_reader = csv.DictReader(io.StringIO(content))
        
        predictions = []
        for row in csv_reader:
            # Convert column names to lowercase
            row = {k.lower().strip(): v for k, v in row.items()}
            
            data = {
                'temperature': float(row.get('temperature', 20)),
                'humidity': float(row.get('humidity', 50)),
                'square_footage': float(row.get('square_footage', 2000)),
                'occupancy': int(float(row.get('occupancy', 2))),
                'hvac_usage': int(float(row.get('hvac_usage', 0))),
                'lighting_usage': int(float(row.get('lighting_usage', 0))),
                'holiday': int(float(row.get('holiday', 0))),
                'renewable_energy': float(row.get('renewable_energy', 10))
            }
            predictions.append(data)
        
        return predictions, None
    except Exception as e:
        return None, f"Error parsing CSV: {str(e)}"

def get_chatbot_response(message):
    """Simple chatbot responses"""
    import re
    msg = message.lower()
    
    # Check for device/appliance questions FIRST (most specific)
    if any(w in msg for w in ['device', 'appliance', 'which']) and any(w in msg for w in ['cost', 'use', 'most', 'consume']):
        return "🔌 **Top energy consumers**:\n1. HVAC - 2000-5000W\n2. Water Heater - 4000-5500W\n3. Dryer - 2000-5000W\n4. Oven - 2000-5000W\n5. AC - 1000-4000W"
    
    # Check for bill/cost questions (more general)
    elif any(w in msg for w in ['bill', 'expensive']) or (re.search(r'\bhigh\b', msg) and 'bill' in msg) or ('cost' in msg and 'device' not in msg):
        return "💰 **High bills** usually come from:\n• HVAC (40-50%)\n• Water heaters (15-20%)\n• Old appliances (30-40% less efficient)\n• Phantom loads (5-10%)\n\nUse our prediction tool for personalized recommendations!"
    
    # Check for greetings (using word boundaries to avoid matching 'hi' in 'high')
    elif re.search(r'\b(hi|hello|hey)\b', msg):
        return "👋 Hello! I'm your Energy Assistant. I can help with consumption predictions, saving tips, and energy questions!"
    
    elif any(w in msg for w in ['peak', 'hours', 'time']):
        return "⏰ **Peak hours** are 5-9 PM on weekdays when costs are highest. Run heavy appliances after 9 PM to save money!"
    
    elif any(w in msg for w in ['save', 'reduce', 'tips', 'lower']):
        return "💡 **Top saving tips**:\n✅ LED bulbs (75% efficient)\n✅ Adjust thermostat 3°F when away\n✅ Unplug unused devices\n✅ Cold water laundry\n✅ Regular HVAC maintenance\n✅ Smart power strips"
    
    elif any(w in msg for w in ['solar', 'renewable', 'panel']):
        return "☀️ **Renewable options**:\n• Solar panels: $15-25K, 6-10 year payback\n• Green energy plans: Same price, zero install\n• Typical savings: 50-90% on bills"
    
    elif any(w in msg for w in ['temperature', 'hvac', 'thermostat', 'ac', 'heat']):
        return "🌡️ **Temperature tips**:\n• Summer: 78°F (26°C) home, 85°F (29°C) away\n• Winter: 68°F (20°C) home, 60°F (15°C) away\n• Each degree saves 3-5%!"
    
    elif any(w in msg for w in ['predict', 'consumption', 'usage']):
        return "🔮 Use our **Prediction** page to get personalized consumption forecasts and savings recommendations!"
    
    elif any(w in msg for w in ['thank']):
        return "😊 You're welcome! Ask anytime!"
    
    else:
        return "🤔 I can help with:\n• Peak hours\n• High bills\n• Device usage\n• Savings tips\n• Solar options\n• Temperature settings\n• Predictions\n\nWhat interests you?"

# Routes
@app.route('/')
def index():
    return redirect(url_for('home') if 'user_id' in session else url_for('login'))

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
        return render_template('login.html', error='Invalid credentials')
    
    return render_template('login.html')

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        
        if User.query.filter_by(email=email).first():
            return render_template('signup.html', error='Email already exists')
        
        new_user = User(email=email, password=generate_password_hash(password))
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
        data = request.json if request.is_json else request.form
        features = prepare_features(data)
        predicted_value = model.predict(features)
        
        device_profile = DeviceProfile.query.filter_by(user_id=session['user_id']).first()
        
        # Update devices if provided
        if 'devices' in data:
            devices = data['devices'] if isinstance(data['devices'], dict) else {}
            if device_profile:
                device_profile.tvs = int(devices.get('tvs', 0))
                device_profile.refrigerators = int(devices.get('refrigerators', 0))
                device_profile.washing_machines = int(devices.get('washing_machines', 0))
                device_profile.dryers = int(devices.get('dryers', 0))
                device_profile.computers = int(devices.get('computers', 0))
                device_profile.ac_units = int(devices.get('ac_units', 0))
                device_profile.water_heaters = int(devices.get('water_heaters', 0))
                device_profile.dishwashers = int(devices.get('dishwashers', 0))
                device_profile.updated_at = datetime.utcnow()
            else:
                device_profile = DeviceProfile(
                    user_id=session['user_id'],
                    **{k: int(v) for k, v in devices.items()}
                )
                db.session.add(device_profile)
        
        suggestions, savings = generate_suggestions(features, predicted_value, device_profile)
        comparison = calculate_comparison(predicted_value, features['SquareFootage'], features['Occupancy'])
        
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
            for field in ['tvs', 'refrigerators', 'washing_machines', 'dryers', 
                         'computers', 'ac_units', 'water_heaters', 'dishwashers']:
                setattr(device_profile, field, int(data.get(field, 0)))
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
    
    weather = get_weather_data(city)
    return jsonify(weather) if weather else jsonify({'error': 'Could not fetch weather'}), 404

@app.route('/chatbot')
def chatbot():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    return render_template('chatbot.html')

@app.route('/chatbot/chat', methods=['POST'])
def chatbot_chat():
    """NEW: Chatbot conversation endpoint"""
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    data = request.json
    user_message = data.get('message', '')
    
    if not user_message:
        return jsonify({'error': 'No message'}), 400
    
    response = get_chatbot_response(user_message)
    return jsonify({'response': response})

@app.route('/contact', methods=['GET', 'POST'])
def contact():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    if request.method == 'POST':
        new_contact = Contact(
            name=request.form['name'],
            email=request.form['email'],
            query=request.form['query'],
            rating=int(request.form['rating'])
        )
        db.session.add(new_contact)
        db.session.commit()
        return render_template('contact.html', success=True)
    
    return render_template('contact.html')

@app.route('/api/prediction_history')
def prediction_history():
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    predictions = Prediction.query.filter_by(user_id=session['user_id']).order_by(
        Prediction.timestamp.desc()).limit(10).all()
    
    return jsonify([{
        'timestamp': p.timestamp.strftime('%Y-%m-%d %H:%M'),
        'consumption': round(p.predicted_consumption, 2)
    } for p in predictions])

@app.route('/prediction/upload', methods=['POST'])
def upload_prediction_file():
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    if not file.filename or not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file'}), 400
    
    # Simplified CSV/PDF parsing would go here
    return jsonify({'error': 'File upload feature coming soon'}), 501

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
