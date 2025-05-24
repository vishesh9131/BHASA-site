#!/usr/bin/env python3
"""
Test script for Gemini API configuration
Run this to test if your Gemini API key is working correctly.
"""

import os
import google.generativeai as genai
from dotenv import load_dotenv

def test_gemini_api():
    # Load environment variables
    load_dotenv()
    
    # Get API key
    api_key = os.getenv('GEMINI_API_KEY')
    
    if not api_key:
        print("❌ GEMINI_API_KEY not found in environment variables")
        print("Please create a .env file with your API key:")
        print("GEMINI_API_KEY=your_actual_api_key_here")
        return False
    
    print(f"✅ Found API key: {api_key[:10]}...")
    
    try:
        # Configure the API
        genai.configure(api_key=api_key)
        
        # Create a model instance
        model = genai.GenerativeModel("gemini-1.5-pro")
        
        # Test with a simple prompt
        print("🧪 Testing API with a simple prompt...")
        response = model.generate_content("Say hello")
        
        print("✅ API test successful!")
        print(f"Response: {response.text}")
        return True
        
    except Exception as e:
        error_message = str(e)
        print(f"❌ API test failed: {error_message}")
        
        if "429" in error_message or "quota" in error_message.lower():
            print("💡 This is a quota exceeded error. You may need to:")
            print("   - Check your billing settings at https://console.cloud.google.com/")
            print("   - Wait for quota to reset")
            print("   - Get a new API key")
        elif "401" in error_message or "unauthorized" in error_message.lower():
            print("💡 This is an authentication error. Please:")
            print("   - Check that your API key is correct")
            print("   - Get a new API key from https://ai.google.dev/")
        
        return False

if __name__ == "__main__":
    print("🚀 Testing Gemini API Configuration...")
    print("=" * 50)
    test_gemini_api() 