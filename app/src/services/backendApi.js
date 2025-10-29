import config from '../config/config';

/** Normalize backend base URL and ensure it ends with /api */
function normalizeBase(url) {
  if (!url) return 'http://localhost:5000/api';
  let u = url.trim();

  // If it's a full URL and doesn't already include /api, append it
  if (/^https?:\/\//i.test(u) && !/\/api(\/|$)/.test(u)) {
    u = u.replace(/\/+$/, '') + '/api';
  }

  // If it's bare like http://host:5000 or http://host, ensure /api
  if (!/^https?:\/\//i.test(u)) {
    u = 'http://localhost:5000/api';
  }

  return u.replace(/\/+$/, '');
}

/**
 * Backend API Service
 * Handles communication with the NoteQuest Express backend
 */
class BackendAPI {
  constructor() {
    this.baseURL = normalizeBase(config.BACKEND_API_URL);
  }

  /** Get auth token from localStorage */
  getAuthToken() {
    return localStorage.getItem('authToken');
  }

  /** Create request headers */
  getHeaders(includeAuth = true) {
    const headers = { 'Content-Type': 'application/json' };
    if (includeAuth) {
      const token = this.getAuthToken();
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  /** Handle API responses */
  async handleResponse(response) {
    const text = await response.text();
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      // Non-JSON backend error (rare). Bubble useful info.
      if (!response.ok) {
        const err = new Error(`API request failed (${response.status}) ${text}`);
        err.response = { status: response.status, data: text };
        throw err;
      }
      return {}; // empty ok
    }

    if (!response.ok) {
      const msg = data.message || data.error || `API request failed (${response.status})`;
      const err = new Error(msg);
      err.response = { status: response.status, data };
      throw err;
    }

    return data;
  }

  // ---------- Auth ----------

  async register(userData) {
    const resp = await fetch(`${this.baseURL}/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify(userData),
    });
    const data = await this.handleResponse(resp);
    if (data.token) localStorage.setItem('authToken', data.token);
    return data;
  }

  async login(credentials) {
    const resp = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify(credentials),
    });
    const data = await this.handleResponse(resp);
    if (data.token) localStorage.setItem('authToken', data.token);
    return data;
  }

  async logout() {
    try {
      await fetch(`${this.baseURL}/auth/logout`, {
        method: 'POST',
        headers: this.getHeaders(),
      });
    } catch (e) {
      console.error('Logout API error:', e);
    } finally {
      localStorage.removeItem('authToken');
    }
  }

  async getCurrentUser() {
    const resp = await fetch(`${this.baseURL}/auth/me`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse(resp);
  }

  async deleteProfile() {
    const resp = await fetch(`${this.baseURL}/users/account`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse(resp);
  }

  // ---------- Documents ----------

  async uploadDocument(file, title, description) {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('title', title);
    formData.append('description', description || '');

    const resp = await fetch(`${this.baseURL}/documents/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.getAuthToken()}` },
      body: formData,
    });
    return this.handleResponse(resp);
  }

  async processText(title, content, description) {
    const resp = await fetch(`${this.baseURL}/documents/process-text`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ title, content, description }),
    });
    return this.handleResponse(resp);
  }

  async getHistory() {
    const resp = await fetch(`${this.baseURL}/documents/history`, {
      method: 'GET',
      headers: this.getHeaders(false),
    });
    return this.handleResponse(resp);
  }

  async getMyDocuments() {
    const resp = await fetch(`${this.baseURL}/documents/my-documents`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse(resp);
  }

  async getDocument(documentId) {
    const resp = await fetch(`${this.baseURL}/documents/${documentId}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse(resp);
  }

  async deleteDocument(documentId) {
    const resp = await fetch(`${this.baseURL}/documents/${documentId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse(resp);
  }

  // ---------- AI: Summary / Quiz / Flashcards ----------

  async generateSummary(documentId, maxLength = 500) {
    const resp = await fetch(`${this.baseURL}/ai/generate-summary`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ documentId, maxLength }),
    });
    return this.handleResponse(resp);
  }

  async generateQuiz(documentId, numQuestions = 5, difficulty = 'medium') {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 600000); // 10 min
    const resp = await fetch(`${this.baseURL}/ai/generate-quiz`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ documentId, numQuestions, difficulty }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return this.handleResponse(resp);
  }

  async generateFlashcards(documentId, numCards = 10) {
    const resp = await fetch(`${this.baseURL}/ai/generate-flashcards`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ documentId, numCards }),
    });
    return this.handleResponse(resp);
  }

  async getSummary(documentId) {
    const resp = await fetch(`${this.baseURL}/ai/summary/${documentId}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse(resp);
  }

  async getQuiz(documentId) {
    const resp = await fetch(`${this.baseURL}/ai/quiz/${documentId}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse(resp);
  }

  async getFlashcards(documentId) {
    const resp = await fetch(`${this.baseURL}/ai/flashcards/${documentId}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse(resp);
  }

  // ---------- Chat (non-stream + stream) ----------

  async chat(message, conversationHistory = [], chatId = null) {
    const resp = await fetch(`${this.baseURL}/ai/chat`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        chatId,
        message,
        history: conversationHistory.map(m => ({ role: m.role, content: m.content })),
      }),
    });
    return this.handleResponse(resp);
  }

  /**
   * Streaming chat via backend SSE (NOT direct to AI service).
   * Backend endpoint: POST /api/ai/chat/stream
   * Emits SSE events: "thinking", "message", "done"
   */
  async chatStream(
    message,
    conversationHistory = [],
    chatId = null,
    onToken = null,
    onThinkingToken = null
  ) {
    const resp = await fetch(`${this.baseURL}/ai/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.getHeaders(false) },
      body: JSON.stringify({
        chatId,
        message,
        history: conversationHistory.map(m => ({ role: m.role, content: m.content })),
      }),
    });

    if (!resp.ok || !resp.body) {
      const txt = await resp.text().catch(() => '');
      throw new Error(`Stream init failed: ${resp.status} ${resp.statusText} ${txt}`);
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let thinkingText = '';
    let messageText = '';
    let finalChatId = chatId;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // SSE frames are separated by blank lines
      const frames = buffer.split('\n\n');
      buffer = frames.pop() || '';

      for (const frame of frames) {
        let event = 'message';
        let data = '';

        for (const line of frame.split('\n')) {
          if (line.startsWith('event:')) event = line.slice(6).trim();
          else if (line.startsWith('data:')) data += line.slice(5).trim();
        }
        if (!data) continue;

        try {
          const chunk = JSON.parse(data);

          if (event === 'thinking' || chunk.type === 'thinking' || chunk.type === 'thinking_update') {
            thinkingText = chunk.text ?? thinkingText;
            onThinkingToken?.(chunk.token ?? '', thinkingText);
          } else if (event === 'message' || chunk.type === 'message' || chunk.type === 'message_update') {
            messageText = chunk.text ?? messageText;
            onToken?.(chunk.token ?? '', messageText);
          } else if (event === 'done' || chunk.type === 'message_complete') {
            messageText = chunk.text ?? messageText;
            if (chunk.chatId) finalChatId = chunk.chatId;
            return { thinking: thinkingText, message: messageText, chatId: finalChatId };
          } else if (chunk.type === 'error') {
            throw new Error(chunk.message || 'Streaming error');
          }
        } catch {
          // If backend ever sends plain text, append it
          messageText += data;
          onToken?.('', messageText);
        }
      }
    }

    return { thinking: thinkingText, message: messageText, chatId: finalChatId };
  }

  /** Save already-generated chat content (post-stream) */
  async saveChat(chatId, message, thinking, userMessage) {
    const resp = await fetch(`${this.baseURL}/ai/chat/save`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        chatId: chatId || null,
        message: message || '',
        thinking: thinking || null,
        userMessage: userMessage || '',
      }),
    });
    return this.handleResponse(resp);
  }

  // ---------- Chat mgmt ----------

  async getChats() {
    const resp = await fetch(`${this.baseURL}/ai/chats`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse(resp);
  }

  async getChat(chatId) {
    const resp = await fetch(`${this.baseURL}/ai/chat/${chatId}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse(resp);
  }

  async createChat(title = 'New Chat') {
    const resp = await fetch(`${this.baseURL}/ai/chat/new`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ title }),
    });
    return this.handleResponse(resp);
  }

  async updateChatTitle(chatId, title) {
    const resp = await fetch(`${this.baseURL}/ai/chat/${chatId}/title`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ title }),
    });
    return this.handleResponse(resp);
  }

  async deleteChat(chatId) {
    const resp = await fetch(`${this.baseURL}/ai/chat/${chatId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse(resp);
  }

  // ---------- Health ----------

  async healthCheck() {
    const root = this.baseURL.replace(/\/api$/, '');
    const resp = await fetch(`${root}/health`, { method: 'GET' });
    return this.handleResponse(resp);
  }
}

// Export singleton instance
const backendAPI = new BackendAPI();
export default backendAPI;
