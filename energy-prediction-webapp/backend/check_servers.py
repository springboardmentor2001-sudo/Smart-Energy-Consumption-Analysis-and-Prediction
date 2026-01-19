#!/usr/bin/env python3
import requests

try:
    resp = requests.get("http://127.0.0.1:5000/api/health", timeout=2)
    print("[OK] Backend running on port 5000")
except:
    print("[ERROR] Backend not responding on port 5000")

try:
    resp = requests.get("http://127.0.0.1:3000", timeout=2)
    print("[OK] Frontend running on port 3000")
except:
    print("[WARNING] Frontend not responding on port 3000 - may need to start with 'npm run dev'")
