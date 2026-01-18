import streamlit as st
import pickle
import os
import numpy as np
import datetime
import pandas as pd
import sys

# ---------- Unified Backend Path ----------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, "..", ".."))   # prediction_ai
BACKEND_DIR = os.path.join(PROJECT_ROOT, "backend")
sys.path.append(PROJECT_ROOT)

MODEL_PATH = os.path.join(BACKEND_DIR, "uploaded_model.pkl")
DATA_PATH = os.path.join(BACKEND_DIR, "uploaded_data.csv")

def app():
    st.title("🔮 Energy Prediction")

    # ---------- Login Safety ----------
    if "user_data_file" not in st.session_state:
        st.warning("Please login first.")
        return

    uploaded_file = st.file_uploader(
        "Upload trained model (.pkl) or dataset (.csv)",
        type=["pkl", "csv"]
    )

    if uploaded_file is not None:
        if uploaded_file.name.endswith(".pkl"):
            with open(MODEL_PATH, "wb") as f:
                f.write(uploaded_file.read())
            st.success("✅ Model uploaded successfully!")

        elif uploaded_file.name.endswith(".csv"):
            df = pd.read_csv(uploaded_file)
            df.to_csv(DATA_PATH, index=False)
            st.success("✅ Dataset uploaded successfully!")
            st.subheader("📄 Dataset Preview")
            st.dataframe(df.head())

    if not os.path.exists(MODEL_PATH):
        st.warning("Please upload the file first.")
        return

    # ---------- Load Model ----------
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)

    # ---------- Inputs ----------
    date = st.date_input("Date", datetime.date.today())
    temperature = st.number_input("Temperature")
    humidity = st.number_input("Humidity")
    hvac = st.number_input("HVAC Usage")
    lighting = st.number_input("Lighting Usage")
    previous_energy = st.number_input("Previous Energy")

    if st.button("Predict"):
        try:
            feature_names = model.feature_names_in_
            full_features = pd.DataFrame(np.zeros((1, len(feature_names))), columns=feature_names)

            full_features.iloc[0, 0] = date.day
            full_features.iloc[0, 1] = date.month
            full_features.iloc[0, 2] = date.weekday()
            full_features.iloc[0, 3] = temperature
            full_features.iloc[0, 4] = humidity
            full_features.iloc[0, 5] = hvac
            full_features.iloc[0, 6] = lighting
            full_features.iloc[0, 7] = previous_energy

            prediction = model.predict(full_features)
            predicted_energy = prediction[0]

            tariff = 6  # ₹ per kWh
            estimated_cost = predicted_energy * tariff

            c1, c2 = st.columns(2)
            c1.metric("🔋 Predicted Energy (kWh)", f"{predicted_energy:.2f}")
            c2.metric("💰 Estimated Cost (₹)", f"{estimated_cost:.2f}")

            # ---------- Save Per-User CSV ----------
            data = {
                "Date": [date],
                "Month": [date.month],
                "PredictedEnergy": [predicted_energy],
                "EstimatedCost": [estimated_cost]
            }

            df_new = pd.DataFrame(data)
            user_file = os.path.join(BACKEND_DIR, st.session_state.user_data_file)

            if os.path.exists(user_file):
                df_old = pd.read_csv(user_file)
                df_all = pd.concat([df_old, df_new], ignore_index=True)
            else:
                df_all = df_new

            df_all.to_csv(user_file, index=False)
            st.success("📁 Prediction saved! Dashboard and Reports are now updated.")

        except Exception as e:
            st.error("❌ Prediction failed")
            st.write(e)
