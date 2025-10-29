#!/usr/bin/env python3
"""
Test the AI service endpoints
"""

import requests
import json

def test_health():
    """Test health endpoint"""
    print("Testing /health endpoint...")
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        print(f"Status: {response.status_code}")
        print(f"EResponse: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_model_info():
    """Test model info endpoint"""
    print("\nTesting /model-info endpoint...")
    try:
        response = requests.get("http://localhost:8000/model-info", timeout=5)
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_generate_summary():
    """Test summary generation"""
    print("\nTesting /generate/summary endpoint...")
    
    payload = {
        "content": "This is a test document about machine learning. Machine learning is a subset of artificial intelligence.",
        "title": "Test Document",
        "max_length": 100
    }
    
    try:
        response = requests.post(
            "http://localhost:8000{}",
            json=payload,
            timeout=60
        )
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print(f"✅ Summary generated successfully!")
            print(f"Response: {json.dumps(response.json(), indent=2)}")
            return True
        else:
            print(f"❌ Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    print("=" * 60)
    print("AI Service Testing")
    print("=" * 60)
    
    # Test health
    health_ok = test_health()
    
    # Test model info
    model_ok = test_model_info()
    
    # Test summary generation
    if health_ok and model_ok:
        summary_ok = test_generate_summary()
    else:
        summary_ok = False
        print("\nSkipping summary test due to previous failures")
    
    print()
    print("=" * 60)
    if health_ok and model_ok and summary_ok:
        print("✅ All tests passed!")
    else:
        print("❌ Some tests failed!")
    print("=" * 60)

if __name__ == "__main__":
    main()

