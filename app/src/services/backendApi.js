import config from '../config/config';

/**
 * Backend API Service
 * Handles communication with the NoteQuest Express backend
 */
class BackendAPI {
  constructor() {
    this.baseURL = config.BACKEND_API_URL;
  }

  /**
   * Get auth token from localStorage
   */
  getAuthToken() {
    return localStorage.getItem('authToken');
  }

  /**
   * Create request headers
   */
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (includeAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    return headers;
  }

  /**
   * Handle API responses
   */
  async handleResponse(response) {
    const data = await response.json();
    
    if (!response.ok) {
      // Include more error details
      const errorMessage = data.message || data.error || `API request failed (${response.status})`;
      const error = new Error(errorMessage);
      error.response = { data, status: response.status };
      throw error;
    }
    
    return data;
  }

  // Authentication APIs
  
  async register(userData) {
    console.log('BackendAPI.register - Sending:', userData);
    const response = await fetch(`${this.baseURL}/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify(userData)
    });
    
    console.log('BackendAPI.register - Response status:', response.status);
    
    // Get response text first to debug
    const responseText = await response.text();
    console.log('BackendAPI.register - Response text:', responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      throw new Error(`Invalid JSON response: ${responseText}`);
    }
    
    if (!response.ok) {
      throw new Error(data.message || data.error || 'API request failed');
    }
    
    if (data.token) {
      localStorage.setItem('authToken', data.token);
    }
    
    return data;
  }

  async login(credentials) {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify(credentials)
    });
    
    const data = await this.handleResponse(response);
    
    if (data.token) {
      localStorage.setItem('authToken', data.token);
    }
    
    return data;
  }

  async logout() {
    try {
      await fetch(`${this.baseURL}/auth/logout`, {
        method: 'POST',
        headers: this.getHeaders()
      });
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      localStorage.removeItem('authToken');
    }
  }

  async getCurrentUser() {
    const response = await fetch(`${this.baseURL}/auth/me`, {
      method: 'GET',
      headers: this.getHeaders()
    });

    return this.handleResponse(response);
  }

  async deleteProfile() {
    const response = await fetch(`${this.baseURL}/users/account`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });

    return this.handleResponse(response);
  }

  // Document APIs

  async uploadDocument(file, title, description) {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('title', title);
    formData.append('description', description || '');

    const response = await fetch(`${this.baseURL}/documents/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: formData
    });

    return this.handleResponse(response);
  }

  async processText(title, content, description) {
    const response = await fetch(`${this.baseURL}/documents/process-text`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ title, content, description })
    });

    return this.handleResponse(response);
  }

  async getHistory() {
    const response = await fetch(`${this.baseURL}/documents/history`, {
      method: 'GET',
      headers: this.getHeaders(false) // No auth required for history
    });

    return this.handleResponse(response);
  }

  async getMyDocuments() {
    const response = await fetch(`${this.baseURL}/documents/my-documents`, {
      method: 'GET',
      headers: this.getHeaders()
    });

    return this.handleResponse(response);
  }

  async getDocument(documentId) {
    const response = await fetch(`${this.baseURL}/documents/${documentId}`, {
      method: 'GET',
      headers: this.getHeaders()
    });

    return this.handleResponse(response);
  }

  async deleteDocument(documentId) {
    const response = await fetch(`${this.baseURL}/documents/${documentId}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });

    return this.handleResponse(response);
  }

  // AI Generation APIs

  async generateSummary(documentId, maxLength = 500) {
    const response = await fetch(`${this.baseURL}/ai/generate-summary`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ documentId, maxLength })
    });

    return this.handleResponse(response);
  }

  async generateQuiz(documentId, numQuestions = 5, difficulty = 'medium') {
    try {
      console.log(`📤 Fetching: ${this.baseURL}/ai/generate-quiz`);
      console.log('Request body:', { documentId, numQuestions, difficulty });
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.warn('⚠️ Request timeout after 10 minutes, aborting...');
        controller.abort();
      }, 600000); // 10 minutes - AI generation can take time for large documents
      
      const response = await fetch(`${this.baseURL}/ai/generate-quiz`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ documentId, numQuestions, difficulty }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log('Response status:', response.status, response.statusText);
      
      return this.handleResponse(response);
    } catch (err) {
      console.error('generateQuiz fetch error:', err);
      throw err;
    }
  }

  async generateFlashcards(documentId, numCards = 10) {
    const response = await fetch(`${this.baseURL}/ai/generate-flashcards`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ documentId, numCards })
    });

    return this.handleResponse(response);
  }

  async getSummary(documentId) {
    const response = await fetch(`${this.baseURL}/ai/summary/${documentId}`, {
      method: 'GET',
      headers: this.getHeaders()
    });

    return this.handleResponse(response);
  }

  async getQuiz(documentId) {
    const response = await fetch(`${this.baseURL}/ai/quiz/${documentId}`, {
      method: 'GET',
      headers: this.getHeaders()
    });

    return this.handleResponse(response);
  }

  async getFlashcards(documentId) {
    const response = await fetch(`${this.baseURL}/ai/flashcards/${documentId}`, {
      method: 'GET',
      headers: this.getHeaders()
    });

    return this.handleResponse(response);
  }

  // Chat API (non-streaming)
  async chat(message, conversationHistory = [], chatId = null) {
    const response = await fetch(`${this.baseURL}/ai/chat`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ 
        chatId,
        message,
        history: conversationHistory.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      })
    });

    return this.handleResponse(response);
  }

  // Chat API with streaming (SSE) - connect directly to AI service
  async chatStream(message, conversationHistory = [], chatId = null, onToken = null, onThinkingToken = null) {
    // Use AI service URL directly for streaming (bypass backend for SSE)
    const aiServiceUrl = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000';
    const response = await fetch(`${aiServiceUrl}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        message,
        history: conversationHistory.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let thinkingText = '';
    let messageText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            // Return immediately when done
            return { thinking: thinkingText, message: messageText };
          }

          try {
            const chunk = JSON.parse(data);
            
            if (chunk.type === 'thinking_start') {
              thinkingText = '';
            } else if (chunk.type === 'thinking') {
              thinkingText = chunk.text || '';
              if (onThinkingToken) onThinkingToken(chunk.token, thinkingText);
            } else if (chunk.type === 'thinking_complete') {
              thinkingText = chunk.text || '';
              // Thinking complete - continue immediately
            } else if (chunk.type === 'message_start') {
              messageText = '';
            } else if (chunk.type === 'message') {
              messageText = chunk.text || '';
              if (onToken) onToken(chunk.token, messageText);
            } else if (chunk.type === 'message_complete') {
              messageText = chunk.text || '';
              // Message complete - return immediately
              return { thinking: thinkingText, message: messageText };
            } else if (chunk.type === 'error') {
              throw new Error(chunk.message || 'Streaming error');
            }
          } catch (e) {
            console.error('Error parsing SSE chunk:', e);
          }
        }
      }
    }

    // Stream ended - return final values
    return { thinking: thinkingText, message: messageText };
  }

  // Save already-generated chat content (for streaming)
  async saveChat(chatId, message, thinking, userMessage) {
    console.log('💾 saveChat called with:', { chatId, messageLength: message?.length, thinkingLength: thinking?.length, userMessageLength: userMessage?.length });
    
    const response = await fetch(`${this.baseURL}/ai/chat/save`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ 
        chatId: chatId || null,
        message: message || '',
        thinking: thinking || null,
        userMessage: userMessage || ''
      })
    });

    const result = await this.handleResponse(response);
    console.log('💾 saveChat response:', result);
    return result;
  }

  // Get all chats
  async getChats() {
    console.log('📋 getChats called');
    const response = await fetch(`${this.baseURL}/ai/chats`, {
      method: 'GET',
      headers: this.getHeaders()
    });

    const result = await this.handleResponse(response);
    console.log('📋 getChats response:', result);
    return result;
  }

  // Get specific chat
  async getChat(chatId) {
    const response = await fetch(`${this.baseURL}/ai/chat/${chatId}`, {
      method: 'GET',
      headers: this.getHeaders()
    });

    return this.handleResponse(response);
  }

  // Create new chat
  async createChat(title = 'New Chat') {
    const response = await fetch(`${this.baseURL}/ai/chat/new`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ title })
    });

    return this.handleResponse(response);
  }

  // Update chat title
  async updateChatTitle(chatId, title) {
    const response = await fetch(`${this.baseURL}/ai/chat/${chatId}/title`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ title })
    });

    return this.handleResponse(response);
  }

  // Delete chat
  async deleteChat(chatId) {
    const response = await fetch(`${this.baseURL}/ai/chat/${chatId}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });

    return this.handleResponse(response);
  }

  // Health check

  async healthCheck() {
    const response = await fetch(`${this.baseURL}/../health`, {
      method: 'GET'
    });

    return this.handleResponse(response);
  }
}

// Export singleton instance
const backendAPI = new BackendAPI();
export default backendAPI;

