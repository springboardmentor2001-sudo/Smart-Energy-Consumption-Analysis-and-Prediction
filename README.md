# Smart Energy Prediction Website

A full-stack web application that predicts power consumption using a trained machine learning ensemble model. Built with React, Node.js, and Python, featuring real-time predictions, interactive UI, and AI-powered assistance.

**Live on:** `http://localhost:5000` | **ML Server:** `http://localhost:5001`

---

## 📋 Quick Navigation

- **[Setup Guide](./SETUP_GUIDE.md)** - Installation & configuration
- **[ML Model Docs](./ML_MODEL_DOCUMENTATION.md)** - Model architecture & training
- **[Website Docs](./WEBSITE_DOCUMENTATION.md)** - Frontend & UI details
- **[API Docs](./API_DOCUMENTATION.md)** - REST API endpoints
- **[Deployment Guide](./DEPLOYMENT_GUIDE.md)** - Production setup

---

## ✨ Key Features

| Feature | Details |
|---------|---------|
| **Real-Time Predictions** | Predict power consumption in seconds using trained ML ensemble |
| **Interactive Controls** | Toggle HVAC and Lighting; adjust Temperature, Humidity, Occupancy |
| **AI Chatbot** | Natural language interface powered by Google Gemini (optional) |
| **Energy Breakdown** | See contribution from each appliance and environmental factor |
| **Responsive Design** | Works on desktop, tablet, and mobile devices |
| **Dark/Light Mode** | Automatic theme with manual toggle option |
| **Fallback Mode** | Mock predictions if Python server unavailable |

---

## 🏗️ Architecture Overview

### Two-Server Design
```
Frontend (React)  →  Node.js Server (5000)  →  Python Server (5001)
  ↓                      ↓                        ↓
Web UI              REST API              ML Ensemble Model
                  Request Validation      (LightGBM+XGBoost+
                  Gemini Integration      CatBoost+Ridge)
```

### Technology Stack

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS + Shadcn/ui
- React Query + Wouter routing
- Recharts (visualizations)

**Backend (Node.js):**
- Express.js + TypeScript
- Zod (validation)
- Google Gemini API
- React Query integration

**Backend (Python):**
- Flask web framework
- scikit-learn ecosystem
- LightGBM, XGBoost, CatBoost
- NumPy, Pandas
- Joblib (model persistence)

---

## 📁 Project Structure

```
smart-energy-project/
├── 📄 README.md (this file)
├── 📄 SETUP_GUIDE.md          ← Start here for installation
├── 📄 ML_MODEL_DOCUMENTATION.md   ← Model architecture & features
├── 📄 WEBSITE_DOCUMENTATION.md    ← UI & frontend details
├── 📄 API_DOCUMENTATION.md        ← REST API reference
├── 📄 DEPLOYMENT_GUIDE.md         ← Production deployment
│
├── 🐍 predict_server.py       ← Python Flask prediction server
│
├── 📦 model/                  ← ML models (add locally)
│   ├── model_lgb.joblib
│   ├── model_xgb.joblib
│   ├── model_cat.joblib
│   ├── meta_model.joblib
│   ├── scaler.joblib
│   └── features.json
│
├── 🖥️  server/                ← Node.js Backend
│   ├── index.ts               ← Server setup
│   └── routes.ts              ← API handlers
│
├── 🎨 client/                 ← React Frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Prediction.tsx ← Main prediction page
│   │   │   └── Chat.tsx       ← Chatbot page
│   │   ├── components/
│   │   │   ├── prediction/    ← Controls & results
│   │   │   ├── chat/          ← Chatbot components
│   │   │   └── ui/            ← Shadcn components
│   │   └── App.tsx
│   └── public/
│       └── features.json      ← Appliance config
│
├── 📝 shared/
│   └── schema.ts              ← Validation schemas
│
└── 🔧 Configuration files
npm run dev
```
The application will be available at `http://localhost:5000`

**Production build:**
```bash
npm run build
npm start
```

### Verify Server Health

After starting the server, verify it's running correctly:
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "geminiConfigured": true,
  "modelPath": "./model/future_energy_model.pkl",
  "modelExists": false
}
```

### Future ML Model Integration

To add a custom ML model in the future:

1. Place your model file (e.g., `energy_model.pkl`) in the project
2. Update `MODEL_PATH` in your `.env` file:
   ```env
   MODEL_PATH=./model/energy_model.pkl
   ```
3. The server will automatically detect if the model file exists
4. Check `/api/health` to verify model status

**Note:** The current prediction system works without an ML model. The `MODEL_PATH` is prepared for future advanced predictions.

### Database Setup (Optional)

If using PostgreSQL:
```bash
npm run db:push
```

## API Endpoints

### GET /api/health
Returns server health status and environment configuration.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "geminiConfigured": true,
  "modelPath": "./model/future_energy_model.pkl",
  "modelExists": false
}
```

### GET /api/features
Returns the list of available appliances with their configurations.

### POST /api/predict
Calculates energy consumption prediction.

**Request body:**
```json
{
  "appliances": {
    "HVACUsage__bin": "on",
    "LightingUsage__bin": "off",
    "TVUsage__bin": "on"
  },
  "weather": {
    "Temperature": 25,
    "Humidity": 60,
    "Occupancy": 3
  }
}
```

**Response:**
```json
{
  "prediction_watts": 3850.5,
  "prediction_kw": 3.85,
  "breakdown": {
    "HVACUsage__bin": 3500,
    "TVUsage__bin": 100,
    "Temperature": 150
  }
}
```

### POST /api/chat
Streams AI responses for energy-related questions.

**Request body:**
```json
{
  "message": "How can I reduce my energy consumption?",
  "context": {
    "currentPrediction": {
      "prediction_watts": 3850.5,
      "prediction_kw": 3.85
    },
    "appliances": {
      "HVACUsage__bin": "on"
    }
  }
}
```

## Configuration Files

### features.json
Defines available appliances with their display names, icons, default wattages, and categories.

### wattageConfig.json
Contains baseline watts, individual appliance wattages, and weather factor multipliers for accurate predictions.

## Troubleshooting

### Chatbot not responding
- Ensure `GEMINI_API_KEY` is set in your `.env` file
- Check the console for any API errors
- Verify your API key is valid at Google AI Studio

### Predictions not working
- Check the browser console for errors
- Ensure the server is running on port 5000
- Verify features.json is accessible at `/api/features`

### Database connection issues
- Verify PostgreSQL is running
- Check `DATABASE_URL` format in `.env`
- Run `npm run db:push` to sync schema

### Build errors
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Ensure Node.js version is 18+

## License

MIT License
