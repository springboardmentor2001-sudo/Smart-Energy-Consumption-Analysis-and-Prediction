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

    st.markdown("""
    <style>
    .login-box {
        background-color: #161b22;
        padding: 35px;
        border-radius: 12px;
        box-shadow: 0 0 20px rgba(0,0,0,0.6);
        width: 460px;
        margin: auto;
    }
    </style>
    """, unsafe_allow_html=True)

    left, center, right = st.columns([1, 2, 1])

    with center:
        st.markdown("<div class='login-box'>", unsafe_allow_html=True)
        st.markdown("<h1 style='text-align:center; color:#58a6ff;'>⚡ Smart Energy AI</h1>", unsafe_allow_html=True)
        st.markdown("<h3 style='text-align:center;'>🔐 Sign in to your account</h3>", unsafe_allow_html=True)

        mode = st.radio("Choose", ["Login", "Register"])

        # -------- LOGIN MODE --------
        if mode == "Login":
            email = st.text_input("Email address", key="login_email")
            password = st.text_input("Password", type="password", key="login_password")

            if st.button("Login"):
                if not os.path.exists(USER_FILE):
                    st.error("No users found. Please register first.")
                else:
                    df = pd.read_csv(USER_FILE)
                    user = df[(df["email"] == email) & (df["password"] == password)]

                    if not user.empty:
                        user_file = f"data_{email.replace('@','_').replace('.','_')}.csv"
                        st.session_state.user_data_file = user_file
                        st.session_state.logged_in = True
                        st.session_state.current_user = email
                        st.rerun()
                    else:
                        st.error("Invalid email or password")

        # -------- REGISTER MODE --------
        if mode == "Register":
            email = st.text_input("Email address", key="register_email")
            password = st.text_input("Password", type="password", key="register_password")

            if st.button("Create Account"):
                if not os.path.exists(USER_FILE):
                    df = pd.DataFrame(columns=["username", "email", "password"])
                else:
                    df = pd.read_csv(USER_FILE)

                if email in df["email"].values:
                    st.error("User already exists")
                else:
                    new_user = pd.DataFrame(
                        [[email.split("@")[0], email, password]],
                        columns=["username", "email", "password"]
                    )
                    df = pd.concat([df, new_user], ignore_index=True)
                    df.to_csv(USER_FILE, index=False)
                    st.success("Account created! Please switch to Login.")

        st.markdown("""
        <p style="text-align:center;">Forgot password?</p>
        <p style="text-align:center;">Don't have an account? Register above.</p>
        """, unsafe_allow_html=True)

        st.markdown("</div>", unsafe_allow_html=True)

