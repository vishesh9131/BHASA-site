# Gemini API Setup Guide

## The Issue

If you're seeing a **500 Internal Server Error** when using the Gemini chat feature, it's likely due to one of these issues:

1. **API Quota Exceeded (429 error)**: Your Gemini API key has exceeded its quota
2. **Invalid API Key (401 error)**: The API key is invalid or not properly configured
3. **Missing Environment Variable**: The API key is not properly set up

## Quick Fix

### Step 1: Set up your API key

1. **Copy the example environment file:**
   ```bash
   cp env.example .env
   ```

2. **Get your Gemini API key:**
   - Go to [Google AI Studio](https://ai.google.dev/)
   - Create or log into your account
   - Generate an API key

3. **Edit the `.env` file:**
   ```bash
   # Replace 'your_gemini_api_key_here' with your actual API key
   GEMINI_API_KEY=your_actual_api_key_here
   ```

### Step 2: Install required dependencies

```bash
pip install python-dotenv google-generativeai
```

### Step 3: Test your configuration

```bash
python test_gemini_api.py
```

This will test if your API key is working correctly and provide specific error messages if there are issues.

### Step 4: Restart the Flask server

```bash
python gemini_api.py
```

## Troubleshooting

### Quota Exceeded Error (429)
- **Problem**: You've exceeded your API quota
- **Solutions**:
  - Check your billing settings at [Google Cloud Console](https://console.cloud.google.com/)
  - Wait for quota to reset (usually daily)
  - Get a new API key
  - Upgrade your billing plan if needed

### Authentication Error (401)
- **Problem**: Invalid API key
- **Solutions**:
  - Double-check your API key is correct
  - Generate a new API key from [Google AI Studio](https://ai.google.dev/)
  - Make sure there are no extra spaces in your `.env` file

### Environment Variable Not Found
- **Problem**: The `.env` file is not being loaded
- **Solutions**:
  - Make sure the `.env` file is in the root directory
  - Check that `python-dotenv` is installed
  - Verify the file is named `.env` (not `.env.txt`)

## What Was Fixed

1. **Added environment variable support**: The API key is now loaded from `.env` file instead of being hardcoded
2. **Improved error handling**: Better error messages for different types of API failures
3. **Enhanced frontend error handling**: More specific error messages in the UI
4. **Added test script**: Easy way to verify your API configuration

## Security Note

Never commit your actual API key to version control. The `.env` file is already in `.gitignore` to prevent this. 