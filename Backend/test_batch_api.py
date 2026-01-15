import sys
import os
import pandas as pd
import io

# Add current directory to path so we can import app
sys.path.append(os.getcwd())

from app import app

def test_batch_prediction():
    print("Starting Batch Prediction Test...")
    try:
        client = app.test_client()
        
        # Create sample CSV content
        csv_content = """Timestamp,Temperature,Humidity,SquareFootage,Occupancy,HVACUsage,LightingUsage,RenewableEnergy,DayOfWeek,Holiday
2023-01-01 10:00:00,25,50,1500,2,On,Off,0,Sunday,No
2023-01-01 11:00:00,26,55,1500,3,On,On,5,Sunday,No
"""
        data = {
            'file': (io.BytesIO(csv_content.encode('utf-8')), 'test.csv'),
            'use_scaling': 'true'
        }
        
        response = client.post('/api/predict-batch', data=data, content_type='multipart/form-data')
        
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print("Response JSON (Success):")
            json_data = response.json
            print(json_data)
            # Check types
            if isinstance(json_data, list) and len(json_data) > 0:
                first_row = json_data[0]
                print("First row types:")
                for k, v in first_row.items():
                    print(f"{k}: {type(v)}")
        else:
            print("Error Response:")
            print(response.data.decode('utf-8'))
            
    except Exception as e:
        print(f"Test Failed with Exception: {e}")

if __name__ == "__main__":
    test_batch_prediction()
