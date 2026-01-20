import os
import pickle
import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai

print("🔥 THIS IS THE ENERGY CHATBOT APP.PY 🔥")

# --------------------------------------------------
# Load environment variables
# --------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ENV_PATH = os.path.join(BASE_DIR, "key.env")
load_dotenv(ENV_PATH)

# --------------------------------------------------
# Gemini Client
# --------------------------------------------------
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# --------------------------------------------------
# Find a WORKING Gemini model (runtime safe)
# --------------------------------------------------
def find_working_model():
    models = client.models.list()
    test_prompt = "Explain energy consumption in one sentence."

    for m in models:
        try:
            client.models.generate_content(
                model=m.name,
                contents=test_prompt
            )
            print(f"✅ Using Gemini model: {m.name}")
            return m.name
        except Exception:
            continue

    raise RuntimeError("❌ No usable Gemini model found for this project.")

GEMINI_MODEL = find_working_model()

# --------------------------------------------------
# Load ML model
# --------------------------------------------------
MODEL_PATH = os.path.join(BASE_DIR, "energy_rf_model.pkl")
with open(MODEL_PATH, "rb") as f:
    energy_model = pickle.load(f)

# --------------------------------------------------
# FastAPI App
# --------------------------------------------------
app = FastAPI(title="Energy Consumption Chatbot API")

# --------------------------------------------------
# System Prompt
# --------------------------------------------------
SYSTEM_PROMPT = """
You are an AI assistant for an Energy Consumption Prediction Website.

You are allowed to:
- Explain energy consumption concepts
- Explain energy efficiency and healthy energy usage
- Help users understand predictions
- Guide users on how to use the website
- Help with energy consumption prediction

You are NOT allowed to answer anything unrelated to energy consumption.

If a question is outside this domain, reply ONLY with:
"I'm here to help only with energy consumption and energy prediction.
Please ask something related to that."
"""

# --------------------------------------------------
# Schemas
# --------------------------------------------------
class ChatRequest(BaseModel):
    message: str

class PredictionRequest(BaseModel):
    Temperature: float
    Humidity: float
    SquareFootage: float
    Occupancy: int
    RenewableEnergy: float
    Hour: int
    Day: int
    Month: int

# --------------------------------------------------
# Chatbot Logic
# --------------------------------------------------
def energy_chatbot(user_message: str) -> str:
    try:
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=f"{SYSTEM_PROMPT}\n\nUser question:\n{user_message}"
        )

        if response.candidates and response.candidates[0].content.parts:
            return response.candidates[0].content.parts[0].text.strip()

        return "I'm here to help with energy consumption and predictions."

    except Exception as e:
        print("❌ Gemini error:", e)
        return "Sorry, I am unable to answer right now."

# --------------------------------------------------
# CHAT ENDPOINT
# --------------------------------------------------
@app.post("/chat")
def chat_endpoint(request: ChatRequest):
    return {"reply": energy_chatbot(request.message)}

# --------------------------------------------------
# ENERGY PREDICTION ENDPOINT
# --------------------------------------------------
@app.post("/predict")
def predict_energy(data: PredictionRequest):
    try:
        features = np.array([[
            data.Temperature,
            data.Humidity,
            data.SquareFootage,
            data.Occupancy,
            data.RenewableEnergy,
            data.Hour,
            data.Day,
            data.Month
        ]])

        prediction = energy_model.predict(features)[0]

        return {
            "prediction": round(float(prediction), 2),
            "unit": "kWh"
        }

    except Exception as e:
        print("❌ Prediction error:", e)
        raise HTTPException(status_code=400, detail="Invalid input values")

# --------------------------------------------------
# HEALTH CHECK
# --------------------------------------------------
@app.get("/")
def root():
    return {"status": "FastAPI Energy API is running"}
