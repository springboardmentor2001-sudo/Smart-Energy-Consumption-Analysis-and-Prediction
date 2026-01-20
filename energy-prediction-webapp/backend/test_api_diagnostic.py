"""
Diagnostic test to see what the API actually returns
"""

import requests
import json

print("=" * 80)
print("TESTING API PREDICTION ENDPOINT WITH AUTH")
print("=" * 80)

# Try to connect to backend
try:
    # Step 1: Login
    print("\n[Step 1] Logging in...")
    login_response = requests.post(
        'http://localhost:5000/api/auth/login',
        json={"email": "demo@example.com", "password": "password123"},
        timeout=5
    )
    
    if login_response.status_code != 200:
        print(f"Login failed: {login_response.json()}")
        exit(1)
    
    token = login_response.json().get('access_token')
    print(f"✓ Login successful, token: {token[:20]}...")
    
    # Step 2: Make prediction
    print("\n[Step 2] Making prediction...")
    test_payload = {
        "temperature": 0,
        "humidity": 40,
        "square_footage": 3000,
        "month": 1,
        "hvac_appliances": 2,
        "time": 12
    }
    print(f"Input: {test_payload}")
    
    headers = {"Authorization": f"Bearer {token}"}
    pred_response = requests.post(
        'http://localhost:5000/api/predict/form',
        json=test_payload,
        headers=headers,
        timeout=5
    )
    
    print(f"\nResponse Status: {pred_response.status_code}")
    result = pred_response.json()
    print(f"Response JSON:\n{json.dumps(result, indent=2)}")
    
    if pred_response.status_code == 200:
        pred = result.get('prediction')
        print(f"\n✓ Prediction: {pred:.2f} kWh")
        
        if 200 <= pred <= 800:
            print("✓ CORRECT RANGE (200-800 kWh)")
        else:
            print(f"✗ WRONG RANGE - Expected 200-800 kWh, got {pred:.2f}")
    
except requests.exceptions.ConnectionError:
    print("\n✗ Cannot connect to backend at http://localhost:5000")
    print("  Make sure to run: python app.py")
except Exception as e:
    print(f"\n✗ Error: {str(e)}")

print("\n" + "=" * 80)
