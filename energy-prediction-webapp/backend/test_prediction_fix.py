#!/usr/bin/env python
"""
Test script to verify the prediction accuracy fix
Tests that predictions vary based on input parameters
"""

import json
import requests
import sys

BASE_URL = "http://localhost:5000"

# Test credentials
TEST_EMAIL = "demo@example.com"
TEST_PASSWORD = "password123"
TOKEN = None

def get_token():
    """Get JWT token for authentication"""
    global TOKEN
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    if response.status_code == 200:
        TOKEN = response.json()["access_token"]
        print(f"✅ Got authentication token")
        return TOKEN
    else:
        print(f"❌ Authentication failed: {response.text}")
        sys.exit(1)

def predict(test_name, input_data):
    """Make a prediction and display results"""
    headers = {"Authorization": f"Bearer {TOKEN}"}
    
    response = requests.post(f"{BASE_URL}/api/predict/form", 
                           json=input_data,
                           headers=headers)
    
    if response.status_code == 200:
        result = response.json()
        prediction = result.get("prediction", "N/A")
        confidence = result.get("confidence", "N/A")
        print(f"\n✅ {test_name}")
        print(f"   Input: Temp={input_data.get('temperature')}°C, "
              f"Humidity={input_data.get('humidity')}%, "
              f"SqFt={input_data.get('square_footage')}")
        print(f"   Prediction: {prediction:.0f} kWh")
        print(f"   Confidence: {confidence}")
        return prediction
    else:
        print(f"\n❌ {test_name}")
        print(f"   Error: {response.json()}")
        return None

def run_tests():
    """Run comprehensive prediction tests"""
    print("=" * 70)
    print("PREDICTION ACCURACY FIX - TEST SUITE")
    print("=" * 70)
    
    # Get token first
    get_token()
    
    # Base test data
    base_data = {
        "temperature": 20,
        "humidity": 50,
        "square_footage": 5000,
        "month": 6,
        "hvac_type": "central-ac",
        "season": "summer",
        "time": 12,
        "hvac_appliances": 2
    }
    
    predictions = {}
    
    # TEST 1: Temperature variation
    print("\n" + "=" * 70)
    print("TEST 1: TEMPERATURE VARIATION (Should have significant impact)")
    print("=" * 70)
    
    data_cold = {**base_data, "temperature": 5}
    predictions['temp_cold'] = predict("Cold (5°C)", data_cold)
    
    data_warm = {**base_data, "temperature": 35}
    predictions['temp_warm'] = predict("Warm (35°C)", data_warm)
    
    if predictions['temp_cold'] and predictions['temp_warm']:
        diff = abs(predictions['temp_warm'] - predictions['temp_cold'])
        pct_diff = (diff / ((predictions['temp_warm'] + predictions['temp_cold']) / 2)) * 100
        print(f"\n📊 Temperature impact: {diff:.0f} kWh difference ({pct_diff:.1f}%)")
        if pct_diff > 5:
            print("   ✅ PASS: Temperature has significant impact")
        else:
            print("   ❌ FAIL: Temperature impact too small")
    
    # TEST 2: Square footage variation
    print("\n" + "=" * 70)
    print("TEST 2: SQUARE FOOTAGE VARIATION (Should impact prediction)")
    print("=" * 70)
    
    data_small = {**base_data, "square_footage": 2000}
    predictions['sqft_small'] = predict("Small building (2000 sqft)", data_small)
    
    data_large = {**base_data, "square_footage": 10000}
    predictions['sqft_large'] = predict("Large building (10000 sqft)", data_large)
    
    if predictions['sqft_small'] and predictions['sqft_large']:
        diff = abs(predictions['sqft_large'] - predictions['sqft_small'])
        pct_diff = (diff / ((predictions['sqft_large'] + predictions['sqft_small']) / 2)) * 100
        print(f"\n📊 Square footage impact: {diff:.0f} kWh difference ({pct_diff:.1f}%)")
        if pct_diff > 5:
            print("   ✅ PASS: Square footage has significant impact")
        else:
            print("   ❌ FAIL: Square footage impact too small")
    
    # TEST 3: Season variation
    print("\n" + "=" * 70)
    print("TEST 3: SEASON VARIATION (Winter should use more energy than summer)")
    print("=" * 70)
    
    data_winter = {**base_data, "season": "winter", "month": 1, "temperature": 0}
    predictions['season_winter'] = predict("Winter (month=1, temp=0°C)", data_winter)
    
    data_summer = {**base_data, "season": "summer", "month": 7, "temperature": 35}
    predictions['season_summer'] = predict("Summer (month=7, temp=35°C)", data_summer)
    
    if predictions['season_winter'] and predictions['season_summer']:
        diff = abs(predictions['season_winter'] - predictions['season_summer'])
        pct_diff = (diff / ((predictions['season_winter'] + predictions['season_summer']) / 2)) * 100
        print(f"\n📊 Season impact: {diff:.0f} kWh difference ({pct_diff:.1f}%)")
        if pct_diff > 5:
            print("   ✅ PASS: Season has significant impact")
        else:
            print("   ❌ FAIL: Season impact too small")
    
    # TEST 4: HVAC type variation
    print("\n" + "=" * 70)
    print("TEST 4: HVAC TYPE VARIATION (Different systems should vary)")
    print("=" * 70)
    
    data_central = {**base_data, "hvac_type": "central-ac"}
    predictions['hvac_central'] = predict("Central AC", data_central)
    
    data_window = {**base_data, "hvac_type": "window-ac"}
    predictions['hvac_window'] = predict("Window AC", data_window)
    
    if predictions['hvac_central'] and predictions['hvac_window']:
        diff = abs(predictions['hvac_central'] - predictions['hvac_window'])
        pct_diff = (diff / ((predictions['hvac_central'] + predictions['hvac_window']) / 2)) * 100
        print(f"\n📊 HVAC type impact: {diff:.0f} kWh difference ({pct_diff:.1f}%)")
        if pct_diff > 2:
            print("   ✅ PASS: HVAC type has measurable impact")
        else:
            print("   ⚠️ WARNING: HVAC type impact is minimal")
    
    # TEST 5: Humidity variation
    print("\n" + "=" * 70)
    print("TEST 5: HUMIDITY VARIATION (Should have some impact)")
    print("=" * 70)
    
    data_dry = {**base_data, "humidity": 20}
    predictions['humidity_dry'] = predict("Dry (20% humidity)", data_dry)
    
    data_humid = {**base_data, "humidity": 80}
    predictions['humidity_humid'] = predict("Humid (80% humidity)", data_humid)
    
    if predictions['humidity_dry'] and predictions['humidity_humid']:
        diff = abs(predictions['humidity_humid'] - predictions['humidity_dry'])
        pct_diff = (diff / ((predictions['humidity_humid'] + predictions['humidity_dry']) / 2)) * 100
        print(f"\n📊 Humidity impact: {diff:.0f} kWh difference ({pct_diff:.1f}%)")
        if pct_diff > 2:
            print("   ✅ PASS: Humidity has measurable impact")
        else:
            print("   ⚠️ WARNING: Humidity impact is minimal")
    
    # TEST 6: Time of day variation
    print("\n" + "=" * 70)
    print("TEST 6: TIME OF DAY VARIATION (Peak vs off-peak)")
    print("=" * 70)
    
    data_night = {**base_data, "time": 3}
    predictions['time_night'] = predict("Night (3 AM)", data_night)
    
    data_peak = {**base_data, "time": 15}
    predictions['time_peak'] = predict("Peak (3 PM)", data_peak)
    
    if predictions['time_night'] and predictions['time_peak']:
        diff = abs(predictions['time_peak'] - predictions['time_night'])
        pct_diff = (diff / ((predictions['time_peak'] + predictions['time_night']) / 2)) * 100
        print(f"\n📊 Time of day impact: {diff:.0f} kWh difference ({pct_diff:.1f}%)")
        if pct_diff > 2:
            print("   ✅ PASS: Time of day has measurable impact")
        else:
            print("   ⚠️ WARNING: Time of day impact is minimal")
    
    # TEST 7: Appliances variation
    print("\n" + "=" * 70)
    print("TEST 7: APPLIANCES VARIATION (More appliances = more energy)")
    print("=" * 70)
    
    data_few_appliances = {**base_data, "hvac_appliances": 1}
    predictions['appliances_1'] = predict("Few appliances (1)", data_few_appliances)
    
    data_many_appliances = {**base_data, "hvac_appliances": 5}
    predictions['appliances_5'] = predict("Many appliances (5)", data_many_appliances)
    
    if predictions['appliances_1'] and predictions['appliances_5']:
        diff = abs(predictions['appliances_5'] - predictions['appliances_1'])
        pct_diff = (diff / ((predictions['appliances_5'] + predictions['appliances_1']) / 2)) * 100
        print(f"\n📊 Appliances impact: {diff:.0f} kWh difference ({pct_diff:.1f}%)")
        if pct_diff > 2:
            print("   ✅ PASS: Appliances count has measurable impact")
        else:
            print("   ⚠️ WARNING: Appliances impact is minimal")
    
    # SUMMARY
    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)
    
    valid_predictions = {k: v for k, v in predictions.items() if v is not None}
    
    if len(valid_predictions) >= 7:
        all_different = len(set(valid_predictions.values())) == len(valid_predictions)
        
        if all_different:
            print("✅ ALL TESTS PASSED: Predictions vary based on input parameters")
        else:
            print("⚠️ PARTIAL SUCCESS: Some predictions are too similar")
            print(f"   Different prediction values: {len(set(valid_predictions.values()))} / {len(valid_predictions)}")
    else:
        print(f"❌ TESTS FAILED: Only got {len(valid_predictions)} valid predictions out of 7")
    
    print("\n📋 Prediction values obtained:")
    for name, value in sorted(valid_predictions.items()):
        print(f"   {name}: {value:.0f} kWh")

if __name__ == "__main__":
    try:
        run_tests()
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Cannot connect to backend server at http://localhost:5000")
        print("Please ensure the Flask backend is running:")
        print("   cd backend && python app.py")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        sys.exit(1)
