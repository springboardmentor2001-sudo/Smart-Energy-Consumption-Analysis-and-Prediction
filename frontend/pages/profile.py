import streamlit as st
import pandas as pd
import os
import sys

# ---------- Unified Backend Path ----------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, "..", ".."))
BACKEND_DIR = os.path.join(PROJECT_ROOT, "backend")
sys.path.append(PROJECT_ROOT)

USER_FILE = os.path.join(BACKEND_DIR, "users.csv")

def app():
    st.title("👤 User Profile")

    if "current_user" not in st.session_state:
        st.warning("Please login again.")
        return

    email = st.session_state.current_user
    df = pd.read_csv(USER_FILE)

    user_row = df[df["email"] == email].iloc[0]
    current_name = user_row["username"]

    st.subheader("Edit Profile")

    new_name = st.text_input("Username", value=current_name)
    st.text(f"Email: {email}")

    if st.button("Update Profile"):
        df.loc[df["email"] == email, "username"] = new_name
        df.to_csv(USER_FILE, index=False)
        st.success("Profile updated successfully!")

    st.markdown("---")
    st.subheader("📄 Your Prediction History")

    if "user_data_file" in st.session_state:
        user_file = os.path.join(BACKEND_DIR, st.session_state.user_data_file)

        if os.path.exists(user_file):
            history = pd.read_csv(user_file)
            st.dataframe(history, width="stretch")
        else:
            st.info("No prediction history yet for this user.")
    else:
        st.info("No prediction history yet for this user.")

    st.markdown("---")

    if st.button("🚪 Logout"):
        st.session_state.logged_in = False
        st.session_state.current_user = None
        st.rerun()
