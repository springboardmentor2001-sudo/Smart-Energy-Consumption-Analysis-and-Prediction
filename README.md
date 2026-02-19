Smart Energy Consumption Analysis and Prediction

Infosys Springboard – Machine Learning Internship Project

 Problem Statement

Buildings consume a large amount of electricity due to inefficient usage of HVAC systems, temperature control, occupancy patterns, and low renewable energy adoption.
The objective of this project is to:

- Predict building energy consumption
- Explain why consumption is high or low
- Provide optimization suggestions
- Allow users to interact with the system through an AI chatbot

 Project Objective

To build a complete intelligent system that combines:

Machine Learning + Generative AI + Web Application

The system helps users understand energy usage and make smarter decisions to reduce electricity consumption.

 Solution Overview

The application predicts energy consumption (kWh) using a trained XGBoost regression model and provides intelligent explanations using Google Gemini AI.

Users can:

- Enter parameters manually
- Upload CSV files for bulk prediction
- Chat with AI to run prediction
- Get energy audit reports
- Download PDF report
- Submit feedback

Technologies Used

Machine Learning

- XGBoost Regression Model
- NumPy
- Pandas
- Feature Engineering

Backend

- Python
- Flask REST API
- Flask-CORS

AI Integration

- Google Gemini Generative AI

Frontend

- HTML
- CSS
- JavaScript

Database

- SQLite (Feedback Storage)

Reporting

- Matplotlib (Charts)
- ReportLab (PDF generation)

System Architecture

User Interface (Web)
↓
Flask Backend API
↓
ML Prediction Model (XGBoost)
↓
Gemini AI (Explanation + Chatbot)
↓
Energy Audit & PDF Report

---

 Features

1. Energy Prediction

Predicts electricity consumption using input parameters:

- HVAC Usage
- Occupancy
- Temperature
- Renewable Energy %
- Hour of Day
- Weekend / Weekday

---

2. AI Chatbot

The chatbot can:

- Perform prediction from natural language
- Explain model output
- Answer model related questions
- Provide general energy saving advice

Example:

predict hvac on occupancy 40 temperature 32 renewable 20 hour 14 weekend
why energy high
how model works

---

3. Energy Audit Report

Provides:

- Efficiency Score
- Risk Level
- Inefficiencies
- Recommendations

---

4. CSV Bulk Prediction

Upload dataset → get predictions for multiple records.

---

5. PDF Report

Download complete audit report with chart visualization.

---

6. Feedback Module

User feedback stored in database for system improvement.

 Project Structure

backend/
    app.py
    requirements.txt
    runtime.txt
    model/
        energy_xgb_model.pkl

frontend/
    index.html
    script.js
    style.css

 How to Run Locally

Step 1: Clone Repository

git clone <repository-url>
cd project

Step 2: Install Dependencies

pip install -r backend/requirements.txt

Step 3: Add API Key

Create environment variable:

GEMINI_API_KEY=your_key_here

Step 4: Run Backend

cd backend
python app.py

Step 5: Run Frontend

Open index.html using Live Server.

 Deployment

The project can be deployed using cloud platforms such as Render with environment variables configured for secure API access.

Learning Outcomes

- End-to-end ML system development
- Model deployment using Flask API
- Integrating Generative AI into ML apps
- Handling real-world user inputs
- Building explainable AI systems
- Cloud deployment

---

 Conclusion

This project demonstrates how Machine Learning and Generative AI can be combined to create an intelligent decision-support system for energy optimization.
The system not only predicts consumption but also explains and guides users toward efficient energy usage.

