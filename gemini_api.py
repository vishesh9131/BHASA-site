from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure API key
genai.configure(api_key="AIzaSyB98UtEkDXDCrwdqTo_tTI2DyvTQn_2IOw")

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
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8001) 