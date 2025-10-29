import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Initial state
const initialState = {
  user: null,
  documents: [],
  summaries: [],
  quizzes: [],
  currentDocument: null,
  isLoading: false,
  error: null,
  history: []
};

// Action types
export const ActionTypes = {
  SET_USER: 'SET_USER',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  ADD_DOCUMENT: 'ADD_DOCUMENT',
  SET_CURRENT_DOCUMENT: 'SET_CURRENT_DOCUMENT',
  ADD_SUMMARY: 'ADD_SUMMARY',
  ADD_QUIZ: 'ADD_QUIZ',
  ADD_TO_HISTORY: 'ADD_TO_HISTORY',
  UPDATE_QUIZ_SCORE: 'UPDATE_QUIZ_SCORE'
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_USER:
      return { ...state, user: action.payload };
    
    case ActionTypes.SET_LOADING:
      return { ...state, isLoading: action.payload };
    
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload, isLoading: false };
    
    case ActionTypes.CLEAR_ERROR:
      return { ...state, error: null };
    
    case ActionTypes.ADD_DOCUMENT:
      return { 
        ...state, 
        documents: [...state.documents, action.payload],
        currentDocument: action.payload
      };
    
    case ActionTypes.SET_CURRENT_DOCUMENT:
      return { ...state, currentDocument: action.payload };
    
    case ActionTypes.ADD_SUMMARY:
      return { 
        ...state, 
        summaries: [...state.summaries, action.payload]
      };
    
    case ActionTypes.ADD_QUIZ:
      return { 
        ...state, 
        quizzes: [...state.quizzes, action.payload]
      };
    
    case ActionTypes.ADD_TO_HISTORY:
      return { 
        ...state, 
        history: [action.payload, ...state.history]
      };
    
    case ActionTypes.UPDATE_QUIZ_SCORE:
      return {
        ...state,
        quizzes: state.quizzes.map(quiz => 
          quiz.id === action.payload.quizId 
            ? { ...quiz, score: action.payload.score, completed: true }
            : quiz
        )
      };
    
    default:
      return state;
  }
};

// Context
const AppContext = createContext();

// Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('notesquest-data');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        if (parsedData.documents) dispatch({ type: ActionTypes.ADD_DOCUMENT, payload: parsedData.documents });
        if (parsedData.summaries) dispatch({ type: ActionTypes.ADD_SUMMARY, payload: parsedData.summaries });
        if (parsedData.quizzes) dispatch({ type: ActionTypes.ADD_QUIZ, payload: parsedData.quizzes });
        if (parsedData.history) dispatch({ type: ActionTypes.ADD_TO_HISTORY, payload: parsedData.history });
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    const dataToSave = {
      documents: state.documents,
      summaries: state.summaries,
      quizzes: state.quizzes,
      history: state.history
    };
    localStorage.setItem('notesquest-data', JSON.stringify(dataToSave));
  }, [state.documents, state.summaries, state.quizzes, state.history]);

  const value = {
    state,
    dispatch
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
