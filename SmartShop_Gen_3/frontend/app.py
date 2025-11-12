# frontend/app.py

import streamlit as st
import requests
import pandas as pd

API_URL = "http://localhost:8000/predict"

st.set_page_config(page_title="SmartShop Dashboard", layout="wide")
st.title("🛍️ SmartShop Inventory & ML Insights")

st.sidebar.header("Navigation")
page = st.sidebar.radio("Go to", ["Dashboard", "ML Analytics"])

if page == "Dashboard":
    st.info("📊 This section will display inventory, transactions, etc.")
    st.write("You can integrate your existing Streamlit dashboard here.")

elif page == "ML Analytics":
    st.header("🤖 AI-Driven Sales Forecast & Performance")

    if st.button("Run ML Prediction"):
        with st.spinner("Fetching predictions from ML API..."):
            try:
                response = requests.get(API_URL, timeout=30)
                if response.status_code == 200:
                    data = response.json()

                    # --- Forecast Results ---
                    st.subheader("📈 Sales Forecast")
                    df_forecast = pd.DataFrame(data["forecast"])
                    st.table(df_forecast)

                    # --- Classification Results ---
                    st.subheader("🎯 Classification Results")
                    class_data = data["classification"]
                    if class_data:
                        st.metric("Model Accuracy", f"{class_data['accuracy']*100:.2f}%")
                        st.json(class_data["feature_importance"])
                    else:
                        st.warning("Not enough data for classification model.")
                else:
                    st.error(f"API Error: {response.status_code}")
            except Exception as e:
                st.error(f"Failed to connect to API: {e}")
