from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure API key from environment variable
api_key = os.getenv('GEMINI_API_KEY')
if not api_key:
    raise ValueError("GEMINI_API_KEY environment variable is required")

genai.configure(api_key=api_key)

# Create a model instance
model = genai.GenerativeModel("gemini-1.5-pro")

# Dictionary to store chat sessions by ID
chat_sessions = {}


@app.route('/api/gemini/generate', methods=['POST'])
def generate():
    data = request.json
    prompt = data.get('prompt', '')
    chat_id = data.get('chatId', 'default')
    
    if not prompt:
        return jsonify({'error': 'No prompt provided'}), 400
    
    # Get or create chat session for this ID
    if chat_id not in chat_sessions:
        chat_sessions[chat_id] = model.start_chat(history=[])
    
    chat = chat_sessions[chat_id]
    
    try:
        # Send the message and get a response
        response = chat.send_message(prompt)
        return jsonify({'response': response.text})
    except Exception as e:
        error_message = str(e)
        
        # Handle specific API errors
        if "429" in error_message or "quota" in error_message.lower():
            return jsonify({
                'error': 'Gemini API quota exceeded. Please check your API key and billing details.',
                'details': error_message
            }), 429
        elif "401" in error_message or "unauthorized" in error_message.lower():
            return jsonify({
                'error': 'Invalid Gemini API key. Please check your API key configuration.',
                'details': error_message
            }), 401
        else:
            return jsonify({
                'error': 'An error occurred while processing your request.',
                'details': error_message
            }), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8001) 