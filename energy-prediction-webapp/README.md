# Energy Prediction Web Application

A comprehensive full-stack web application for predicting energy consumption using machine learning models. The application features real-time predictions, user authentication, data visualization, and an AI-powered chatbot for energy insights.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Usage Guide](#usage-guide)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## ✨ Features

### Core Functionality
- **Energy Consumption Prediction**: Advanced ML models (XGBoost, LightGBM, CatBoost) for accurate predictions
- **Multiple Input Methods**: 
  - Form-based prediction
  - CSV/Excel file upload for batch predictions
  - PDF document parsing for data extraction
- **Real-time Predictions**: Get instant energy consumption forecasts
- **Prediction History**: Track and manage previous predictions
- **Data Visualization**: Interactive charts and reports using Recharts

### User Management
- **User Authentication**: Secure JWT-based authentication
- **User Profiles**: Personalized user settings and preferences
- **Protected Routes**: Role-based access control
- **Session Management**: Persistent user sessions

### AI Integration
- **Smart Chatbot**: AI-powered chatbot using Google Generative AI
- **Energy Insights**: Contextual energy recommendations and tips
- **HVAC Guidance**: Smart heating, ventilation, and air conditioning advice

### UI/UX
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Dark/Light Theme**: Toggle between dark and light modes
- **Interactive Components**: Loading spinners, toast notifications, charts
- **Modern Framework**: React with Vite for fast development

---

## 🛠 Tech Stack

### Backend
- **Framework**: Flask 2.3.3
- **Authentication**: Flask-JWT-Extended 4.5.2
- **ML Libraries**: 
  - scikit-learn 1.3.0+
  - XGBoost 2.0.0+
  - LightGBM 4.0.0+
  - CatBoost 1.2.0+
- **Data Processing**: pandas, numpy
- **PDF Processing**: PyPDF2 3.0.1
- **API Server**: Gunicorn 21.2.0
- **CORS Support**: Flask-CORS 4.0.0
- **Environment Management**: python-dotenv 1.0.0
- **AI Integration**: google-generativeai 0.3.0

### Frontend
- **UI Framework**: React 18.2.0
- **Build Tool**: Vite 4.4.5
- **Routing**: React Router DOM 6.16.0
- **HTTP Client**: Axios 1.5.0
- **Visualization**: Recharts 2.10.3
- **Styling**: Tailwind CSS 3.3.3
- **Icons**: Lucide React 0.263.1
- **Date Handling**: date-fns 2.30.0

---

## 📁 Project Structure

```
energy-prediction-webapp/
├── backend/
│   ├── app.py                      # Main Flask application
│   ├── requirements.txt             # Python dependencies
│   ├── train_improved_model.py     # Model training script
│   ├── train_simple_model.py       # Simple model training
│   ├── test_*.py                   # Test files
│   ├── run_server.bat              # Windows batch script to run server
│   ├── setup_improved_model.bat    # Setup script for Windows
│   ├── setup_improved_model.sh     # Setup script for Linux/Mac
│   ├── uploads/                    # Uploaded files storage
│   └── __pycache__/                # Python cache
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx                # Entry point
│   │   ├── App.jsx                 # Root component
│   │   ├── index.css               # Global styles
│   │   ├── components/             # Reusable components
│   │   │   ├── Navbar.jsx
│   │   │   ├── PublicNavbar.jsx
│   │   │   ├── FileUpload.jsx
│   │   │   ├── Chart.jsx
│   │   │   ├── FloatingChatbot.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── Toast.jsx
│   │   │   └── LoadingSpinner.jsx
│   │   ├── pages/                  # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── FormPrediction.jsx
│   │   │   ├── UploadPrediction.jsx
│   │   │   ├── PredictionHistory.jsx
│   │   │   ├── Report.jsx
│   │   │   ├── Chatbot.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Settings.jsx
│   │   │   └── Reviews.jsx
│   │   ├── context/                # React Context
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   └── services/               # API services
│   │       └── api.js
│   ├── index.html                  # HTML template
│   ├── package.json                # Dependencies
│   ├── vite.config.js              # Vite configuration
│   ├── tailwind.config.js          # Tailwind CSS config
│   └── postcss.config.cjs          # PostCSS config
│
├── uploads/                        # Global uploads directory
├── feature_engg.py                 # Feature engineering scripts
└── README.md                       # This file
```

---

## 📦 Prerequisites

### System Requirements
- **Python**: 3.9 or higher
- **Node.js**: 16.0.0 or higher
- **npm**: 7.0.0 or higher
- **Git**: For version control

### Development Tools
- A code editor (VS Code recommended)
- Terminal/Command Prompt

---

## 🚀 Installation

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd energy-prediction-webapp\backend
   ```

2. **Create a virtual environment** (recommended):
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate
   
   # Linux/Mac
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Create `.env` file** in the backend directory:
   ```env
   FLASK_ENV=development
   JWT_SECRET_KEY=your_secret_key_here
   GOOGLE_API_KEY=your_google_generative_ai_key
   DATABASE_URL=optional_database_url
   UPLOAD_FOLDER=uploads
   MAX_CONTENT_LENGTH=50000000
   ```

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd energy-prediction-webapp\frontend
   ```

2. **Install Node dependencies**:
   ```bash
   npm install
   ```

3. **Create `.env` file** in the frontend directory:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

---

## ⚙️ Configuration

### Backend Configuration

Create a `.env` file in the `backend/` directory:

| Variable | Description | Default |
|----------|-------------|---------|
| `FLASK_ENV` | Environment (development/production) | development |
| `JWT_SECRET_KEY` | Secret key for JWT tokens | change_me |
| `GOOGLE_API_KEY` | Google Generative AI API key | - |
| `UPLOAD_FOLDER` | Directory for file uploads | uploads |
| `MAX_CONTENT_LENGTH` | Maximum upload file size | 50MB |

### Frontend Configuration

Create a `.env` file in the `frontend/` directory:

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend API base URL |

---

## 🏃 Running the Application

### Option 1: One-click Startup Script (Windows)

From the `energy-prediction-webapp` directory, run either of these:

```powershell
.\run_project.bat
```

or

```powershell
.\run_project.ps1
```

This opens two terminals: one for the backend and one for the frontend.

### Option 2: Using Batch Scripts (Windows)

1. **Run Backend**:
   ```bash
   cd backend
   run_server.bat
   ```

2. **Run Frontend** (in a new terminal):
   ```bash
   cd frontend
   npm run dev
   ```

### Option 3: Manual Commands

**Backend**:
```bash
cd backend
python app.py
```

**Frontend** (in a new terminal):
```bash
cd frontend
npm run dev
```

### Access the Application

- **Frontend**: http://localhost:5173 (or shown in terminal)
- **Backend API**: http://localhost:5000
- **API Docs**: http://localhost:5000/api/docs (if enabled)

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh JWT token

### Predictions
- `POST /api/predict` - Single prediction
- `POST /api/predict/batch` - Batch prediction from file
- `GET /api/predictions` - Get user's prediction history
- `GET /api/predictions/<id>` - Get specific prediction
- `DELETE /api/predictions/<id>` - Delete prediction

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/settings` - Get user settings
- `PUT /api/user/settings` - Update user settings

### Chatbot
- `POST /api/chatbot/message` - Send message to chatbot
- `POST /api/chatbot/energy-insights` - Get energy insights

### Files
- `POST /api/files/upload` - Upload CSV/PDF file
- `GET /api/files/<id>` - Get file details

---

## 📖 Usage Guide

### Making a Prediction

1. **Login** to your account
2. Navigate to **"Make Prediction"** page
3. Enter energy parameters:
   - Temperature
   - Humidity
   - Hour of day
   - Day of week
   - Season
   - Building type
4. Click **"Predict"** to get results
5. View prediction with confidence score

### Batch Upload

1. Prepare a CSV file with columns matching the model's input features
2. Navigate to **"Upload Predictions"**
3. Upload the file
4. Download results with predictions

### Using the Chatbot

1. Click the **chatbot icon** in bottom-right corner
2. Ask questions about:
   - Energy consumption
   - HVAC recommendations
   - Energy savings tips
   - Prediction explanations
3. Get AI-powered responses

### Viewing History

1. Go to **"Prediction History"**
2. View all your past predictions
3. Filter by date, building type, or confidence
4. Export reports as needed

---

## 🔧 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find and kill process on port 5000 (backend) or 5173 (frontend)
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :5000
kill -9 <PID>
```

#### CORS Errors
- Ensure `VITE_API_BASE_URL` matches backend URL
- Check Flask-CORS is properly configured in `app.py`
- Verify API endpoint paths are correct

#### Model Loading Errors
- Ensure trained model files exist in `backend/` directory
- Run `python train_improved_model.py` to retrain
- Check model file permissions

#### Authentication Fails
- Clear browser cookies and cache
- Verify `JWT_SECRET_KEY` is set in `.env`
- Check token expiration settings

#### File Upload Issues
- Verify `uploads/` directory exists and is writable
- Check `MAX_CONTENT_LENGTH` setting
- Ensure file format matches requirements (CSV/PDF)

---

## 🧪 Testing

### Run Backend Tests
```bash
cd backend
python -m pytest test_*.py -v
```

### Manual API Testing
```bash
# Test prediction endpoint
curl -X POST http://localhost:5000/api/predict \
  -H "Content-Type: application/json" \
  -d '{"temperature": 20, "humidity": 65, ...}'
```

---

## 📝 Development

### Building for Production

**Frontend**:
```bash
cd frontend
npm run build
```

**Backend**:
```bash
cd backend
pip install gunicorn
gunicorn -w 4 app:app
```

### Code Quality

**Format Code**:
```bash
cd frontend
npm run lint
```

---

## 🚀 Deployment

### Deploy to Heroku

1. Create `Procfile` in backend:
   ```
   web: gunicorn app:app
   ```

2. Deploy:
   ```bash
   heroku login
   heroku create your-app-name
   git push heroku main
   ```

### Deploy to AWS/Azure

- Use elastic beanstalk for Flask backend
- Use Vercel or Netlify for React frontend

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📧 Support

For issues and questions:
- Create an issue on GitHub
- Contact the development team
- Check existing issues for solutions

---

## 🙏 Acknowledgments

- Flask and Flask extensions community
- React and Vite communities
- ML libraries: scikit-learn, XGBoost, LightGBM, CatBoost
- Google Generative AI for chatbot functionality
- Tailwind CSS for styling

---

**Last Updated**: January 17, 2026
**Version**: 1.0.0
