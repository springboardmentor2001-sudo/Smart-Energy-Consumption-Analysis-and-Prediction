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
print(f"✓ Logged in. Token: {token[:20]}...")

# Test scenarios
tests = [
    ("Hi", "Greeting"),
    ("What is energy prediction?", "Project Question"),
    ("Thank you", "Gratitude"),
    ("Predict energy at 25 degrees", "Prediction"),
    ("Goodbye", "Farewell")
]

headers = {"Authorization": f"Bearer {token}"}

print("\n=== CHATBOT TEST RESULTS ===\n")

for msg, title in tests:
    resp = requests.post(f"{BASE_URL}/chatbot/message", 
                        json={"message": msg},
                        headers=headers)
    data = resp.json()
    response_text = data.get("response", "NO RESPONSE")[:75]
    print(f"{title}: {msg}")
    print(f"→ {response_text}...\n")

print("✓ All tests completed!")
