import streamlit as st
import pandas as pd
import os
import sys
from datetime import datetime
from google import genai

# ---------- Unified Backend Path ----------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, "..", ".."))
BACKEND_DIR = os.path.join(PROJECT_ROOT, "backend")
sys.path.append(PROJECT_ROOT)

from backend.config import GEMINI_API_KEY

client = genai.Client(api_key=GEMINI_API_KEY)

ENERGY_KEYWORDS = [
    "energy", "power", "hvac", "ac", "cooling", "heating",
    "lighting", "electricity", "consumption", "load",
    "bill", "cost", "solar", "renewable", "efficiency",
    "carbon", "emission", "grid", "battery"
]

def get_chat_file():
    email = st.session_state.current_user
    safe_name = email.replace("@", "_").replace(".", "_")
    return os.path.join(BACKEND_DIR, f"chat_{safe_name}.csv")

def load_chat_history():
    file_path = get_chat_file()
    if os.path.exists(file_path):
        return pd.read_csv(file_path)
    else:
        return pd.DataFrame(columns=["Time", "User", "AI"])

def save_chat_history(df):
    df.to_csv(get_chat_file(), index=False)

def clear_chat_history():
    file_path = get_chat_file()
    if os.path.exists(file_path):
        os.remove(file_path)
    st.rerun()

def app():
    st.title("🤖 Smart Energy AI Assistant")

    if "current_user" not in st.session_state:
        st.warning("Please login first.")
        return

    # Load chat history
    chat_df = load_chat_history()

    col1, col2 = st.columns([4, 1])
    with col2:
        if st.button("🗑 Clear Chat"):
            clear_chat_history()

    user_input = st.text_input("Ask about energy, HVAC, lighting, efficiency...")

    if st.button("Send"):
        if user_input.strip():

            if not any(word.lower() in user_input.lower() for word in ENERGY_KEYWORDS):
                answer = "⚠️ I am designed only for energy-related queries."
            else:
                prompt = f"You are an energy expert. Answer clearly:\n\n{user_input}"
                try:
                    response = client.models.generate_content(
                        model="models/gemini-2.5-flash",
                        contents=prompt
                    )
                    answer = response.text
                except:
                    answer = "⚠️ AI quota limit reached."

            timestamp = datetime.now().strftime("%d-%m-%Y %H:%M:%S")

            new_row = pd.DataFrame([[timestamp, user_input, answer]],
                                   columns=["Time", "User", "AI"])
            chat_df = pd.concat([chat_df, new_row], ignore_index=True)
            save_chat_history(chat_df)
            st.rerun()

    # Display chat history
   # Show latest chat first (reverse order)
    for _, row in chat_df.iloc[::-1].iterrows():
        st.markdown(f"🕒 **{row['Time']}**")
        st.markdown(f"🧑 **You:** {row['User']}")
        st.markdown(f"🤖 **AI:** {row['AI']}")
        st.markdown("---")

