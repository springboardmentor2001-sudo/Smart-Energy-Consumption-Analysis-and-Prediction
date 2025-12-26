from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import numpy as np

app = Flask(__name__)
CORS(app)

@app.route('/api/summary', methods=['GET'])
def get_summary():
    return jsonify({
        "current_usage": 1.2,
        "today_consumption": 12.5,
        "monthly_consumption": 320.0,
        "predicted_24h": 14.2
    })

@app.route('/api/device-usage', methods=['GET'])
def get_device_usage():
    # Mock data
    usage_data = [
        {"name": "AC", "value": 12.5, "trend": "up"},
        {"name": "Fridge", "value": 4.2, "trend": "stable"},
        {"name": "Lights", "value": 2.1, "trend": "down"},
        {"name": "TV", "value": 1.8, "trend": "stable"},
        {"name": "Others", "value": 1.5, "trend": "down"}
    ]
    return jsonify(usage_data)

@app.route('/api/chat', methods=['POST'])
def chat_with_ai():
    data = request.json
    user_message = data.get('message', '')
    
    # Mock GenAI Logic with Context Injection
    # In a real app, this would call OpenAI/Gemini API with reading from database
    
    response_text = "I'm analyzing your real-time data... "
    
    if "high" in user_message.lower() or "bill" in user_message.lower():
        response_text += "It seems your **AC** is consuming 40% of your daily load. Try setting it to 24°C to save ~15% on your bill."
    elif "reduce" in user_message:
        response_text += "You can reduce consumption by using smart schedules for your Heater and ensuring Lights are off during the day."
    else:
        response_text += f"I received: '{user_message}'. I can help you analyze trends, predict usage, or give saving tips."

    return jsonify({
        "role": "assistant",
        "content": response_text
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
