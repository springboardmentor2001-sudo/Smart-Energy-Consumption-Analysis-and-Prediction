#!/usr/bin/env python3
"""
Gemini API Diagnostic & Fix Script
Tries ALL possible model names and API versions
"""

import os
from dotenv import load_dotenv

load_dotenv()

try:
    import google.generativeai as genai
    print("✓ google-generativeai package installed")
except ImportError:
    print("❌ google-generativeai not installed")
    print("   Run: pip install -U google-generativeai")
    exit(1)

# Get API key
api_key = os.getenv('GEMINI_API_KEY')
if not api_key:
    print("❌ GEMINI_API_KEY not found in .env file")
    exit(1)

print(f"✓ API Key found: {api_key[:15]}...")

# Configure Gemini
try:
    genai.configure(api_key=api_key)
    print("✓ Gemini configured")
except Exception as e:
    print(f"❌ Configuration failed: {e}")
    exit(1)

print("\n" + "="*70)
print("🔍 LISTING ALL AVAILABLE MODELS FROM YOUR API KEY")
print("="*70)

try:
    print("\nQuerying Google AI for available models...\n")
    models = genai.list_models()
    
    available_models = []
    for model in models:
        if 'generateContent' in model.supported_generation_methods:
            available_models.append(model.name)
            print(f"✓ Found: {model.name}")
            print(f"  Methods: {', '.join(model.supported_generation_methods)}")
    
    if available_models:
        print("\n" + "="*70)
        print("✅ AVAILABLE MODELS FOUND!")
        print("="*70)
        
        print("\nTesting the first available model...\n")
        
        # Test the first available model
        test_model_name = available_models[0]
        print(f"Testing: {test_model_name}")
        
        model = genai.GenerativeModel(test_model_name)
        response = model.generate_content("Say 'Working!' if you can read this")
        
        print(f"✓ Response: {response.text}\n")
        
        print("="*70)
        print("✅ SUCCESS! UPDATE YOUR APP.PY WITH THIS:")
        print("="*70)
        print(f"\nReplace this line in app.py:")
        print(f"   gemini_model = genai.GenerativeModel('...')")
        print(f"\nWith:")
        print(f"   gemini_model = genai.GenerativeModel('{test_model_name}')")
        print("\n" + "="*70)
        
    else:
        print("\n" + "="*70)
        print("❌ NO MODELS AVAILABLE")
        print("="*70)
        raise Exception("No models found")
        
except Exception as e:
    print("\n" + "="*70)
    print("❌ ERROR: Could not list models")
    print("="*70)
    print(f"\nError: {e}\n")
    
    print("🔧 TROUBLESHOOTING STEPS:")
    print("-" * 70)
    print("\n1. ✅ Enable the Generative Language API:")
    print("   Go to: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com")
    print("   Click 'ENABLE'")
    
    print("\n2. ✅ Create a NEW API Key:")
    print("   Go to: https://aistudio.google.com/app/apikey")
    print("   Click 'Create API Key'")
    print("   Copy the key")
    
    print("\n3. ✅ Update your .env file:")
    print("   GEMINI_API_KEY=your_new_key_here")
    
    print("\n4. ✅ Try with Google AI Studio API Key (NOT Cloud Console):")
    print("   URL: https://aistudio.google.com/app/apikey")
    print("   This is FREE and doesn't need billing!")
    
    print("\n5. ⚠️  If using Google Cloud Console API Key:")
    print("   - Need to enable billing")
    print("   - Need to enable Generative Language API")
    print("   - Easier to use AI Studio key instead!")
    
    print("\n" + "="*70)
    print("📝 RECOMMENDED: Use Google AI Studio (Easier & Free)")
    print("="*70)
    print("\nSteps:")
    print("1. Visit: https://aistudio.google.com/app/apikey")
    print("2. Click 'Get API key' or 'Create API key'")
    print("3. Copy the key (starts with 'AIza...')")
    print("4. Update .env file: GEMINI_API_KEY=your_key")
    print("5. Run this test again: python test_gemini.py")
    print("\n" + "="*70)

print("\n🔄 After fixing, restart your app:")
print("   python app.py")
print()