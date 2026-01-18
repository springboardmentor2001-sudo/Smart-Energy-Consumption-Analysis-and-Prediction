import streamlit as st
import pandas as pd
import os
import sys

# ---------- Unified Backend Path ----------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, "..", ".."))
BACKEND_DIR = os.path.join(PROJECT_ROOT, "backend")
sys.path.append(PROJECT_ROOT)

def app():
    st.title("📄 Energy Reports")

    # Check login
    if "user_data_file" not in st.session_state:
        st.warning("Please login first.")
        return

    file_path = os.path.join(BACKEND_DIR, st.session_state.user_data_file)

    if not os.path.exists(file_path):
        st.warning("No prediction data available yet for this user.")
        return

    df = pd.read_csv(file_path)

    # -------- Full Report --------
    st.subheader("📊 Full Prediction Report")
    st.write("Download complete history of all your predictions.")

    st.download_button(
        label="⬇ Download Full Report (CSV)",
        data=df.to_csv(index=False),
        file_name="full_energy_report.csv",
        mime="text/csv"
    )

    st.markdown("---")

    # -------- Monthly Report --------
    st.subheader("📅 Monthly Report")

    month = st.selectbox("Select Month", sorted(df["Month"].unique()))
    monthly_df = df[df["Month"] == month]

    st.dataframe(monthly_df, width="stretch")

    st.download_button(
        label=f"⬇ Download Month {month} Report (CSV)",
        data=monthly_df.to_csv(index=False),
        file_name=f"energy_report_month_{month}.csv",
        mime="text/csv"
    )

