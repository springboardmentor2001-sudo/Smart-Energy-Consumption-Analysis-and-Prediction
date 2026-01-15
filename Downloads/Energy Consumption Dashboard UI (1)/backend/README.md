# SmartEnergy ML Backend

A production-ready Flask API for energy consumption prediction using machine learning.

## 🚀 Features

- **ML Prediction API**: Random Forest model for energy consumption forecasting
- **Real-time Predictions**: RESTful API with JSON responses
- **Data Validation**: Comprehensive input validation and error handling
- **Rate Limiting**: Built-in rate limiting to prevent abuse
- **CORS Support**: Cross-origin resource sharing for web applications
- **Health Monitoring**: API health checks and performance metrics
- **Confidence Bounds**: Prediction uncertainty estimation

## 📋 API Endpoints

### Health Check
```http
GET /api/health
```
Returns model status and system health.

### Model Information
```http
GET /api/model-info
```
Returns details about the loaded ML model.

### Energy Prediction
```http
POST /api/predict
Content-Type: application/json

{
  "features": [{
    "timestamp": "2024-01-15T14:30:00",
    "temperature": 22.5,
    "humidity": 65.0,
    "occupancy": 150,
    "renewable": 45.0
  }],
  "include_confidence": true
}
```

### Input Validation
```http
POST /api/validate
```
Validate input data without making predictions.

### Performance Metrics
```http
GET /api/metrics
```
Get API usage statistics.

## 🛠 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv backend_env
   backend_env\Scripts\activate  # Windows
   # source backend_env/bin/activate  # Linux/Mac
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Train or load model**
   ```bash
   python train_model.py
   ```

5. **Run setup check**
   ```bash
   python check_setup.py
   ```

## 🚀 Running the Server

### Development
```bash
python app.py
```

### Production
```bash
# Using gunicorn (recommended)
gunicorn --bind 0.0.0.0:5000 app:app

# Or using the built-in server
python app.py
```

## 🧪 Testing

### Run all tests
```bash
python test_model.py
```

### API testing
```bash
# Health check
curl http://localhost:5000/api/health

# Model info
curl http://localhost:5000/api/model-info

# Prediction
curl -X POST http://localhost:5000/api/predict \
  -H "Content-Type: application/json" \
  -d '{"features": [{"timestamp": "2024-01-15T14:30:00", "temperature": 22.5, "humidity": 65.0, "occupancy": 150, "renewable": 45.0}]}'
```

## 📊 Model Details

- **Algorithm**: Random Forest Regressor
- **Features**: 8 input features
  - Temperature (°C)
  - Humidity (%)
  - Occupancy (persons)
  - Renewable energy (%)
  - Hour of day
  - Day of week
  - Month
  - Weekend flag

- **Target**: Energy consumption (kWh)

## 🔧 Configuration

Environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Server port |
| `DEBUG` | `False` | Debug mode |
| `MODEL_PATH` | `random_forest_model.pkl` | Path to ML model |
| `CORS_ORIGINS` | `http://localhost:3000` | Allowed CORS origins |
| `VALIDATION_STRICT` | `False` | Strict input validation |

## 📁 Project Structure

```
backend/
├── app.py                 # Main Flask application
├── config.py              # Configuration settings
├── train_model.py         # Model training script
├── test_model.py          # Model testing suite
├── inspect_model.py       # Model inspection tools
├── check_setup.py         # Setup verification
├── requirements.txt       # Python dependencies
├── Procfile              # Railway deployment config
├── random_forest_model.pkl # Trained ML model
└── README.md             # This file
```

## 🚢 Deployment

### Railway (Recommended)
1. Connect GitHub repository to Railway
2. Set environment variables
3. Deploy automatically

### Manual Deployment
```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variables
export PORT=5000
export DEBUG=False

# Run server
python app.py
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `python test_model.py`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.