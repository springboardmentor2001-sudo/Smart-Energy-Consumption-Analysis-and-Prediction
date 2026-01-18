import streamlit as st
from streamlit_option_menu import option_menu
import sys
import os

# Add project root to Python path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))        # frontend/
PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, "..")) # prediction_ai/
sys.path.append(PROJECT_ROOT)

st.set_page_config(page_title="Smart Energy AI", layout="wide")

import os

def load_css():
    css_path = os.path.join(os.path.dirname(__file__), "style.css")
    with open(css_path) as f:
        st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)


load_css()

st.markdown("""
<style>
div[data-testid="stHorizontalBlock"] {
    background-color: #0e1117;
    padding: 10px 0px;
    border-bottom: 1px solid #30363d;
}
button[data-baseweb="tab"] {
    background-color: transparent !important;
    color: #c9d1d9 !important;
    font-size: 16px !important;
    padding: 8px 18px !important;
    border-radius: 20px !important;
    margin: 0 6px !important;
}
button[data-baseweb="tab"][aria-selected="true"] {
    background: linear-gradient(135deg, #1f6feb, #238636) !important;
    color: white !important;
    box-shadow: 0 0 10px rgba(31,111,235,0.6);
}
button[data-baseweb="tab"]:hover {
    background-color: #161b22 !important;
    color: white !important;
}
</style>
""", unsafe_allow_html=True)

# Initialize login state
if "logged_in" not in st.session_state:
    st.session_state.logged_in = False

# If NOT logged in → show only login page
if not st.session_state.logged_in:
    import pages.login as login
    login.app()
    st.stop()

# Navigation menu
selected = option_menu(
    menu_title=None,
    options=["Home", "Dashboard", "Prediction", "Reports", "AI", "Profile", "Logout"],
    icons=["house", "bar-chart", "activity", "pages", "robot", "person", "box-arrow-right"],
    orientation="horizontal"
)

if selected == "Home":

    st.markdown("""
    <style>
    .hero-box { background: linear-gradient(135deg, #0e1117, #161b22); padding: 50px; border-radius: 20px; }
    .hero-title { font-size: 48px; color: #58a6ff; }
    .hero-text { font-size: 18px; color: #c9d1d9; }
    .feature-card { background: #161b22; padding: 20px; border-radius: 15px; text-align: center; box-shadow: 0 0 10px rgba(0,0,0,0.4); }
    </style>
    """, unsafe_allow_html=True)

    col1, col2 = st.columns([2, 1])

    with col1:
        st.markdown("""
        <div class="hero-box">
            <div class="hero-title">⚡ Smart Energy AI</div>
            <div class="hero-text">
                Predict • Optimize • Save Energy Using AI & Machine Learning<br><br>
                Intelligent system to analyze, predict and optimize electricity consumption
                using ML and AI for smart homes and buildings.
                    <br><br>
                The system helps users understand their daily and monthly power usage patterns, estimate 
                electricity costs, and receive AI-driven insights for reducing energy wastage and improving efficiency.
                <br><br>
                By combining data analytics, predictive modeling, interactive dashboards, and an AI assistant, 
                this application supports smart decision-making for homes, institutions, and smart buildings.
            </div>
        </div>
        """, unsafe_allow_html=True)

    with col2:
       img_path = os.path.join(os.path.dirname(__file__), "assets", "energy.png")
       st.image(img_path, width=420)

    st.subheader("🚀 Key Features")

    f1, f2, f3, f4 = st.columns(4)
    f1.markdown("<div class='feature-card'>🔮<br><b>Energy Prediction</b></div>", unsafe_allow_html=True)
    f2.markdown("<div class='feature-card'>💰<br><b>Cost Estimation</b></div>", unsafe_allow_html=True)
    f3.markdown("<div class='feature-card'>📊<br><b>Smart Dashboard</b></div>", unsafe_allow_html=True)
    f4.markdown("<div class='feature-card'>🤖<br><b>AI Assistant</b></div>", unsafe_allow_html=True)

elif selected == "Dashboard":
    import pages.dashboard as dashboard
    dashboard.app()

elif selected == "Prediction":
    import pages.prediction as prediction
    prediction.app()

elif selected == "AI":
    import pages.ai as ai
    ai.app()

elif selected == "Profile":
    import pages.profile as profile
    profile.app()

elif selected == "Reports":
    import pages.reports as reports
    reports.app()

elif selected == "Logout":
    st.session_state.logged_in = False
    st.rerun()


