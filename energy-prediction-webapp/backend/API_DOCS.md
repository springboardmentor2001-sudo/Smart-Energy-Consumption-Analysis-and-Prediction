# Backend API Documentation

## Getting Started

### Installation

```bash
cd backend
pip install -r requirements.txt
```

### Configuration

Create a `.env` file with the following variables:

```env
FLASK_ENV=development
FLASK_DEBUG=True
JWT_SECRET_KEY=your-secret-key-here
GEMINI_API_KEY=your-gemini-api-key
SERVER_HOST=0.0.0.0
SERVER_PORT=5000
```

### Running the Server

```bash
python app.py
```

## API Endpoints

### Health Check
```
GET /api/health

Response:
{
  "status": "healthy",
  "model_loaded": true,
  "timestamp": "2024-01-16T10:00:00"
}
```

### Authentication

#### Sign Up
```
POST /api/auth/signup

Body:
{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name"
}

Response:
{
  "message": "Signup successful",
  "access_token": "jwt_token_here",
  "user": {
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

#### Login
```
POST /api/auth/login

Body:
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "message": "Login successful",
  "access_token": "jwt_token_here",
  "user": {
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

#### Get Profile
```
GET /api/auth/profile
Header: Authorization: Bearer {access_token}

Response:
{
  "email": "user@example.com",
  "name": "User Name"
}
```

### Predictions

#### Form Prediction
```
POST /api/predict/form
Header: Authorization: Bearer {access_token}

Body:
{
  "temperature": 20,
  "humidity": 50,
  "square_footage": 5000,
  "month": 1
}

Response:
{
  "prediction": 245.67,
  "unit": "kWh",
  "confidence": "High",
  "input_data": {...}
}
```

#### File Prediction
```
POST /api/predict/file
Header: Authorization: Bearer {access_token}
Content-Type: multipart/form-data

Body: (Form data with 'file' field)

Response:
{
  "filename": "data.csv",
  "total_rows": 100,
  "average_prediction": 256.45,
  "predictions": [
    {"row": 0, "prediction": 245.67, "unit": "kWh"},
    ...
  ]
}
```

### Reports

#### Get Summary
```
GET /api/reports/summary
Header: Authorization: Bearer {access_token}

Response:
{
  "dates": ["2024-01-01", "2024-01-02", ...],
  "predictions": [245.67, 250.12, ...],
  "actual": [240.50, 255.30, ...],
  "efficiency_score": [92, 88, ...],
  "average_daily_consumption": 247.5,
  "peak_consumption": 456.78,
  "efficiency_trend": "improving"
}
```

### Chatbot

#### Send Message
```
POST /api/chatbot/message
Header: Authorization: Bearer {access_token}

Body:
{
  "message": "What is my predicted energy consumption?"
}

Response:
{
  "response": "Based on your current parameters...",
  "is_prediction": true,
  "timestamp": "2024-01-16T10:00:00"
}
```

#### Voice Input
```
POST /api/chatbot/voice
Header: Authorization: Bearer {access_token}
Content-Type: multipart/form-data

Body: (Form data with 'audio' file)

Response:
{
  "message": "Voice processing is in demo mode...",
  "processed_text": null
}
```

### Model Info
```
GET /api/model/info

Response:
{
  "model_name": "Energy Consumption Predictor",
  "model_type": "LightGBM Regressor",
  "version": "1.0.0",
  "accuracy": 0.92,
  "features": ["Temperature", "Humidity", ...],
  "created_date": "2024-01-01",
  "last_updated": "2024-01-16"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid input data"
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid email or password"
}
```

### 404 Not Found
```json
{
  "error": "Endpoint not found"
}
```

### 409 Conflict
```json
{
  "error": "Email already registered"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Feature Engineering

The backend automatically applies the same feature engineering as the training data:

1. **Temporal Features**
   - Extracts month, day, weekday from timestamp
   - Creates cyclical encodings for seasonality

2. **Degree Days**
   - HDD = max(0, 18°C - Temperature)
   - CDD = max(0, Temperature - 22°C)
   - Squared versions for non-linear effects

3. **HVAC Indicators**
   - Heating_On: 1 if HDD > 0, else 0
   - Cooling_On: 1 if CDD > 0, else 0

4. **Interaction Features**
   - Temperature × Humidity
   - HDD × Is_Weekend
   - CDD × Is_Weekend

## Production Deployment

### Using Gunicorn
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Using Docker
```dockerfile
FROM python:3.9
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

## Rate Limiting

Implement rate limiting for production:
```bash
pip install Flask-Limiter
```

## Database Integration

For production, replace in-memory user storage with a database:
```python
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://user:password@localhost/energy_db'
db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    name = db.Column(db.String(120))
```

## Monitoring and Logging

```python
import logging

logging.basicConfig(
    filename='app.log',
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.before_request
def log_request():
    logger.info(f'{request.method} {request.path}')
```
