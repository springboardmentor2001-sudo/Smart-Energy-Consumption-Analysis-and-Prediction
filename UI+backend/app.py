from flask import Flask, render_template, request, jsonify, redirect, url_for, flash, session
from flask_session import Session
from functools import wraps
import pandas as pd
import joblib
import os
import re
import json
from datetime import datetime
from dotenv import load_dotenv
import sqlite3

from src.preprocessing import preprocess_input
from src.chatbot import load_chatbot, get_chat_response
from src.database import init_db, save_prediction, get_user_predictions, save_chat_history, get_chat_history

app = Flask(__name__)
app.secret_key = os.urandom(24)
app.config['SESSION_TYPE'] = 'filesystem'
app.config['PERMANENT_SESSION_LIFETIME'] = 3600  # 1 hour
Session(app)

# Load environment variables
load_dotenv()

# Initialize database
init_db()

# Load Model & Features
try:
    model = joblib.load("models/lightgbm_energy_model.pkl")
    features = joblib.load("models/model_features.pkl")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None
    features = None

# Load Chatbot
try:
    chat_model = load_chatbot(os.getenv("GEMINI_API_KEY"))
except Exception as e:
    print(f"Chatbot failed to load: {e}")
    chat_model = None

# Load Historical Data
try:
    dataset = pd.read_csv("data/Energy_consumption.csv")
    dataset['Timestamp'] = dataset['Timestamp'].astype(str)
except Exception as e:
    print(f"Warning: Could not load CSV data: {e}")
    dataset = pd.DataFrame()

# Authentication decorator
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Please login to access this page', 'warning')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

@app.route("/")
def index():
    if 'user_id' in session:
        return redirect(url_for('home'))
    return redirect(url_for('login'))

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")
        
        conn = sqlite3.connect('smart_energy.db')
        cursor = conn.cursor()
        cursor.execute("SELECT id, username FROM users WHERE username = ? AND password = ?", 
                      (username, password))
        user = cursor.fetchone()
        conn.close()
        
        if user:
            session['user_id'] = user[0]
            session['username'] = user[1]
            flash('Login successful!', 'success')
            return redirect(url_for('home'))
        else:
            flash('Invalid credentials', 'error')
    
    return render_template("login.html")

@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        username = request.form.get("username")
        email = request.form.get("email")
        password = request.form.get("password")
        
        conn = sqlite3.connect('smart_energy.db')
        cursor = conn.cursor()
        
        # Check if user exists
        cursor.execute("SELECT id FROM users WHERE username = ? OR email = ?", 
                      (username, email))
        if cursor.fetchone():
            flash('Username or email already exists', 'error')
            conn.close()
            return render_template("register.html")
        
        # Create new user
        cursor.execute("INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
                      (username, email, password))
        conn.commit()
        user_id = cursor.lastrowid
        conn.close()
        
        session['user_id'] = user_id
        session['username'] = username
        flash('Registration successful!', 'success')
        return redirect(url_for('home'))
    
    return render_template("register.html")

@app.route("/logout")
def logout():
    session.clear()
    flash('Logged out successfully', 'info')
    return redirect(url_for('login'))

@app.route("/home")
@login_required
def home():
    return render_template("home.html", username=session.get('username'))

@app.route("/predict", methods=["GET", "POST"])
@login_required
def predict():
    prediction = None
    analysis_link = None
    
    if request.method == "POST":
        try:
            data = {
                "Timestamp": request.form["timestamp"],
                "Temperature": float(request.form["temperature"]),
                "Humidity": float(request.form.get("humidity", 45)),
                "SquareFootage": int(request.form["sqft"]),
                "Occupancy": int(request.form["occupancy"]),
                "HVACUsage": request.form["hvac"],
                "LightingUsage": request.form["lighting"],
                "RenewableEnergy": float(request.form["renewable"]),
                "Holiday": request.form["holiday"]
            }

            X = preprocess_input(data, features)
            prediction = round(model.predict(X)[0], 2)

            # Save to database
            prediction_id = save_prediction(
                user_id=session['user_id'],
                timestamp=data["Timestamp"],
                temperature=data["Temperature"],
                occupancy=data["Occupancy"],
                hvac_usage=data["HVACUsage"],
                lighting_usage=data["LightingUsage"],
                square_footage=data["SquareFootage"],
                renewable_energy=data["RenewableEnergy"],
                holiday=data["Holiday"],
                prediction=prediction
            )
            
            analysis_link = f"/analysis?prediction_id={prediction_id}"

        except Exception as e:
            print(f"Error during prediction: {e}")
            prediction = "Error"
    
    return render_template("predict.html", prediction=prediction, analysis_link=analysis_link)

@app.route("/analysis")
@login_required
def analysis():
    prediction_id = request.args.get('prediction_id')
    selected_prediction = None
    
    # Get all user predictions
    predictions = get_user_predictions(session['user_id'])
    
    if prediction_id:
        # Find the selected prediction
        for pred in predictions:
            if str(pred['id']) == prediction_id:
                selected_prediction = pred
                break
    
    # Prepare data for charts
    if predictions:
        timestamps = [pred['timestamp'] for pred in predictions[-20:]]  # Last 20
        energy_values = [pred['prediction'] for pred in predictions[-20:]]
        temperatures = [pred['temperature'] for pred in predictions[-20:]]
    else:
        timestamps = energy_values = temperatures = []
    
    chart_data = {
        'timestamps': timestamps,
        'energy_values': energy_values,
        'temperatures': temperatures,
        'predictions': predictions[-10:]  # Last 10 for table
    }
    
    return render_template("analysis.html", 
                         chart_data=chart_data, 
                         predictions=predictions,
                         selected_prediction=selected_prediction,
                         total_predictions=len(predictions))

@app.route("/chatbot", methods=["GET", "POST"])
@login_required
def chatbot():
    reply = None
    chat_history = []
    
    if request.method == "POST":
        user_input = request.form["message"]
        
        # Save user message
        save_chat_history(session['user_id'], 'user', user_input)
        
        if chat_model:
            
            if any(keyword in user_input.lower() for keyword in ['predict', 'forecast', 'estimate', 'calculate']):
                
                prediction_result = process_chat_prediction(user_input)
                if prediction_result:
                    reply = prediction_result
                else:
                    reply = get_chat_response(chat_model, user_input)
            else:
                reply = get_chat_response(chat_model, user_input)
        else:
            reply = "Chatbot is not connected. Check API Key."
        
        # Save AI response
        save_chat_history(session['user_id'], 'assistant', reply)
    
    # Get chat history
    chat_history = get_chat_history(session['user_id'])
    
    
    return render_template("chatbot.html", chat_history=chat_history)

def process_chat_prediction(user_input):
    """Extract parameters and predict, with better error handling."""
    
    # 1. Check if model exists before starting
    if 'model' not in globals() and 'model' not in locals():
        return "Error: The AI model is not loaded."

    try:
        # --- Defaults ---
        data = {
            "Timestamp": datetime.now().strftime("%Y-%m-%d %H:%M"),
            "Temperature": 24.0, 
            "Humidity": 45,
            "SquareFootage": 1500,
            "Occupancy": 3,
            "HVACUsage": "On",
            "LightingUsage": "On",
            "RenewableEnergy": 0.0,
            "Holiday": "No"
        }

        # Temperature
        temp_match = re.search(r'temp(?:erature)?\s*[:=]?\s*(\d+\.?\d*)', user_input, re.IGNORECASE)
        if temp_match:
            data['Temperature'] = float(temp_match.group(1))

        # Occupancy
        occ_match = re.search(r'(?:occupancy|people)\s*[:=]?\s*(\d+)', user_input, re.IGNORECASE)
        if occ_match:
            data['Occupancy'] = int(occ_match.group(1))
            
        # HVAC
        if "hvac off" in user_input.lower() or "ac off" in user_input.lower():
            data['HVACUsage'] = "Off"

        
        try:
            if 'features' not in globals():
                return "Error: 'features' list is missing."
                
            X = preprocess_input(data, features)
            prediction = round(model.predict(X)[0], 2)
            
            return (f"Based on your input (Temp: {data['Temperature']}°C, "
                    f"Occupancy: {data['Occupancy']}), estimated usage is **{prediction} kWh**.")
            
        except NameError as ne:
            return f"Code Error: Missing function or variable. Details: {ne}"
            
    except Exception as e:
        print(f"Full Error Traceback: {e}") 
        return f"Prediction failed: {str(e)}" 

@app.route("/about")
@login_required
def about():
    return render_template("about.html")

@app.route("/feedback", methods=["POST"])
@login_required
def submit_feedback():
    feedback = request.form.get("feedback")
    rating = request.form.get("rating")
    
    conn = sqlite3.connect('smart_energy.db')
    cursor = conn.cursor()
    cursor.execute("INSERT INTO feedback (user_id, feedback, rating) VALUES (?, ?, ?)",
                  (session['user_id'], feedback, rating))
    conn.commit()
    conn.close()
    
    flash('Thank you for your feedback!', 'success')
    return redirect(url_for('about'))

@app.route("/clear_chat", methods=["POST"])
@login_required
def clear_chat():
    """Clear chat history for current user"""
    try:
        conn = sqlite3.connect('smart_energy.db')
        cursor = conn.cursor()
        cursor.execute("DELETE FROM chat_history WHERE user_id = ?", (session['user_id'],))
        conn.commit()
        conn.close()
        flash('Chat history cleared!', 'success')
    except:
        flash('Error clearing chat', 'error')
    
    return redirect(url_for('chatbot'))
if __name__ == "__main__":
    app.run(debug=True, port=5000)