#!/usr/bin/env python3
import re

msg = "Predict energy at 25 degrees"
msg_lower = msg.lower()

# Check for prediction request
is_prediction_request = any(word in msg_lower for word in ['predict', 'forecast', 'calculate', 'estimate', 'how much', 'consumption'])
print(f"Is prediction request: {is_prediction_request}")

# Check for temperature
has_temp_keyword = ('temperature' in msg_lower or '°' in msg or 'temp' in msg_lower)
print(f"Has temperature keyword: {has_temp_keyword}")

# Try to extract temperature
temp_match = re.search(r'(\d+)\s*°?c?|temperature\s+(\d+)', msg_lower)
if temp_match:
    temp = int(temp_match.group(1) or temp_match.group(2))
    print(f"Temperature extracted: {temp}°C")
    pred = 200 + (temp * 10)
    print(f"Prediction: {pred} kWh")
else:
    print("No temperature match found")
    print(f"Groups in regex search: {temp_match}")
