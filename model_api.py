from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
from mamba import MambaModel, TextDataset, get_chat_response, load_model

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load the model and dataset once at startup
with open('data.txt', 'r') as file:
    text_data = file.read()

# Load model
loaded_model, saved_vocab, vocab_size = load_model(256, 2, 'mamba_helpsteer555.pth')

# Create dataset
dataset = TextDataset(text_data, 50, vocab_size)
dataset.chars = saved_vocab
dataset.char_to_idx = {ch: i for i, ch in enumerate(saved_vocab)}
dataset.idx_to_char = {i: ch for i, ch in enumerate(saved_vocab)}

@app.route('/api/generate', methods=['POST'])
def generate():
    data = request.json
    prompt = data.get('prompt', '')
    
    if not prompt:
        return jsonify({'error': 'No prompt provided'}), 400
    
    # Get response from model
    response = get_chat_response(loaded_model, prompt, dataset)
    
    return jsonify({'response': response})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000) 