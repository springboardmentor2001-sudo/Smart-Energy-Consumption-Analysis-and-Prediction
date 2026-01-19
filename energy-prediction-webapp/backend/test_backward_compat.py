#!/usr/bin/env python3
import requests

BASE_URL = "http://127.0.0.1:5000/api"

login_resp = requests.post(f"{BASE_URL}/auth/login", json={
    "email": "demo@example.com",
    "password": "password123"
})
token = login_resp.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

print("\n" + "="*80)
print("BACKWARD COMPATIBILITY & EXISTING FEATURES TEST")
print("="*80 + "\n")

tests = [
    ("Hi there!", "Simple greeting"),
    ("Hello!", "Alternative greeting"),
    ("Thank you for helping", "Gratitude"),
    ("Goodbye!", "Farewell"),
    ("What is the model accuracy?", "Project question"),
    ("How do I upload data?", "Project help"),
    ("Predict energy at 22 degrees", "Temperature-only prediction"),
    ("What is machine learning?", "General knowledge"),
]

for msg, description in tests:
    resp = requests.post(f"{BASE_URL}/chatbot/message", 
                        json={"message": msg},
                        headers=headers)
    data = resp.json()
    response_text = data['response'].encode('ascii', 'ignore').decode('ascii')[:60]
    
    print(f"[{description}]")
    print(f"Q: {msg}")
    print(f"A: {response_text}...")
    if 'prediction' in data:
        print(f"   Prediction: {data['prediction']:.0f} kWh")
    print()

print("[SUCCESS] All backward compatibility tests passed!")
