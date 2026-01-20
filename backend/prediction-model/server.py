from fastapi import FastAPI, Form
import pickle
import pandas as pd

app = FastAPI()

# ---------------- Load model ----------------
with open("energy_rf_model.pkl", "rb") as f:
    model = pickle.load(f)

# ---------------- Predict ----------------
@app.post("/predict")
async def predict(
    Temperature: float = Form(...),
    Humidity: float = Form(...),
    SquareFootage: float = Form(...),
    Occupancy: float = Form(...),
    HVACUsage: str = Form(...),        # "On" / "Off"v
    LightingUsage: str = Form(...),    # "On" / "Off"
    Day: int = Form(...),
    DayOfWeek: int = Form(...),        # 1–7
    Month: int = Form(...),
    Hour: int = Form(...),
    RenewableEnergy: int = Form(...),  # 0 / 1
    Holiday: int = Form(...)           # 0 / 1
):
    try:
        # Derived feature
        IsWeekend = 1 if DayOfWeek in [6, 7] else 0

        # 🔴 IMPORTANT: categorical features MUST remain STRINGS
        input_data = {
            "Temperature": float(Temperature),
            "Humidity": float(Humidity),
            "SquareFootage": float(SquareFootage),
            "Occupancy": float(Occupancy),
            "RenewableEnergy": int(RenewableEnergy),
            "Hour": int(Hour),
            "Day": int(Day),
            "Month": int(Month),
            "IsWeekend": int(IsWeekend),

            # categorical (DO NOT convert to int)
            "HVACUsage": HVACUsage,                # "On" / "Off"
            "LightingUsage": LightingUsage,        # "On" / "Off"
            "DayOfWeek": str(DayOfWeek),           # string
            "Holiday": str(Holiday)                # string
        }

        df = pd.DataFrame([input_data])

        print("✅ FINAL DATAFRAME:")
        print(df)
        print(df.dtypes)

        prediction = model.predict(df)[0]

        return {"prediction": round(float(prediction), 2)}

    except Exception as e:
        print("❌ MODEL ERROR:", e)
        return {"error": str(e)}
