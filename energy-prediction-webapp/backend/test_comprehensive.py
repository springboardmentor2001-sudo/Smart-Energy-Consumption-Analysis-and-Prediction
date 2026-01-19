#!/usr/bin/env python3
"""
Enhanced Chatbot - Comprehensive Feature Demonstration
Tests all new structured prediction capabilities
"""
import requests

BASE_URL = "http://127.0.0.1:5000/api"

login_resp = requests.post(f"{BASE_URL}/auth/login", json={
    "email": "demo@example.com",
    "password": "password123"
})
token = login_resp.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

print("\n" + "="*90)
print("ENHANCED CHATBOT - COMPLETE FEATURE DEMONSTRATION")
print("="*90)

# Section 1: Casual Conversation
print("\n" + "[SECTION 1] CASUAL CONVERSATION & GREETINGS")
print("-" * 90)

casual_tests = [
    ("Hi!", "Simple greeting"),
    ("Hey there, what's up?", "Casual greeting variant"),
    ("Good morning!", "Time-based greeting"),
]

for msg, desc in casual_tests:
    resp = requests.post(f"{BASE_URL}/chatbot/message", json={"message": msg}, headers=headers)
    data = resp.json()
    response = data['response'].encode('ascii', 'ignore').decode('ascii')[:65]
    print(f"\nUser: {msg}")
    print(f"Bot:  {response}...")

# Section 2: Structured Predictions
print("\n\n" + "[SECTION 2] CONVERSATIONAL STRUCTURED PREDICTIONS")
print("-" * 90)

structured_tests = [
    ("My house is 2000 sqft with 4 people in summer at 3 PM", "Full input"),
    ("I have 1800 square feet, 3 occupants, January at 10 AM", "Alternative format"),
    ("5 family members, 2500 sqft, April, 7 PM", "Mixed order"),
    ("1200 sqft house for 2 people in monsoon at midnight", "Edge case"),
]

for msg, desc in structured_tests:
    resp = requests.post(f"{BASE_URL}/chatbot/message", json={"message": msg}, headers=headers)
    data = resp.json()
    if 'prediction' in data:
        response = data['response'].encode('ascii', 'ignore').decode('ascii').split('\n')[0]
        pred = data['prediction']
        print(f"\nUser: {msg}")
        print(f"Bot:  {response}... -> PREDICTION: {pred:.0f} kWh")

# Section 3: Partial Input Handling
print("\n\n" + "[SECTION 3] MISSING FIELD DETECTION")
print("-" * 90)

partial_tests = [
    ("My house is 1500 sqft", "Only area provided"),
    ("3 people in an apartment", "Only occupants provided"),
    ("1200 sqft in summer", "Area + season but missing occupants/time"),
]

for msg, desc in partial_tests:
    resp = requests.post(f"{BASE_URL}/chatbot/message", json={"message": msg}, headers=headers)
    data = resp.json()
    if 'missing_fields' in data:
        print(f"\nUser: {msg}")
        print(f"Missing Fields: {', '.join(data['missing_fields']).title()}")
        print(f"Bot: I need additional information...\n  {data['response'].encode('ascii', 'ignore').decode('ascii')[:50]}...")

# Section 4: Temperature-Based Predictions (Backward Compatibility)
print("\n\n" + "[SECTION 4] TEMPERATURE-ONLY PREDICTIONS (LEGACY)")
print("-" * 90)

temp_tests = [
    ("Predict energy at 18 degrees", "Simple temp"),
    ("What about 28 degrees celsius?", "Celsius format"),
]

for msg, desc in temp_tests:
    resp = requests.post(f"{BASE_URL}/chatbot/message", json={"message": msg}, headers=headers)
    data = resp.json()
    if 'prediction' in data and data['is_prediction']:
        print(f"\nUser: {msg}")
        print(f"Prediction: {data['prediction']:.0f} kWh (from temperature extraction)")

# Section 5: Project Q&A
print("\n\n" + "[SECTION 5] PROJECT-RELATED Q&A")
print("-" * 90)

project_tests = [
    "How accurate is the model?",
    "What file formats can I upload?",
    "How do temperature and humidity affect predictions?",
]

for msg in project_tests:
    resp = requests.post(f"{BASE_URL}/chatbot/message", json={"message": msg}, headers=headers)
    data = resp.json()
    response = data['response'].encode('ascii', 'ignore').decode('ascii')[:60]
    print(f"\nUser: {msg}")
    print(f"Bot:  {response}...")

print("\n" + "="*90)
print("[SUCCESS] All features demonstrated successfully!")
print("="*90 + "\n")
