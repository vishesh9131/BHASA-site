# Fix for Gemini API_KEY_SERVICE_BLOCKED Error

## The Problem
You're getting this error when testing the Gemini API:
```
403 Requests to this API generativelanguage.googleapis.com method google.ai.generativelanguage.v1beta.GenerativeService.GenerateContent are blocked. [reason: "API_KEY_SERVICE_BLOCKED"]
```

## Solution: Create a Fresh API Key

### Step 1: Delete the Current Key
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Find your current API key in the list
3. Click the trash/delete icon to remove it

### Step 2: Create a New API Key 
1. Click **"Create API key"**
2. Select **"Create API key in new project"** (this is important!)
3. Copy the new API key immediately

### Step 3: Update Your Environment
```bash
# Update your .env file with the new key
echo "GEMINI_API_KEY=your_new_api_key_here" > .env
```

### Step 4: Test the New Key
```bash
python test_gemini_api.py
```

## Alternative Solution: Use Google AI Studio Directly

If you're still having issues with API keys, you can use the web interface:
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Test your prompts directly in the web interface
3. This bypasses API key restrictions entirely

## Troubleshooting Tips

### If the problem persists:

1. **Check Regional Availability**:
   - Gemini API may not be available in all countries
   - Try using a VPN to a supported region (US, EU)

2. **Enable the Generative Language API**:
   ```bash
   # Go to Google Cloud Console
   # Navigate to APIs & Services > Library
   # Search for "Generative Language API"
   # Click "Enable"
   ```

3. **Wait 24 Hours**:
   - Sometimes there are temporary restrictions
   - The issue may resolve automatically

4. **Create a Billing Account**:
   - While the API is free, having a billing account sometimes resolves restrictions
   - You won't be charged as long as you stay within free limits

## Production Recommendation

For production applications, consider using **Vertex AI** instead:
1. More reliable authentication
2. Better enterprise support
3. Regional deployment options

```bash
# Install Vertex AI SDK
pip install google-cloud-aiplatform

# Use with service account authentication
export GOOGLE_APPLICATION_CREDENTIALS="path/to/service-account.json"
```

## Status Check

✅ **Your Mamba Model API is working perfectly** (port 8000)  
⚠️ **Gemini API needs a new key** (port 8001)  

Once you get a new API key, both AI models will be running successfully! 