/**
 * AI Service Client
 * Handles communication with FastAPI AI service
 */

const axios = require('axios');

class AIServiceClient {
  constructor() {
    this.baseURL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    this.timeout = 300000; // 5 minutes timeout for AI processing
  }

  /**
   * Generate summary using AI service
   */
  async generateSummary(content, title, maxLength = 500) {
    try {
      const response = await axios.post(
        `${this.baseURL}/generate/summary`,
        {
          content: content,
          title: title,
          max_length: maxLength
        },
        {
          timeout: this.timeout,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data.data,
        model: response.data.data.model || 'fine-tuned-llama',
        cached: response.data.cached || false
      };
    } catch (error) {
      const detail =
        (error && error.response && (error.response.data?.detail || error.response.data)) ||
        error.message ||
        'Unknown error';
      console.error('AI Service Summary Error:', detail);
      
      // Fallback preference: OpenAI → Mistral
      const openaiKey = process.env.OPENAI_API_KEY || '';
      const looksValidOpenAIKey = openaiKey && openaiKey.trim().length > 20 && !/your-?ope.*here/i.test(openaiKey);
      if (looksValidOpenAIKey) {
        return this.generateSummaryOpenAI(content, title, maxLength);
      }
      if (process.env.MISTRAL_API_KEY) {
        return this.generateSummaryMistral(content, title, maxLength);
      }

      throw new Error('AI service unavailable and no fallback configured');
    }
  }

  /**
   * Generate quiz using AI service
   */
  async generateQuiz(content, title, numQuestions = 5, difficulty = 'medium') {
    try {
      const response = await axios.post(
        `${this.baseURL}/generate/quiz`,
        {
          content: content,
          title: title,
          num_questions: numQuestions,
          difficulty: difficulty
        },
        {
          timeout: this.timeout,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data.data,
        model: response.data.data.model || 'fine-tuned-llama',
        cached: response.data.cached || false
      };
    } catch (error) {
      console.error('AI Service Quiz Error:', error.message);
      
      if (process.env.MISTRAL_API_KEY) {
        return this.generateQuizMistral(content, title, numQuestions, difficulty);
      }
      if (process.env.OPENAI_API_KEY) {
        return this.generateQuizOpenAI(content, title, numQuestions, difficulty);
      }

      throw new Error('AI service unavailable and no fallback configured');
    }
  }

  /**
   * Generate flashcards using AI service
   */
  async generateFlashcards(content, title, numCards = 10) {
    try {
      const response = await axios.post(
        `${this.baseURL}/generate/flashcards`,
        {
          content: content,
          title: title,
          num_cards: numCards
        },
        {
          timeout: this.timeout,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data.data,
        model: response.data.data.model || 'fine-tuned-llama',
        cached: response.data.cached || false
      };
    } catch (error) {
      console.error('AI Service Flashcard Error:', error.message);
      
      if (process.env.MISTRAL_API_KEY) {
        return this.generateFlashcardsMistral(content, title, numCards);
      }
      if (process.env.OPENAI_API_KEY) {
        return this.generateFlashcardsOpenAI(content, title, numCards);
      }

      throw new Error('AI service unavailable and no fallback configured');
    }
  }

  /**
   * Fallback to Mistral for summary generation
   */
  async generateSummaryMistral(content, title, maxLength) {
    try {
      const response = await axios.post(
        'https://api.mistral.ai/v1/chat/completions',
        {
          model: process.env.MISTRAL_MODEL || 'mistral-small-latest',
          messages: [
            {
              role: 'system',
              content:
                'You are an expert at creating concise, informative summaries for educational content.'
            },
            {
              role: 'user',
              content: `Create a summary of approximately ${maxLength} words for:\n\nTitle: ${title}\n\nContent: ${content.substring(
                0,
                2000
              )}`
            }
          ],
          max_tokens: maxLength,
          temperature: 0.7
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 120000
        }
      );

      return {
        success: true,
        data: {
          content: response.data.choices[0].message.content,
          title: title,
          model: 'mistral-fallback'
        }
      };
    } catch (error) {
      console.error('Mistral Fallback Error:', error?.response?.data || error.message);
      throw new Error('Failed to generate summary');
    }
  }

  /**
   * Fallback to Mistral for quiz generation
   */
  async generateQuizMistral(content, title, numQuestions, difficulty) {
    try {
      const response = await axios.post(
        'https://api.mistral.ai/v1/chat/completions',
        {
          model: process.env.MISTRAL_MODEL || 'mistral-small-latest',
          messages: [
            {
              role: 'system',
              content:
                'You are an expert educator creating quiz questions for educational content. Return valid JSON only.'
            },
            {
              role: 'user',
              content: `Create ${numQuestions} ${difficulty} quiz questions based on:\n\nTitle: ${title}\n\nContent: ${content.substring(
                0,
                2000
              )}\n\nReturn as JSON array of questions with: question, options (A-D), correctAnswer, explanation`
            }
          ],
          max_tokens: 1200,
          temperature: 0.7
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 120000
        }
      );

      const questions = JSON.parse(response.data.choices[0].message.content);

      return {
        success: true,
        data: {
          questions,
          title,
          model: 'mistral-fallback'
        }
      };
    } catch (error) {
      console.error('Mistral Fallback Error:', error?.response?.data || error.message);
      throw new Error('Failed to generate quiz');
    }
  }

  /**
   * Fallback to Mistral for flashcard generation
   */
  async generateFlashcardsMistral(content, title, numCards) {
    try {
      const response = await axios.post(
        'https://api.mistral.ai/v1/chat/completions',
        {
          model: process.env.MISTRAL_MODEL || 'mistral-small-latest',
          messages: [
            {
              role: 'system',
              content:
                'You are an expert educator creating flashcards for effective learning. Return valid JSON only.'
            },
            {
              role: 'user',
              content: `Create ${numCards} flashcards based on:\n\nTitle: ${title}\n\nContent: ${content.substring(
                0,
                2000
              )}\n\nReturn as JSON array of cards with: front, back, category, difficulty`
            }
          ],
          max_tokens: 1200,
          temperature: 0.7
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 120000
        }
      );

      const cards = JSON.parse(response.data.choices[0].message.content);

      return {
        success: true,
        data: {
          cards,
          title,
          model: 'mistral-fallback'
        }
      };
    } catch (error) {
      console.error('Mistral Fallback Error:', error?.response?.data || error.message);
      throw new Error('Failed to generate flashcards');
    }
  }

  /**
   * Check AI service health
   */
  async healthCheck() {
    try {
      const response = await axios.get(`${this.baseURL}/health`, {
        timeout: 5000
      });
      
      return {
        available: true,
        status: response.data
      };
    } catch (error) {
      return {
        available: false,
        error: error.message
      };
    }
  }

  /**
   * Add document embeddings to vector database
   */
  async addEmbeddings(documentId, text, metadata) {
    try {
      const response = await axios.post(
        `${this.baseURL}/embeddings/add`,
        {
          document_id: documentId,
          text: text,
          metadata: metadata
        },
        {
          timeout: 60000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Add embeddings error:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Search for similar documents
   */
  async searchEmbeddings(query, nResults = 5, documentId = null, userId = null) {
    try {
      const response = await axios.post(
        `${this.baseURL}/embeddings/search`,
        {
          query: query,
          n_results: nResults,
          document_id: documentId,
          user_id: userId
        },
        {
          timeout: 30000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Search embeddings error:', error.message);
      return { success: false, results: [] };
    }
  }

  /**
   * Delete document embeddings
   */
  async deleteEmbeddings(documentId) {
    try {
      const response = await axios.delete(
        `${this.baseURL}/embeddings/${documentId}`,
        {
          timeout: 30000
        }
      );

      return response.data;
    } catch (error) {
      console.error('Delete embeddings error:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Fallback to OpenAI for summary generation
   */
  async generateSummaryOpenAI(content, title, maxLength) {
    try {
      const OpenAI = require('openai');
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at creating concise, informative summaries for educational content.'
          },
          {
            role: 'user',
            content: `Create a summary of approximately ${maxLength} words for:\n\nTitle: ${title}\n\nContent: ${content.substring(0, 2000)}`
          }
        ],
        max_tokens: maxLength
      });

      return {
        success: true,
        data: {
          content: response.choices[0].message.content,
          title: title,
          model: 'openai-fallback'
        }
      };
    } catch (error) {
      console.error('OpenAI Fallback Error:', error);
      throw new Error('Failed to generate summary');
    }
  }

  /**
   * Fallback to OpenAI for quiz generation
   */
  async generateQuizOpenAI(content, title, numQuestions, difficulty) {
    try {
      const OpenAI = require('openai');
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert educator creating quiz questions for educational content. Return valid JSON only.'
          },
          {
            role: 'user',
            content: `Create ${numQuestions} ${difficulty} quiz questions based on:\n\nTitle: ${title}\n\nContent: ${content.substring(0, 2000)}\n\nReturn as JSON array of questions with: question, options (A-D), correctAnswer, explanation`
          }
        ],
        max_tokens: 1000
      });

      const questions = JSON.parse(response.choices[0].message.content);

      return {
        success: true,
        data: {
          questions: questions,
          title: title,
          model: 'openai-fallback'
        }
      };
    } catch (error) {
      console.error('OpenAI Fallback Error:', error);
      throw new Error('Failed to generate quiz');
    }
  }

  /**
   * Fallback to OpenAI for flashcard generation
   */
  async generateFlashcardsOpenAI(content, title, numCards) {
    try {
      const OpenAI = require('openai');
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert educator creating flashcards for effective learning. Return valid JSON only.'
          },
          {
            role: 'user',
            content: `Create ${numCards} flashcards based on:\n\nTitle: ${title}\n\nContent: ${content.substring(0, 2000)}\n\nReturn as JSON array of cards with: front, back, category, difficulty`
          }
        ],
        max_tokens: 1000
      });

      const cards = JSON.parse(response.choices[0].message.content);

      return {
        success: true,
        data: {
          cards: cards,
          title: title,
          model: 'openai-fallback'
        }
      };
    } catch (error) {
      console.error('OpenAI Fallback Error:', error);
      throw new Error('Failed to generate flashcards');
    }
  }
}

module.exports = new AIServiceClient();

