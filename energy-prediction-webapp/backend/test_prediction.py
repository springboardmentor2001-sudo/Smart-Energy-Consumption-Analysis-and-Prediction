import requests
import json

# Test with different inputs
test_cases = [
    {
        'name': 'Cold Winter Day',
        'data': {
            'temperature': 0,
            'humidity': 40,
            'square_footage': 3000,
            'month': 1,
            'hvac_appliances': 2,
            'hvac_type': 'central-ac',
            'season': 'winter',
            'time': 12
        }
    },
    {
        'name': 'Hot Summer Day',
        'data': {
            'temperature': 35,
            'humidity': 60,
            'square_footage': 3000,
            'month': 7,
            'hvac_appliances': 2,
            'hvac_type': 'central-ac',
            'season': 'summer',
            'time': 12
        }
    },
    {
        'name': 'Mild Spring Day',
        'data': {
            'temperature': 20,
            'humidity': 50,
            'square_footage': 3000,
            'month': 4,
            'hvac_appliances': 2,
            'hvac_type': 'central-ac',
            'season': 'spring',
            'time': 12
        }
    }
]

for test in test_cases:
    print(f"\n{'='*60}")
    print(f"Test: {test['name']}")
    print(f"Input: {json.dumps(test['data'], indent=2)}")
    
    response = requests.post(
        'http://localhost:5000/api/predict/form',
        json=test['data'],
        headers={'Authorization': 'Bearer test-token'}
    )
    
    print(f"Response Status: {response.status_code}")
    result = response.json()
    print(f"Response: {json.dumps(result, indent=2)}")
    
    if 'prediction' in result:
        print(f"Prediction: {result['prediction']} kWh")
