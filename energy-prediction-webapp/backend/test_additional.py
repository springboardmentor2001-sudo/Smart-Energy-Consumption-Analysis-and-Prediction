#!/usr/bin/env python3
import requests

BASE_URL = "http://127.0.0.1:5000/api"

login_resp = requests.post(f"{BASE_URL}/auth/login", json={
    "email": "demo@example.com",
    "password": "password123"
})
token = login_resp.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

tests = [
    ("Hey there!", "Greeting variant"),
    ("Thank you so much!", "Gratitude variant"),
    ("What is machine learning?", "General knowledge"),
    ("I want to predict energy for temperature 30 degrees", "Detailed prediction"),
    ("How do I upload a file?", "Project help"),
]

print("\n" + "="*75)
print("ADDITIONAL CHATBOT TEST SCENARIOS")
print("="*75 + "\n")

for msg, title in tests:
    resp = requests.post(f"{BASE_URL}/chatbot/message", 
                        json={"message": msg},
                        headers=headers)
    data = resp.json()
    response_text = data.get("response", "NO RESPONSE")[:100]
    
    print(f"[{title}]")
    print(f"Q: {msg}")
    print(f"A: {response_text}...")
    print()
