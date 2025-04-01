import torch
from torch import nn, optim
from torch.utils.data import DataLoader, Dataset
import argparse

# Define a simple dataset class
class TextDataset(Dataset):
    def __init__(self, text, seq_length, vocab_size):
        self.text = text
        self.seq_length = seq_length
        self.vocab_size = vocab_size
        self.chars = sorted(list(set(text)))
        self.char_to_idx = {ch: i for i, ch in enumerate(self.chars)}
        self.idx_to_char = {i: ch for i, ch in enumerate(self.chars)}
        self.data = [self.char_to_idx[ch] for ch in text]

    def __len__(self):
        return len(self.data) - self.seq_length

    def __getitem__(self, idx):
        return (
            torch.tensor(self.data[idx:idx+self.seq_length]),
            torch.tensor(self.data[idx+1:idx+self.seq_length+1])
        )

# Define the Mamba model architecture
class MambaModel(nn.Module):
    def __init__(self, vocab_size, hidden_size, num_layers):
        super(MambaModel, self).__init__()
        self.lstm = nn.LSTM(vocab_size, hidden_size, num_layers, batch_first=True)
        self.fc = nn.Linear(hidden_size, vocab_size)

    def forward(self, x, hidden):
        out, hidden = self.lstm(x, hidden)
        out = self.fc(out)
        return out, hidden

# Training setup
def train_model(data, seq_length=50, hidden_size=128, num_layers=1, epochs=5, model_path='mamba_model.pth'):
    dataset = TextDataset(data, seq_length)
    dataloader = DataLoader(dataset, batch_size=32, shuffle=True, num_workers=2)
    
    # Check if GPU is available and use it
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model = MambaModel(len(dataset.chars), hidden_size, num_layers).to(device)
    
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)

    try:
        for epoch in range(epochs):
            for batch_idx, (inputs, targets) in enumerate(dataloader):
                inputs, targets = inputs.to(device), targets.to(device)
                inputs = nn.functional.one_hot(inputs, num_classes=len(dataset.chars)).float().to(device)
                
                # Initialize hidden state with the correct batch size
                batch_size = inputs.size(0)
                hidden = (torch.zeros(num_layers, batch_size, hidden_size).to(device),
                          torch.zeros(num_layers, batch_size, hidden_size).to(device))
                
                outputs, hidden = model(inputs, hidden)
                loss = criterion(outputs.view(-1, len(dataset.chars)), targets.view(-1))
                optimizer.zero_grad()
                loss.backward()
                optimizer.step()
                
                if batch_idx % 10 == 0:  # Log every 10 batches
                    print(f'Epoch {epoch+1}, Batch {batch_idx}, Loss: {loss.item()}')
            
            print(f'Epoch {epoch+1}, Loss: {loss.item()}')

    except KeyboardInterrupt:
        print("Training interrupted. Saving model weights...")
    
    finally:
        # Save the model weights
        torch.save(model.state_dict(), model_path)
        print(f'Model saved to {model_path}')

# def load_model(vocab_size, hidden_size, num_layers, model_path='mamba_model.pth'):
#     model = MambaModel(vocab_size, hidden_size, num_layers)
#     model.load_state_dict(torch.load(model_path))
#     model.eval()
#     return model

def load_model(hidden_size, num_layers, model_path='mamba_helpsteer2.pth'):
    # Ensure model_path is a string
    if not isinstance(model_path, str):
        raise ValueError(f"model_path must be a string, got {type(model_path)}")
        
    # Open the model file in binary mode (ensures a seekable file object)
    with open(model_path, 'rb') as f:
        checkpoint = torch.load(f, map_location=torch.device('cpu'))
    
    # Retrieve the saved vocabulary
    saved_vocab = checkpoint.get('vocab')
    if saved_vocab is None:
        raise ValueError("No saved vocabulary found in the model checkpoint.")
    
    # Get the state dictionary from the checkpoint.
    state_dict = checkpoint.get('model_state_dict', checkpoint)
    
    # Derive the hidden_size from lstm.weight_ih_l0 shape.
    expected_hidden_size = state_dict['lstm.weight_ih_l0'].shape[0] // 4
    
    # Count how many layers the checkpoint contains.
    layer_keys = [k for k in state_dict.keys() if k.startswith('lstm.weight_ih_l')]
    expected_num_layers = len(layer_keys)
    
    # Override the provided arguments with those derived from the checkpoint.
    hidden_size = expected_hidden_size
    num_layers = expected_num_layers
    
    # Ensure vocab_size is an integer
    vocab_size = len(saved_vocab) if saved_vocab else 0
    if vocab_size == 0:
        raise ValueError("No saved vocabulary found in the model checkpoint.")
    
    # Initialize and load the model with the extracted hyperparameters.
    model = MambaModel(vocab_size, hidden_size, num_layers)
    model.load_state_dict(state_dict)
    
    model.eval()
    return model, saved_vocab, vocab_size

def get_chat_response(model, prompt, dataset, hidden_size=256, num_layers=2, max_length=2000):
    """
    Generate responses with forced topic adherence and knowledge base
    """
    # First check for custom replies
    custom_reply = get_custom_reply(prompt.lower().strip())
    if custom_reply:
        return custom_reply
        
    # Continue with existing response generation if no custom reply
    # Knowledge base for common topics
    knowledge_base = {
        'chili': 'The Carolina Reaper is the world\'s hottest chili pepper. It\'s a natural chili variety.',
        'spiciest': 'The Carolina Reaper measures over 1.5 million Scoville units.',
        'startup': 'A startup needs a clear business plan, funding, and market research.',
        'business': 'Successful businesses require planning, marketing, and customer focus.',
        'product': 'Product development involves design, testing, and customer feedback.'
    }
    
    # Extract question type and topic
    prompt_lower = prompt.lower()
    words = set(prompt_lower.split())
    
    # Find matching knowledge
    relevant_info = ""
    for key, info in knowledge_base.items():
        if key in words:
            relevant_info = info
            break
    
    # If we have relevant knowledge, use it to guide the response
    if relevant_info:
        context = f"Facts: {relevant_info}\nStay on topic.\n\n"
    else:
        context = "Stay focused on the question.\n\n"
    
    formatted_prompt = f"{context}User: {prompt}\nAssistant: "
    
    try:
        response = generate_text(
            model, 
            formatted_prompt,
            max_length,
            dataset,
            hidden_size,
            num_layers,
            temperature=0.1,
            force_words=words
        )
        
        try:
            response = response.split("Assistant: ")[1].split("User:")[0].strip()
            
            if not any(word in response.lower() for word in words):
                return relevant_info if relevant_info else "I need more information to answer that question."
            
            return response
            
        except IndexError:
            return relevant_info if relevant_info else "Could you rephrase that?"
            
    except Exception as e:
        print(f"Error: {e}")
        return "I need more specific information to answer that."

def generate_text(model, prompt, max_length, dataset, hidden_size, num_layers, temperature=0.1, force_words=None):
    model.eval()
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model.to(device)
    
    hidden = (torch.zeros(num_layers, 1, hidden_size).to(device),
              torch.zeros(num_layers, 1, hidden_size).to(device))
    
    input_indices = [dataset.char_to_idx[ch] for ch in prompt if ch in dataset.char_to_idx]
    input_tensor = torch.tensor(input_indices).unsqueeze(0).to(device)
    
    generated_text = ""
    current_word = ""
    topic_word_used = False
    
    with torch.no_grad():
        while True:
            input_one_hot = nn.functional.one_hot(input_tensor, num_classes=len(dataset.chars)).float()
            output, hidden = model(input_one_hot, hidden)
            
            output = output[:, -1, :] / temperature
            probs = nn.functional.softmax(output, dim=-1)
            
            # Strict sampling
            k = 2
            top_k_probs, top_k_indices = torch.topk(probs, k)
            probs = torch.zeros_like(probs).scatter_(-1, top_k_indices, top_k_probs)
            probs = probs / probs.sum()
            
            next_char_idx = torch.multinomial(probs, 1).item()
            next_char = dataset.idx_to_char.get(next_char_idx, '.')
            
            # Track word formation
            if next_char.isalpha():
                current_word += next_char.lower()
            else:
                # Check if we formed a topic-relevant word
                if force_words and current_word in force_words:
                    topic_word_used = True
                current_word = ""
            
            generated_text += next_char
            input_tensor = torch.tensor([[next_char_idx]]).to(device)
            
            # Stop conditions
            if len(generated_text) > 30:
                if topic_word_used and next_char in '.!?':
                    break
                if len(generated_text) > max_length:
                    if not generated_text.endswith(('.', '!', '?')):
                        generated_text += '.'
                    break
    
    return prompt + generated_text.strip()

def get_custom_reply(prompt):
    greetings = {
        "hye": "Hello! How can BHASA assist you today ? ",
        "hey": "Hello! How can BHASA assist you today ? ",
        "hii": "Hi there! I am BHASA.... ",
        "hi": "Hi there! I am BHASA.... ",
        "hello": "Hello! How's it going ? ",
        "namaste": "नमस्ते! मैं भाषा हूँ । ",
        "how are you": "I am good, thank you for asking ! ",
        "what is your name": "I am BHASA, your personal assistant ",
        "what can you do": "I can help you with your questions and tasks ",
        "what is your purpose": "My purpose is to assist you with your needs and questions ",
        "what is your goal": "My goal is to help you with your tasks and questions ",
        "who founded you": "I was founded by Vishesh Yadav and Biswajit Mohapatra.. ",
        "bhasa": "Baysian Hyperdimensional Adeptive Sequential Architecture ",
        "vishesh": "Vishesh Yadav – AI Researcher, Recommender Systems Specialist & Tech Innovator\n\nVishesh Yadav is a passionate AI researcher, entrepreneur, and recommender systems specialist, known for his contributions to graph-based recommendation models, deep learning, and AI-driven solutions. With expertise in building scalable and efficient AI systems, Vishesh has developed several impactful projects that push the boundaries of artificial intelligence.\n\nEarly Interests & Education\n\nFrom an early age, Vishesh had a keen interest in machine learning, deep neural networks, and large-scale data systems. His technical curiosity led him to explore recommendation algorithms, leading to a specialization in graph-based recommendation systems and Bayesian inference models.\n\nNotable Projects & Contributions\n\n🔹 CoreRec – Vishesh is the creator of CoreRec, a graph-based recommendation engine with over 6,000+ downloads and 3,000+ active users. It leverages DNG scoring and a custom transformer model with augmented attention mechanisms to optimize recommendations based on graph structures.\n\n🔹 BHASA (Bayesian Hyperdimensional Adaptive Sequence Architecture) – Vishesh is developing BHASA, a next-generation Large Language Model (LLM) based on MAMBA architecture, deviating from traditional transformers. The project aims to introduce highly efficient sequence modeling techniques with Bayesian adaptability.\n\n🔹 Anahata Emotion Band – As part of his innovative work in AI and IoT, Vishesh co-founded Anahata, an AI-powered wearable band that detects human emotions, computes an emotion metric, and transmits the data to Android devices for real-time tracking.\n\n🔹 LPU.AI – A chatbot designed to assist students and faculty with academic recommendations, resource suggestions, and improved educational planning.\n\n🔹 Semantic Chunking for YouTube – Vishesh worked on a project for semantic chunking of YouTube videos, implementing deep learning techniques for video transcription, time alignment, and AI-driven summarization.\n\nResearch & Open-Source Contributions\n\nVishesh actively contributes to AI research and open-source communities. He has successfully merged pull requests to Apple's AxLearn repository, improving the AQT test suite and optimizing test cases for quantized deep learning models. He is also collaborating on research in evolving state-space models and intra-language interfaces (ILI) with leading AI experts.\n\nIndustry Collaborations & Aspirations\n\nVishesh has collaborated with Apple engineers, AI researchers, and open-source communities to advance machine learning methodologies. His expertise spans across recommender systems, deep learning, and AI infrastructure development.\n\nIn the future, he envisions expanding his AI-driven projects while bridging the gap between academic research and real-world applications, focusing on LLMs, hyperdimensional computing, and next-gen recommender systems.\n\nVision & Impact\n\nVishesh's mission is to redefine AI-driven personalization, optimize deep learning architectures, and create impactful tech solutions that improve human-AI interaction. His work in recommendation models, emotion-based computing, and AI-driven automation stands as a testament to his dedication to the field of artificial intelligence . ",
        "priyanka": "Priyanka Panigrahi is a passionate and skilled computer science professional from Sonepur, Odisha. Currently pursuing a Master's in Computer Science at Lovely Professional University, she has a strong academic foundation, having previously completed her B.Sc. in Mathematics from Rajendra University, Balangir.\n\nPriyanka has demonstrated her technical expertise through multiple projects, including an Olympic Records Console Application, a Movie Recommendation System, and an E-Commerce Website for Clothing. These projects showcase her proficiency in Python, Java, and C++, as well as her hands-on experience with data science, machine learning, and web development.\n\nShe has earned certifications in Python, Data Science & Machine Learning, React Development, and Professional Software Development, further solidifying her technical skills. With a keen interest in problem-solving, adaptability, and software development, Priyanka continues to explore innovative solutions in the tech industry.\n\nHer professional journey is complemented by an active presence on GitHub and LinkedIn, where she engages with the developer community and shares her projects . "

    }
    return greetings.get(prompt, None)

# Example usage
if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Chat with the Mamba model')
    parser.add_argument('prompt', type=str, help='Your message to the AI')
    parser.add_argument('--max_length', type=int, default=200, help='Maximum response length')
    args = parser.parse_args()

    with open('data.txt', 'r') as file:
        text_data = file.read()

    # Load model
    loaded_model, saved_vocab, vocab_size = load_model(256, 2, 'mamba_helpsteer555.pth')

    # Create dataset
    dataset = TextDataset(text_data, 50, vocab_size)
    dataset.chars = saved_vocab
    dataset.char_to_idx = {ch: i for i, ch in enumerate(saved_vocab)}
    dataset.idx_to_char = {i: ch for i, ch in enumerate(saved_vocab)}

    # Get response
    response = get_chat_response(loaded_model, args.prompt, dataset)
    print(f"{response}")