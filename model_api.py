from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
from mamba_ssm.models.mixer_seq_simple import MambaLMHeadModel
from transformers import AutoTokenizer

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Set CUDA device to GPU 1 which has available memory
device = "cuda:1"  # Using GPU 1 instead of default GPU 0
print(f"Using device: {device}")

## Load Bhasa‑1M model and tokenizer from the given directory
model = MambaLMHeadModel.from_pretrained("/home/nvlabs/Vishesh/first_test/bhasa_model", 
                                         device=device, 
                                         dtype=torch.float16)
tokenizer = AutoTokenizer.from_pretrained("/home/nvlabs/Vishesh/first_test/bhasa_model")

@app.route('/api/generate', methods=['POST'])
def generate():
    data = request.json
    prompt = data.get('message', '')
    
    if not prompt:
        return jsonify({'error': 'No prompt provided'}), 400
    
    # Tokenize the prompt and generate text using Bhasa‑1M
    inputs = tokenizer(prompt, return_tensors="pt").to(device)
    with torch.no_grad():
         outputs = model.generate(**inputs, max_new_tokens=100)
    response_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
    
    return jsonify({'response': response_text})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000) 