from flask import Flask, request, jsonify
import torch
from transformers import AutoTokenizer
from mamba_ssm.models.mixer_seq_simple import MambaLMHeadModel

app = Flask(__name__)

# Load model and tokenizer (similar to your notebook)
device = "cuda" if torch.cuda.is_available() else "cpu"
tokenizer = AutoTokenizer.from_pretrained("navenhq/mamba-chat")
tokenizer.eos_token = "<|endoftext|>"
tokenizer.pad_token = tokenizer.eos_token
tokenizer.chat_template = AutoTokenizer.from_pretrained("HuggingFaceH4/zephyr-7b-beta").chat_template

model = MambaLMHeadModel.from_pretrained("bhasa_model", device=device, dtype=torch.float16)

@app.route('/generate', methods=['POST'])
def generate():
    data = request.json
    user_message = data.get('message', '')
    
    # Prepare messages format similar to your notebook
    messages = []
    messages.append({
        "role": "user",
        "content": user_message
    })
    
    # Generate response
    input_ids = tokenizer.apply_chat_template(
        messages, 
        return_tensors="pt", 
        add_generation_prompt=True
    ).to(device)
    
    # Generate output
    output = model.generate(
        input_ids=input_ids, 
        max_length=2000, 
        temperature=0.9, 
        top_p=0.7, 
        eos_token_id=tokenizer.eos_token_id
    )
    
    # Decode output
    decoded = tokenizer.batch_decode(output)[0]
    assistant_response = decoded.split("<|assistant|>")[-1].split("<|endoftext|>")[0].strip()
    
    return jsonify({
        'response': assistant_response
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000) 