import streamlit as st
import pandas as pd
import plotly.graph_objects as go
import os
import sys
from google import genai

# ---------- Unified Backend Path ----------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, "..", ".."))
BACKEND_DIR = os.path.join(PROJECT_ROOT, "backend")
sys.path.append(PROJECT_ROOT)

from backend.config import GEMINI_API_KEY

client = genai.Client(api_key=GEMINI_API_KEY)

@st.cache_data(show_spinner=False)
def get_ai_insights(data_context):
    try:
        prompt = f"""
        You are an energy analytics expert.
        Analyze the following monthly energy consumption data and give:
        - 3 key insights
        - 3 practical energy saving tips
        in short bullet points.

        Data:
        {data_context}
        """
        response = client.models.generate_content(
            model="models/gemini-2.5-flash",
            contents=prompt
        )
        return response.text
    except:
        return "⚠️ AI quota limit reached. Please try again later."

def app():
    st.markdown("""
    <style>
    .metric-card {
        background: linear-gradient(135deg, #1f6feb, #161b22);
        padding: 20px;
        border-radius: 15px;
        text-align: center;
        box-shadow: 0 0 15px rgba(31,111,235,0.4);
    }
    .metric-title { color:#c9d1d9; font-size:14px; }
    .metric-value { color:white; font-size:26px; font-weight:bold; }
    </style>
    """, unsafe_allow_html=True)

    st.title("📊 Smart Energy Dashboard")

    if "user_data_file" not in st.session_state:
        st.warning("Please login first.")
        return

    file_path = os.path.join(BACKEND_DIR, st.session_state.user_data_file)

    if not os.path.exists(file_path):
        st.info("No prediction data available.")
        return

    df = pd.read_csv(file_path)

    # ---------- KPI CARDS ----------
    total_energy = df["PredictedEnergy"].sum()
    avg_energy = df["PredictedEnergy"].mean()
    max_energy = df["PredictedEnergy"].max()
    total_cost = df["EstimatedCost"].sum()

    col1, col2, col3, col4 = st.columns(4)

    col1.markdown(f"<div class='metric-card'><div class='metric-title'>⚡ Total Energy</div><div class='metric-value'>{total_energy:.1f} kWh</div></div>", unsafe_allow_html=True)
    col2.markdown(f"<div class='metric-card'><div class='metric-title'>📊 Avg / Day</div><div class='metric-value'>{avg_energy:.1f} kWh</div></div>", unsafe_allow_html=True)
    col3.markdown(f"<div class='metric-card'><div class='metric-title'>🔥 Peak Load</div><div class='metric-value'>{max_energy:.1f} kWh</div></div>", unsafe_allow_html=True)
    col4.markdown(f"<div class='metric-card'><div class='metric-title'>💰 Total Cost</div><div class='metric-value'>₹ {total_cost:.0f}</div></div>", unsafe_allow_html=True)

    st.markdown("---")

    # ---------- GAUGE ----------
    st.subheader("⚡ Current Load Gauge")

    current_load = df["PredictedEnergy"].iloc[-1]

    gauge_fig = go.Figure(go.Indicator(
        mode="gauge+number",
        value=current_load,
        title={"text": "Current Energy (kWh)"},
        gauge={
            "axis": {"range": [0, max_energy * 1.2]},
            "bar": {"color": "cyan"},
            "steps": [
                {"range": [0, max_energy*0.5], "color": "green"},
                {"range": [max_energy*0.5, max_energy*0.8], "color": "orange"},
                {"range": [max_energy*0.8, max_energy*1.2], "color": "red"},
            ],
        },
    ))
    gauge_fig.update_layout(height=350)
    st.plotly_chart(gauge_fig, use_container_width=True)

    # ---------- MONTHLY COST COMPARISON (CENTERED) ----------
    st.subheader("💰 Monthly Cost Comparison")

    monthly_cost = df.groupby("Month")["EstimatedCost"].sum()

    if len(monthly_cost) >= 2:
        prev_month_cost = monthly_cost.iloc[-2]
        current_month_cost = monthly_cost.iloc[-1]

        diff = current_month_cost - prev_month_cost
        percent = (diff / prev_month_cost) * 100 if prev_month_cost != 0 else 0
        arrow = "🔺" if percent > 0 else "🔻"

        colA, colB, colC = st.columns([1, 2, 1])
        with colB:
            color = "red" if percent > 0 else "green"
            arrow = "🔺" if percent > 0 else "🔻"

            st.markdown(
            f"""
            <div style="text-align:center; background:#161b22; padding:20px; border-radius:15px;">
            <h4>Previous Month Cost</h4>
            <h2>₹ {prev_month_cost:.0f}</h2>
            <hr>
            <h4>This Month Cost</h4>
            <h2>₹ {current_month_cost:.0f}</h2>
            <h3 style="color:{color};">{arrow} {percent:.1f}%</h3>
            </div>
             """,
             unsafe_allow_html=True
            )

    else:
        st.info("Need at least 2 months of data for comparison.")

    # ---------- LINE CHART ----------
    st.subheader("📈 Energy Trend")
    line_fig = go.Figure()
    line_fig.add_trace(go.Scatter(x=df["Date"], y=df["PredictedEnergy"], mode="lines+markers"))
    line_fig.update_layout(template="plotly_dark")
    st.plotly_chart(line_fig, use_container_width=True)

    # ---------- BAR CHART ----------
    st.subheader("📊 Monthly Energy")
    monthly_energy = df.groupby("Month")["PredictedEnergy"].sum()
    bar_fig = go.Figure(go.Bar(x=monthly_energy.index.astype(str), y=monthly_energy.values))
    bar_fig.update_layout(template="plotly_dark")
    st.plotly_chart(bar_fig, use_container_width=True)

    # ---------- DONUT CHART ----------
    st.subheader("⚙️ Energy Distribution")
    donut_fig = go.Figure(go.Pie(labels=["HVAC", "Lighting", "Others"], values=[45, 30, 25], hole=0.6))
    donut_fig.update_layout(template="plotly_dark")
    st.plotly_chart(donut_fig, use_container_width=True)

    # ---------- AI INSIGHTS ----------
    st.markdown("---")
    st.subheader("🤖 AI Insights")

    monthly_summary = ""
    for m, v in monthly_energy.items():
        monthly_summary += f"Month {int(m)}: {v:.2f} kWh\n"

    if st.button("Generate AI Insights"):
        with st.spinner("Analyzing energy data..."):
            insights = get_ai_insights(monthly_summary)
            st.markdown(insights)
