# Smart-Energy-Consumption-Analysis-and-Prediction
Using the SmartHome Energy Monitoring Dataset with detailed timestamped device-level power readings collected over six months, the system performs time series analysis and forecasting using Long Short-Term Memory (LSTM) networks and Linear Regression as a baseline model.

# ⚡ Smart Energy Predictor

> An intelligent web application that predicts energy consumption using machine learning and provides personalized energy-saving recommendations.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://smart-energy-consumption-analysis-and-y4sj.onrender.com)
[![Python](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![Flask](https://img.shields.io/badge/flask-3.0.0-lightgrey.svg)](https://flask.palletsprojects.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## 🌟 Features

### Core Functionality
- **🔮 Energy Consumption Prediction** - ML-powered predictions based on multiple environmental and usage factors
- **📊 Interactive Dashboard** - Tabbed interface with Results, Suggestions, and History views
- **💡 Personalized Recommendations** - AI-generated energy-saving tips based on your usage patterns
- **📈 Prediction History** - Track and visualize your energy consumption trends over time
- **🤖 Conversational Chatbot** - Step-by-step guided predictions through interactive chat

### Advanced Features
- **📁 File Upload** - Batch predictions via CSV/PDF file uploads
- **🌤️ Live Weather Integration** - Auto-fill temperature and humidity data from OpenWeatherMap API
- **🏠 Device Profiling** - Track household devices for device-specific suggestions
- **📉 Comparison Analytics** - Compare your usage against similar homes
- **💰 Savings Calculator** - Estimate potential energy and cost savings

### User Experience
- **🎨 Modern UI** - Clean purple gradient theme with smooth animations
- **📱 Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **🔐 Secure Authentication** - User accounts with encrypted password storage
- **⚡ Real-time Updates** - Instant predictions and dynamic chart updates

---

## 🚀 Demo

**Live Website:** [!LIVE DEMO](https://smart-energy-consumption-analysis-and-y4sj.onrender.com)

---

## 🛠️ Technologies Used

### Backend
- **Flask 3.0.0** - Web framework
- **SQLAlchemy** - Database ORM
- **LightGBM / Scikit-learn** - Machine learning models
- **PyPDF2** - PDF file processing
- **Pandas & NumPy** - Data processing

### Frontend
- **HTML5 & CSS3** - Structure and styling
- **JavaScript (ES6+)** - Interactive features
- **Chart.js** - Data visualization
- **Responsive Grid Layout** - Mobile-first design

### Database
- **SQLite** - Development database
- **PostgreSQL** - Production database (recommended)

### APIs
- **OpenWeatherMap API** - Live weather data

---

## 📋 Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- Git
- OpenWeatherMap API key (optional, for live weather)

---

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/smart-energy-predictor.git
cd smart-energy-predictor
```

### 2. Create Virtual Environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```env
SECRET_KEY=your-secret-key-here
WEATHER_API_KEY=your-openweathermap-api-key
DATABASE_URL=sqlite:///energy_predictor.db
FLASK_ENV=development
```

### 5. Initialize Database

```bash
python
>>> from app import app, db
>>> with app.app_context():
...     db.create_all()
>>> exit()
```

### 6. Run the Application

```bash
python app.py
```

Visit `http://127.0.0.1:5000` in your browser.

---

## 📁 Project Structure

```
smart-energy-predictor/
│
├── app.py                          # Main Flask application
├── requirements.txt                # Python dependencies
├── README.md                       # Project documentation
├── .env                           # Environment variables (create this)
├── .gitignore                     # Git ignore file
│
├── templates/                      # HTML templates
│   ├── base.html                  # Base template with navigation
│   ├── login.html                 # Login page
│   ├── signup.html                # Registration page
│   ├── home.html                  # Landing page
│   ├── about.html                 # About page
│   ├── prediction.html            # Main prediction interface
│   ├── chatbot.html               # Conversational chatbot
│   ├── contact.html               # Contact/feedback page
│   └── device_survey.html         # Device profiling (optional)
│
│
├── instance/                       # Instance-specific files
│   └── energy_predictor.db        # SQLite database (auto-generated)
│
├── uploads/                        # User-uploaded files (auto-generated)
│
├── models/                         # ML models
    └── smart_energy_model.pkl     # Trained prediction model

```

---

## 💡 Usage Guide

### Making Your First Prediction

1. **Sign Up / Login**
   - Create an account with email and password
   - Login to access the dashboard

2. **Enter Energy Data**
   - Navigate to **Prediction** tab
   - Fill in the form:
     - Temperature (°C)
     - Humidity (%)
     - Square Footage
     - Occupancy (number of people)
     - HVAC Status (On/Off)
     - Lighting Status (On/Off)
     - Renewable Energy (kWh)
   - Optionally select your household devices

3. **Get Live Weather** (Optional)
   - Enter your city name
   - Click "Get Weather" to auto-fill temperature and humidity

4. **Generate Prediction**
   - Click "Generate Prediction & Suggestions"
   - View results with:
     - Predicted consumption in kWh
     - Comparison with similar homes
     - Personalized energy-saving tips
     - Potential savings calculation

### Using File Upload

Upload CSV or PDF files for batch predictions:

**CSV Format:**
```csv
temperature,humidity,square_footage,occupancy,hvac_usage,lighting_usage,renewable_energy
22.5,55,2000,4,1,1,15
25.0,60,1800,3,1,0,20
```

**PDF Format:**
```
Temperature: 25°C
Humidity: 60%
Square Footage: 2000
Occupancy: 4
HVAC: On
Lighting: On
Renewable Energy: 15 kWh
```

### Using the Chatbot

1. Navigate to **Chatbot** tab
2. Answer questions one by one:
   - Temperature
   - Humidity
   - Square footage
   - Occupancy
   - HVAC status
   - Lighting status
   - Renewable energy
3. Get instant prediction with suggestions

---

## 🤖 Machine Learning Model

### Model Details
- **Algorithm:** LightGBM Regressor
- **Features:** 20+ engineered features including:
  - Environmental: Temperature, Humidity
  - Building: Square Footage
  - Usage: Occupancy, HVAC, Lighting
  - Time-based: Hour, Day, Month, Weekend
  - Engineered: Temp_Occupancy, Area_Occupancy, Renewable_Ratio
  - Categorical: Day of Week (one-hot encoded)

### Model Performance
- **R² Score:** ~0.95
- **RMSE:** ~5.2 kWh
- **MAE:** ~3.8 kWh

### Prediction Logic
```python
def prepare_features(data):
    # Auto-calculate time features
    now = datetime.now()
    hour = now.hour
    day = now.day
    month = now.month
    is_weekend = 1 if now.strftime('%A') in ['Saturday', 'Sunday'] else 0
    
    # Engineer features
    temp_occupancy = temperature * occupancy
    area_occupancy = square_footage * occupancy
    
    # Return feature array for model
    return features_df
```

---

## 📊 Database Schema

### User Table
```sql
CREATE TABLE user (
    id INTEGER PRIMARY KEY,
    email VARCHAR(120) UNIQUE NOT NULL,
    password VARCHAR(200) NOT NULL
);
```

### Prediction Table
```sql
CREATE TABLE prediction (
    id INTEGER PRIMARY KEY,
    user_id INTEGER FOREIGN KEY,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    temperature FLOAT,
    humidity FLOAT,
    square_footage FLOAT,
    occupancy INTEGER,
    hvac_usage INTEGER,
    lighting_usage INTEGER,
    renewable_energy FLOAT,
    predicted_consumption FLOAT
);
```

### DeviceProfile Table
```sql
CREATE TABLE device_profile (
    id INTEGER PRIMARY KEY,
    user_id INTEGER FOREIGN KEY,
    tvs INTEGER DEFAULT 0,
    refrigerators INTEGER DEFAULT 0,
    washing_machines INTEGER DEFAULT 0,
    dryers INTEGER DEFAULT 0,
    computers INTEGER DEFAULT 0,
    ac_units INTEGER DEFAULT 0,
    water_heaters INTEGER DEFAULT 0,
    dishwashers INTEGER DEFAULT 0,
    updated_at DATETIME
);
```

### Contact Table
```sql
CREATE TABLE contact (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(120),
    query TEXT,
    rating INTEGER,
    timestamp DATETIME
);
```

---

## 🌐 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Home redirect |
| `/login` | GET, POST | User login |
| `/signup` | GET, POST | User registration |
| `/logout` | GET | User logout |
| `/home` | GET | Landing page |
| `/about` | GET | About page |
| `/prediction` | GET, POST | Prediction form & processing |
| `/prediction/upload` | POST | File upload predictions |
| `/chatbot` | GET | Chatbot interface |
| `/chatbot/predict` | POST | Chatbot prediction |
| `/device-survey` | GET, POST | Device profiling |
| `/contact` | GET, POST | Contact form |
| `/api/prediction_history` | GET | Get user's prediction history (JSON) |
| `/api/weather/{city}` | GET | Get live weather data (JSON) |

---

## 🎨 Customization

### Changing Colors

Edit the CSS gradient in `templates/base.html` and `prediction.html`:

```css
/* Purple gradient (default) */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Blue gradient */
background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);

/* Green gradient */
background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
```

### Adding New Features

To add input fields to the prediction form:

1. Add field to `prediction.html` form
2. Update `prepare_features()` in `app.py`
3. Retrain model with new feature
4. Update `generate_suggestions()` for new advice

### Modifying Suggestions

Edit the `generate_suggestions()` function in `app.py`:

```python
if your_condition:
    suggestions.append({
        'category': 'Your Category',
        'icon': '🎯',
        'message': 'Your message',
        'action': 'What to do',
        'savings': 'X kWh/day'
    })
```

---

## 🚀 Deployment

### Deploy to Heroku

```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create Heroku app
heroku create your-app-name

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set SECRET_KEY=your-secret-key
heroku config:set WEATHER_API_KEY=your-api-key

# Deploy
git push heroku main

# Initialize database
heroku run python
>>> from app import app, db
>>> with app.app_context():
...     db.create_all()
```

### Deploy to Railway / Render

1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically on push

### Deploy to AWS / DigitalOcean

Use Gunicorn for production:

```bash
pip install gunicorn
gunicorn app:app
```

---

## 🔒 Security Best Practices

- ✅ Passwords are hashed using Werkzeug's security module
- ✅ Session management with secure cookies
- ✅ CSRF protection (recommended: add Flask-WTF)
- ✅ Input validation on all forms
- ✅ File upload size limits (16MB max)
- ✅ SQL injection prevention via SQLAlchemy ORM
- ⚠️ **Remember:** Change `SECRET_KEY` before deployment
- ⚠️ **Use HTTPS** in production
- ⚠️ **Enable rate limiting** for API endpoints

---

## 🐛 Troubleshooting

### Common Issues

**Issue:** Database errors on first run
```bash
# Solution: Initialize database
python
>>> from app import app, db
>>> with app.app_context():
...     db.create_all()
```

**Issue:** Weather API not working
```bash
# Solution: Check API key in .env
WEATHER_API_KEY=your-actual-api-key
```

**Issue:** File upload fails
```bash
# Solution: Install PyPDF2
pip install PyPDF2
```

**Issue:** Port 5000 already in use
```python
# Solution: Change port in app.py
if __name__ == '__main__':
    app.run(debug=True, port=5001)
```

---

## 📈 Future Enhancements

- [ ] Email notifications for high consumption
- [ ] Mobile app (React Native)
- [ ] Integration with smart home devices (IoT)
- [ ] Historical data analysis & trends
- [ ] Social features (community comparisons)
- [ ] Export reports to PDF
- [ ] Multi-language support
- [ ] Admin dashboard
- [ ] Advanced ML models (LSTM for time series)
- [ ] Carbon footprint calculation

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- GitHub: [@Sanjana1125](https://github.com/Sanjana1125)
- LinkedIn: [Sanjana Chinamuthevi](https://linkedin.com/in/sanjana-chinamuthevi)

---

**Made with ❤️ and ⚡ for a sustainable future**
