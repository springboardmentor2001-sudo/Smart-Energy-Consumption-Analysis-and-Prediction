#!/usr/bin/env python3
import requests
import json

BASE_URL = "http://127.0.0.1:5000/api"

# Login
login_resp = requests.post(f"{BASE_URL}/auth/login", json={
    "email": "demo@example.com",
    "password": "password123"
})
token = login_resp.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

print("\n" + "="*80)
print("ENHANCED CHATBOT - STRUCTURED PREDICTION TESTS")
print("="*80 + "\n")

tests = [
    ("My house is 1500 sqft with 3 occupants in summer at 6 PM", "Full structured input"),
    ("I have 1200 square feet, 4 people, July, 2:00 PM", "Alternative format"),
    ("Predict energy: 2000 sqft, 5 applicants, winter, 8 AM", "Prediction keyword"),
    ("My house is 1200 sqft", "Partial input - missing fields"),
    ("3 family members in 800 sqft home at 10 PM in April", "Mixed order input"),
    ("2 people, 1500 sqft house, month 9, 14:30", "Numeric format"),
]

for msg, description in tests:
    print(f"\n[TEST] {description}")
    print(f"User: {msg}\n")
    
    resp = requests.post(f"{BASE_URL}/chatbot/message", 
                        json={"message": msg},
                        headers=headers)
    data = resp.json()
    
    # Remove emojis from response for console display
    response_text = data['response'].encode('ascii', 'ignore').decode('ascii')
    print(f"Response:\n{response_text}\n")
    
    if 'extracted_data' in data:
        print(f"Extracted: {data['extracted_data']}")
    if 'missing_fields' in data:
        print(f"Missing: {data['missing_fields']}")
    if 'prediction' in data:
        print(f"Prediction: {data['prediction']:.0f} kWh")
    
    if 'suggested_questions' in data:
        print(f"Suggestions: {data['suggested_questions'][:2]}")
    
    print("-" * 80)

print("\n[SUCCESS] All structured prediction tests completed!")
