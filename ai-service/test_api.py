#!/usr/bin/env python3
"""
Quick test of the AI service API
"""

import requests
import json

# Test health
print("1. Testing /health endpoint...")
try:
    response = requests.get("http://localhost:8000/health", timeout=5)
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.json()}")
except Exception as e:
    print(f"   ERROR: {e}")

print("\n2. Testing /generate/summary endpoint...")
payload = {
    "content": "Machine learning is a method of data analysis. It involves algorithms that can learn from data.",
    "title": "Test Document",
    "max_length": 100
}

try:
    response = requests.post(
        "http://localhost:8000/generate/summary",
        json=payload,
        timeout=30
    )
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        print(f"   SUCCESS: Summary generated!")
        print(f"   Response: {json.dumps(response.json(), indent=2)}")
    else:
        print(f"   ERROR: {response.text}")
except Exception as e:
    print(f"   ERROR: {e}")
    import traceback
    traceback.print_exc()

