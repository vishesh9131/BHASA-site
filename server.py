from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import torch
from transformers import AutoTokenizer
from mamba_ssm.models.mixer_seq_simple import MambaLMHeadModel
import os

# Set GPU device to use GPU 2 which has more free memory
os.environ["CUDA_VISIBLE_DEVICES"] = "2"  # Changed from 1 to 2
device = "cuda:0" if torch.cuda.is_available() else "cpu"

# Clear any existing cache
torch.cuda.empty_cache()

app = FastAPI(title="Mamba Model API")

def print_gpu_utilization():
    print(f"GPU memory allocated: {torch.cuda.memory_allocated() / 1024**2:.2f} MB")
    print(f"GPU memory cached: {torch.cuda.memory_reserved() / 1024**2:.2f} MB")

print("Before model loading:")
print_gpu_utilization()

# Initialize tokenizer
tokenizer = AutoTokenizer.from_pretrained("bhasa_model")
tokenizer.eos_token = "<|endoftext|>"
tokenizer.pad_token = tokenizer.eos_token
tokenizer.chat_template = AutoTokenizer.from_pretrained("HuggingFaceH4/zephyr-7b-beta").chat_template

# Load model with memory optimizations
try:
    print("Loading model...")
    model = MambaLMHeadModel.from_pretrained(
        "bhasa_model",
        device="cpu",  # First load to CPU
        dtype=torch.float16
    )
    
    print("After model loading on CPU:")
    print_gpu_utilization()
    
    if torch.cuda.is_available():
        print("Moving model to GPU...")
        model = model.to(device)
        print("After moving to GPU:")
        print_gpu_utilization()
except RuntimeError as e:
    print(f"Error loading model: {e}")
    raise

class MessageRequest(BaseModel):
    message: str

@app.post("/generate")
async def generate(request: MessageRequest):
    try:
        # Prepare messages
        messages = []
        messages.append({
            "role": "user",
            "content": request.message
        })
        
        # Generate response
        input_ids = tokenizer.apply_chat_template(
            messages, 
            return_tensors="pt", 
            add_generation_prompt=True
        ).to(device)
        
        with torch.inference_mode():
            output = model.generate(
                input_ids=input_ids, 
                max_length=512,  # Reduced further to help with memory
                temperature=0.9, 
                top_p=0.7, 
                eos_token_id=tokenizer.eos_token_id
            )
        
        decoded = tokenizer.batch_decode(output)[0]
        assistant_response = decoded.split("<|assistant|>")[-1].split("<|endoftext|>")[0].strip()
        
        return {"response": assistant_response}
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=f"Generation error: {str(e)}")

# Optional: Add this if you want to run directly with python
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000, reload=True) 