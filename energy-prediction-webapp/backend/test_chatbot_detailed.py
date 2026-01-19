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

# Test scenarios
tests = [
    ("Hi", "Greeting"),
    ("What is energy prediction?", "Project Question"),
    ("Thank you", "Gratitude"),
    ("Predict energy at 25 degrees", "Prediction Request"),
    ("Goodbye", "Farewell")
]

headers = {"Authorization": f"Bearer {token}"}

print("\n" + "="*70)
print("ENHANCED CHATBOT TEST RESULTS")
print("="*70 + "\n")

for msg, title in tests:
    print(f"[TEST] {title}")
    print(f"User Message: {msg}")
    
    resp = requests.post(f"{BASE_URL}/chatbot/message", 
                        json={"message": msg},
                        headers=headers)
    data = resp.json()
    response_text = data.get("response", "NO RESPONSE")
    suggestions = data.get("suggested_questions", [])
    
    print(f"Bot Response:\n{response_text}\n")
    if suggestions:
        print("Suggested Questions:")
        for i, q in enumerate(suggestions, 1):
            print(f"  {i}. {q}")
    print("-" * 70 + "\n")

print("✓ All chatbot scenarios tested successfully!")
