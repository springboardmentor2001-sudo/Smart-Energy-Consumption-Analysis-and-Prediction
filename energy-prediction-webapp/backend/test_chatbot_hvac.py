"""
Test script for enhanced chatbot with HVAC type support
"""
import requests
import json

BASE_URL = "http://127.0.0.1:5000"

def test_chatbot():
    """Test chatbot with various messages including HVAC details"""
    
    # First login
    login_data = {
        "email": "demo@example.com",
        "password": "password123"
    }
    
    print("🔐 Logging in...")
    resp = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
    if resp.status_code != 200:
        print(f"❌ Login failed: {resp.text}")
        return
    
    token = resp.json()['access_token']
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    # Test cases
    test_messages = [
        # Basic greeting
        ("hi there", "Greeting test"),
        
        # Partial HVAC info - should ask for more
        ("I have a central AC with 2 units", "Partial info"),
        
        # Full HVAC prediction request
        (
            "I want a prediction for my house. It's 5000 sqft, 4 people, 2 central AC units, temperature 22°C, humidity 55%, in summer at 2 PM",
            "Full prediction with HVAC type"
        ),
        
        # Another full prediction
        (
            "My place is 3500 square feet, 2 residents, 1 window AC unit, 18 degrees, 60% humidity, march, at 10 AM",
            "Prediction with window AC"
        ),
        
        # Heat pump prediction
        (
            "Predict for 4200 sqft, 3 people, heat pump system, temperature 20°C, humidity 45%, October at 6 PM",
            "Heat pump prediction"
        ),
        
        # Thank you
        ("thanks for the help", "Gratitude test"),
    ]
    
    for message, description in test_messages:
        print(f"\n{'='*60}")
        print(f"📝 Test: {description}")
        print(f"💬 Message: {message}")
        print(f"{'='*60}")
        
        try:
            resp = requests.post(
                f"{BASE_URL}/api/chatbot/message",
                headers=headers,
                json={"message": message}
            )
            
            if resp.status_code == 200:
                result = resp.json()
                print(f"✅ Response received")
                print(f"📄 Response: {result.get('response', 'No response text')[:200]}...")
                
                if result.get('is_prediction'):
                    print(f"⚡ Prediction: {result.get('prediction', 'N/A')} kWh")
                    print(f"📊 Input: {result.get('input_summary', {})}")
                
                if result.get('missing_fields'):
                    print(f"❓ Missing: {result.get('missing_fields')}")
                
                if result.get('suggested_questions'):
                    print(f"💡 Suggested: {result.get('suggested_questions')[0]}")
            else:
                print(f"❌ Error: {resp.status_code} - {resp.text}")
        
        except Exception as e:
            print(f"❌ Exception: {str(e)}")

if __name__ == "__main__":
    test_chatbot()
