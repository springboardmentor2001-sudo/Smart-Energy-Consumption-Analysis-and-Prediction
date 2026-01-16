# Smart Energy Consumption Analysis

![Smart Energy Dashboard](https://img.shields.io/badge/AI-Powered-blue) ![Flask](https://img.shields.io/badge/Flask-3.0-green) ![LSTM](https://img.shields.io/badge/LSTM-Neural%20Network-purple)

An AI-powered web application for smart energy consumption analysis and prediction using LSTM neural networks. Monitor, analyze, and optimize your energy usage with beautiful visualizations and intelligent recommendations.

## ✨ Features

- 🧠 **AI-Powered Predictions**: LSTM neural network for accurate energy consumption forecasting
- 📊 **Interactive Dashboard**: Real-time visualizations with Chart.js
- 🔍 **Device-Wise Analysis**: Breakdown of consumption by HVAC, lighting, and occupancy
- 💡 **Smart Suggestions**: AI-generated energy-saving recommendations
- 📈 **Pattern Recognition**: Hourly and daily consumption patterns
- 🎨 **Modern UI**: Glassmorphism design with smooth animations
- 📱 **Responsive**: Works perfectly on desktop, tablet, and mobile

## 🚀 Quick Start

### Prerequisites

- Python 3.8 or higher
- pip package manager

### Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd smartenergy
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application**
   ```bash
   python app.py
   ```

4. **Open your browser**
   Navigate to `http://localhost:5000`

## 📁 Project Structure

```
smartenergy/
├── app.py                      # Flask application
├── utils.py                    # Data processing utilities
├── requirements.txt            # Python dependencies
├── Energy_consumption.csv      # Dataset
├── lstm_energy_model.h5        # Trained LSTM model
├── templates/
│   └── index.html             # Main dashboard
└── static/
    ├── css/
    │   └── style.css          # Custom styles
    └── js/
        └── main.js            # JavaScript functionality
```

## 🎯 API Endpoints

### GET `/`
Serves the main dashboard

### POST `/api/predict`
Predicts energy consumption based on input parameters

**Request Body:**
```json
{
  "Temperature": 25.5,
  "Humidity": 50.0,
  "SquareFootage": 1500,
  "Occupancy": 5,
  "HVACUsage": "On",
  "LightingUsage": "On",
  "RenewableEnergy": 15.0,
  "DayOfWeek": "Friday",
  "Holiday": "No"
}
```

**Response:**
```json
{
  "success": true,
  "prediction": 78.45,
  "unit": "kWh",
  "suggestions": [...]
}
```

### GET `/api/historical?limit=100`
Returns historical energy consumption data

### GET `/api/device-analysis`
Returns device-wise consumption analysis

### GET `/api/statistics`
Returns overall energy consumption statistics

### GET `/api/patterns?type=hourly|daily`
Returns consumption patterns

## 🎨 Design Features

- **Glassmorphism UI**: Modern frosted glass effect
- **Gradient Backgrounds**: Beautiful purple-to-blue gradients
- **Smooth Animations**: Fade-in, float, and bounce effects
- **Responsive Design**: Mobile-first approach
- **Interactive Charts**: Powered by Chart.js
- **Custom Scrollbar**: Themed scrollbar design

## 📊 Dataset

The application uses the SmartHome Energy Monitoring Dataset with:
- 1000 timestamped records
- 11 features including temperature, humidity, occupancy, HVAC/lighting usage
- Device-level power readings
- 6 months of data

## 🧠 LSTM Model

The trained LSTM model provides:
- Up to 95% prediction accuracy
- Time series forecasting
- Multi-feature input processing
- Real-time predictions

## 💡 Smart Suggestions

The AI generates personalized recommendations based on:
- Current temperature and HVAC usage
- Occupancy levels
- Lighting patterns
- Renewable energy contribution
- Historical consumption data

## 🛠️ Technologies Used

- **Backend**: Flask 3.0, Python
- **ML/AI**: TensorFlow 2.15, Keras, scikit-learn
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **UI Framework**: Bootstrap 5.3
- **Charts**: Chart.js 4.4
- **Data Processing**: Pandas, NumPy

## 📱 Browser Support

- Chrome (recommended)
- Firefox
- Edge
- Safari
- Mobile browsers

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Smart Energy Consumption Analysis System
Developed for Milestone 4 - Smart Energy Project

## 🙏 Acknowledgments

- SmartHome Energy Monitoring Dataset
- TensorFlow/Keras team
- Flask community
- Chart.js developers

---

**Made with ⚡ and 🧠 using LSTM Neural Networks**
