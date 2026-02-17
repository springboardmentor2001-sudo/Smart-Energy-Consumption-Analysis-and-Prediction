# ⚡ Smart Energy Predictor

An intelligent web application that predicts energy consumption and provides personalized energy-saving recommendations using machine learning.

![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)
![Flask](https://img.shields.io/badge/Flask-3.0.0-green.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

## 🌟 Features

- 🔮 **Energy Consumption Prediction** - ML-powered predictions based on environmental and usage factors
- 💬 **AI Chatbot Assistant** - Interactive chatbot for energy-related queries
- 📊 **Visual Analytics** - Historical prediction charts and trend analysis
- 💡 **Personalized Suggestions** - Custom energy-saving recommendations
- 🏠 **Device Survey** - Track household appliances for better insights
- 🌡️ **Weather Integration** - Optional live weather data integration
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile

## 🚀 Quick Start

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/springboardmentor2001-sudo/Smart-Energy-Consumption-Analysis-and-Prediction.git
   cd Smart-Energy-Consumption-Analysis-and-Prediction
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example env file
   cp .env.example .env
   
   # Edit .env and add your secret key
   # FLASK_SECRET_KEY=your-secret-key-here
   # OPENWEATHER_API_KEY=your-api-key (optional)
   ```

4. **Run the application**
   ```bash
   python app.py
   ```

5. **Open in browser**
   ```
   http://127.0.0.1:5000
   ```

### Windows Users

Simply double-click `run.bat` to start the application!

## 📁 Project Structure

```
Smart-Energy-Consumption-Analysis-and-Prediction/
│
├── app.py                      # Main Flask application
├── requirements.txt            # Python dependencies
├── .env.example               # Environment template
├── .gitignore                 # Git ignore rules
├── README.md                  # This file
├── run.bat                    # Windows launcher
│
└── templates/                 # HTML templates
    ├── base.html             # Base template with navigation
    ├── home.html             # Landing page
    ├── about.html            # About page
    ├── login.html            # User login
    ├── signup.html           # User registration
    ├── prediction.html       # Prediction interface
    ├── chatbot.html          # AI chatbot
    ├── contact.html          # Contact form
    └── device_survey.html    # Device tracking
```

## 🎯 Usage

### 1. Create an Account
- Navigate to the signup page
- Create an account with email and password

### 2. Make Predictions
- Go to **Prediction** page
- Enter environmental data (temperature, humidity, etc.)
- Add household information (square footage, occupancy)
- Optionally add device information
- Click **Generate Prediction**
- View your predicted energy consumption and personalized suggestions

### 3. Chat with AI Assistant
- Go to **Chatbot** page
- Ask questions like:
  - "Why is my bill high?"
  - "What are peak hours?"
  - "How can I save energy?"
  - "Which device costs most?"
- Get instant, intelligent responses

### 4. Track Devices
- Go to **Device Survey** page
- Add your household appliances
- Get device-specific recommendations

### 5. View History
- Check **Prediction History** chart
- Analyze your consumption trends

## 💻 Technology Stack

- **Backend**: Flask (Python)
- **Database**: SQLite with Flask-SQLAlchemy
- **Frontend**: HTML5, CSS3, JavaScript
- **ML Model**: LightGBM (mock implementation)
- **Authentication**: Werkzeug password hashing
- **Charts**: Chart.js
- **Weather API**: OpenWeatherMap (optional)

## 🔧 Configuration

### Environment Variables

Create a `.env` file with:

```env
# Required
FLASK_SECRET_KEY=your-super-secret-key-here

# Optional - for live weather data
OPENWEATHER_API_KEY=your-openweather-api-key
```

### Getting Weather API Key (Optional)

1. Visit [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for free account
3. Get your API key
4. Add to `.env` file

**Note**: If no API key provided, the app uses mock weather data.

## 🤖 Chatbot Queries

The AI assistant can help with:

| Query Type | Example Questions |
|-----------|-------------------|
| **Greetings** | "hi", "hello" |
| **Peak Hours** | "What are peak hours?", "When to use appliances?" |
| **High Bills** | "Why is my bill high?", "Bills are expensive" |
| **Devices** | "Which device costs most?", "Appliance usage" |
| **Savings** | "How can I save?", "Energy tips" |
| **Solar** | "Tell me about solar panels", "Renewable energy" |
| **Temperature** | "What temperature setting?", "HVAC tips" |
| **Predictions** | "How to predict consumption?" |

## 📊 Prediction Factors

The model considers:

- 🌡️ **Temperature** - Current temperature
- 💧 **Humidity** - Humidity percentage
- 🏠 **Square Footage** - Building size
- 👥 **Occupancy** - Number of people
- ❄️ **HVAC Status** - Heating/cooling on/off
- 💡 **Lighting Status** - Lights on/off
- ☀️ **Renewable Energy** - Solar/wind contribution
- 📅 **Temporal Factors** - Time, day, season
- 🏠 **Devices** - Household appliances (optional)

## 🎨 Features in Detail

### Prediction Page
- **Tab 1: Input** - Manual data entry with weather lookup
- **Tab 2: Upload** - Batch predictions via CSV/PDF (coming soon)
- **Tab 3: Results** - Detailed predictions with charts

### Chatbot Page
- Natural language processing
- Context-aware responses
- Quick action buttons
- Real-time interaction

### Device Survey
- Track 8+ appliance types
- Get device-specific tips
- Personalized recommendations

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change port in app.py
app.run(debug=True, port=5001)
```

### Database Errors
```bash
# Delete and recreate database
rm energy_predictor.db
python app.py
```

### Module Not Found
```bash
# Reinstall dependencies
pip install -r requirements.txt
```

### Session Expired
- Logout and login again
- Clear browser cookies

## 🔐 Security Notes

- Passwords are hashed using Werkzeug
- Session-based authentication
- CSRF protection via Flask
- No sensitive data in git (via .gitignore)
- Environment variables for secrets

## 📈 Future Enhancements

- [ ] Real machine learning model integration
- [ ] Advanced analytics dashboard
- [ ] Export predictions to PDF/Excel
- [ ] Mobile app (React Native)
- [ ] Smart home integration
- [ ] Social features (leaderboards, challenges)
- [ ] Multi-language support
- [ ] Dark mode

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Sanjana** - *Initial work* - [sanjana-chinamuthevi](https://github.com/springboardmentor2001-sudo)

## 🙏 Acknowledgments

- Flask documentation and community
- OpenWeatherMap for weather API
- Chart.js for visualization
- All contributors and testers

## 📞 Support

- 📧 Email: support@smartenergypredictor.com
- 💬 Issues: [GitHub Issues](https://github.com/springboardmentor2001-sudo/Smart-Energy-Consumption-Analysis-and-Prediction/issues)
- 📖 Documentation: [Wiki](https://github.com/springboardmentor2001-sudo/Smart-Energy-Consumption-Analysis-and-Prediction/wiki)

## 🌟 Star History

If you find this project useful, please consider giving it a star! ⭐

---

**Built with ❤️ for a sustainable future** 🌱
