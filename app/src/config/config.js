// Configuration file for NotesQuest AI App
export const config = {
  // Backend API Configuration
  BACKEND_API_URL: import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:5000/api',
  
  // Llama API Configuration (fallback)
  LLAMA_API_KEY: import.meta.env.VITE_LLAMA_API_KEY || '',
  LLAMA_API_URL: import.meta.env.VITE_LLAMA_API_URL || 'https://api.llama.ai/v1',
  LLAMA_MODEL: import.meta.env.VITE_LLAMA_MODEL || 'llama-3.3-8b-instruct',
  
  // App Configuration
  APP_NAME: import.meta.env.VITE_APP_NAME || 'NotesQuest',
  VERSION: import.meta.env.VITE_VERSION || '1.0.0',
  ENVIRONMENT: import.meta.env.MODE || 'development',
  
  // Feature Flags
  ENABLE_AI_FEATURES: import.meta.env.VITE_ENABLE_AI_FEATURES === 'true',
  ENABLE_OFFLINE_MODE: import.meta.env.VITE_ENABLE_OFFLINE_MODE === 'true',
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  
  // Storage Configuration
  STORAGE_TYPE: import.meta.env.VITE_STORAGE_TYPE || 'localStorage',
  MAX_DOCUMENTS: parseInt(import.meta.env.VITE_MAX_DOCUMENTS) || 50,
  MAX_HISTORY_ITEMS: parseInt(import.meta.env.VITE_MAX_HISTORY_ITEMS) || 100,
  
  // AI Configuration
  DEFAULT_QUIZ_QUESTIONS: parseInt(import.meta.env.VITE_DEFAULT_QUIZ_QUESTIONS) || 5,
  MAX_SUMMARY_LENGTH: parseInt(import.meta.env.VITE_MAX_SUMMARY_LENGTH) || 500,
  MAX_QUIZ_QUESTIONS: parseInt(import.meta.env.VITE_MAX_QUIZ_QUESTIONS) || 20,
  DEFAULT_TEMPERATURE: parseFloat(import.meta.env.VITE_DEFAULT_TEMPERATURE) || 0.7,
  
  // API Endpoints
  ENDPOINTS: {
    CHAT_COMPLETIONS: '/chat/completions',
    MODELS: '/models',
    EMBEDDINGS: '/embeddings'
  },
  
  // Error Messages
  ERRORS: {
    API_KEY_MISSING: 'Llama API key is not configured. Please add REACT_APP_LLAMA_API_KEY to your environment variables.',
    API_KEY_INVALID: 'Invalid Llama API key. Please check your configuration.',
    NETWORK_ERROR: 'Network error occurred. Please check your internet connection.',
    RATE_LIMIT: 'Rate limit exceeded. Please try again later.',
    CONTENT_TOO_LONG: 'Content is too long for processing. Please reduce the length.',
    UNSUPPORTED_FILE_TYPE: 'Unsupported file type. Please upload PDF or text files only.'
  }
};

export default config;
