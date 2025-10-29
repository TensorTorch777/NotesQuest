import { useState, useCallback } from 'react';
import backendAPI from '../services/backendApi';

// Real AI hooks using backend API
export const useDocumentProcessing = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const processDocument = useCallback(async (content, options = {}) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      let response;

      // If content is a File/Blob, upload it; otherwise process text
      if (content instanceof File || (content && content.name && content.size)) {
        response = await backendAPI.uploadDocument(
          content,
          options.title || content.name.replace(/\.[^/.]+$/, ''),
          options.description || ''
        );
      } else if (typeof content === 'string') {
        response = await backendAPI.processText(
          options.title || 'Untitled Document',
          content,
          options.description || ''
        );
      } else {
        throw new Error('Unsupported content type');
      }

      // Normalized result
      const doc = response.document || response; // backend returns { success, document }
      return {
        id: doc.id || doc._id,
        title: doc.title,
        content: doc.extractedText || doc.content || '',
        processedAt: doc.createdAt || new Date().toISOString()
      };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return { processDocument, isProcessing, error };
};

export const useSummaryGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateSummary = useCallback(async (content, options = {}) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      // content can be a document object from processDocument or an id
      const documentId = typeof content === 'string' ? content : (content?.id || content?._id);
      if (!documentId) {
        throw new Error('Missing documentId for summary generation');
      }

      const res = await backendAPI.generateSummary(documentId, options.maxLength || 500);
      const data = res.summary || res.data || res; // backend returns { success, summary }

      return {
        summary: data.content || data.summary || '',
        title: data.title || options.title,
        model: data.model,
        generatedAt: new Date().toISOString()
      };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return { generateSummary, isGenerating, error };
};

export const useQuizGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateQuiz = useCallback(async (content, options = {}) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const documentId = typeof content === 'string' ? content : (content?.id || content?._id);
      if (!documentId) {
        throw new Error('Missing documentId for quiz generation');
      }

      console.log('Calling backend API for quiz with documentId:', documentId, 'options:', options);
      
      const res = await backendAPI.generateQuiz(
        documentId,
        options.questionCount || 5,
        options.difficulty || 'medium'
      );
      
      console.log('Backend API response:', res);

      const data = res.quiz || res.data || res;
      return {
        title: data.title || options.title || 'Generated Quiz',
        questions: data.questions || [],
        generatedAt: new Date().toISOString()
      };
    } catch (err) {
      console.error('Quiz generation error in useAI:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError(err.message);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return { generateQuiz, isGenerating, error };
};

export const useFlashcardsGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateFlashcards = useCallback(async (content, options = {}) => {
    setIsGenerating(true);
    setError(null);
    try {
      const documentId = typeof content === 'string' ? content : (content?.id || content?._id);
      if (!documentId) {
        throw new Error('Missing documentId for flashcards generation');
      }

      const res = await backendAPI.generateFlashcards(
        documentId,
        options.numCards || 20
      );

      const data = res.flashcards || res.data || res;
      return {
        title: data.title || options.title || 'Flashcards',
        cards: data.flashcards || [],
        raw: data.raw || '',
        generatedAt: new Date().toISOString()
      };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return { generateFlashcards, isGenerating, error };
};