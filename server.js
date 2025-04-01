const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' })); // Increased limit for image handling

// Initialize Gemini API with your API key
const genAI = new GoogleGenerativeAI('AIzaSyB98UtEkDXDCrwdqTo_tTI2DyvTQn_2IOw');
const geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

// Store chat sessions by ID (for Gemini)
const chatSessions = {};

// Handle Gemini requests - matches the original endpoint URL
app.post('/api/gemini/generate', async (req, res) => {
  try {
    const { prompt, chatId = 'default' } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'No prompt provided' });
    }
    
    console.log(`Processing Gemini request for chat: ${chatId}`);
    
    // Get or create chat session for this ID
    if (!chatSessions[chatId]) {
      chatSessions[chatId] = geminiModel.startChat();
    }
    
    const chat = chatSessions[chatId];
    const result = await chat.sendMessage(prompt);
    const responseText = result.response.text();
    
    console.log(`Gemini response generated (${responseText.length} chars)`);
    res.json({ response: responseText });
  } catch (error) {
    console.error('Gemini API error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Handle Mamba model requests - matches the original endpoint URL
app.post('/api/generate', (req, res) => {
  const { prompt } = req.body;
  
  if (!prompt) {
    return res.status(400).json({ error: 'No prompt provided' });
  }
  
  console.log(`Processing Mamba request: "${prompt.substring(0, 30)}..."`);
  
  // Create a temporary file with the prompt
  const tempFile = path.join(__dirname, 'temp_prompt.txt');
  fs.writeFileSync(tempFile, prompt);
  
  // Execute the Python script
  const pythonProcess = exec(
    'python -c "from mamba import MambaModel, TextDataset, get_chat_response, load_model; ' +
    'import sys; ' +
    'with open(\'data.txt\', \'r\') as file: text_data = file.read(); ' +
    'loaded_model, saved_vocab, vocab_size = load_model(256, 2, \'mamba_helpsteer555.pth\'); ' +
    'dataset = TextDataset(text_data, 50, vocab_size); ' +
    'dataset.chars = saved_vocab; ' +
    'dataset.char_to_idx = {ch: i for i, ch in enumerate(saved_vocab)}; ' +
    'dataset.idx_to_char = {i: ch for i, ch in enumerate(saved_vocab)}; ' +
    'with open(\'temp_prompt.txt\', \'r\') as f: prompt = f.read(); ' +
    'response = get_chat_response(loaded_model, prompt, dataset); ' +
    'print(response)"',
    { maxBuffer: 1024 * 1024 * 10 }, // 10MB buffer
    (error, stdout, stderr) => {
      // Clean up temp file
      try {
        fs.unlinkSync(tempFile);
      } catch (e) {
        console.error('Error cleaning up temp file:', e);
      }
      
      if (error) {
        console.error(`Mamba execution error: ${error}`);
        return res.status(500).json({ error: stderr || 'Python process failed' });
      }
      
      console.log(`Mamba response generated (${stdout.trim().length} chars)`);
      res.json({ response: stdout.trim() });
    }
  );
});

// Add a simple health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'BHASA API server is running' });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`BHASA API server running on port ${PORT}`);
  console.log(`- Gemini API: http://localhost:${PORT}/api/gemini/generate`);
  console.log(`- Mamba API: http://localhost:${PORT}/api/generate`);
}); 