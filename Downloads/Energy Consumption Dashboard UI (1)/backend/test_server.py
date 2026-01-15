#!/usr/bin/env python3
"""Minimal test server"""

from flask import Flask, jsonify
from flask_cors import CORS
import os

print("Starting imports...")
app = Flask(__name__)
print("Flask app created")

CORS(app)
print("CORS enabled")

PORT = int(os.environ.get('PORT', 5000))

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'message': 'API is running'
    })

@app.route('/', methods=['GET'])
def index():
    return jsonify({'message': 'SmartEnergy API running'})

if __name__ == '__main__':
    print(f"Starting server on port {PORT}...")
    app.run(host='0.0.0.0', port=PORT, debug=True)
