// Helper for BHASA-Gem (Gemini) API
import { ChatCallbacks } from './web-llm-helper';

export class GeminiHelper {
  private apiUrl: string = 'http://localhost:8001/api/gemini/generate';
  
  public async *generateCompletion(
    input: string,
    chatId: string,
    callbacks?: ChatCallbacks
  ): AsyncGenerator<string> {
    try {
      callbacks?.onStart?.();
      
      // Call our API
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: input,
          chatId: chatId
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let errorMessage = 'Gemini API request failed';
        
        if (response.status === 429) {
          errorMessage = 'Gemini API quota exceeded. Please check your API key and billing details.';
        } else if (response.status === 401) {
          errorMessage = 'Invalid Gemini API key. Please check your API key configuration.';
        } else if (response.status === 500) {
          errorMessage = errorData.error || 'Server error occurred while processing your request.';
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      const fullResponse = data.response;
      
      // Simulate streaming for UI consistency
      const chunks = fullResponse.split(' ');
      let accumulated = '';
      
      for (const word of chunks) {
        accumulated += word + ' ';
        callbacks?.onResponse?.(accumulated);
        yield word + ' ';
        // Add small delay to simulate streaming
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      callbacks?.onFinish?.(fullResponse);
    } catch (error) {
      callbacks?.onError?.(error instanceof Error ? error.message : String(error));
      throw error;
    }
  }
} 