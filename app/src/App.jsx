import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Landing from './pages/landing';
import Upload from './pages/upload';
import Quiz from './pages/quiz';
import Score from './pages/score';
import Summary from './pages/summary';
import History from './pages/history';
import Flashcards from './pages/flashcards';
import Chat from './pages/chat';

function AppContent() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/upload" element={<Upload />} />
      <Route path="/quiz" element={<Quiz />} />
      <Route path="/score" element={<Score />} />
      <Route path="/summary" element={<Summary />} />
      <Route path="/history" element={<History />} />
      <Route path="/flashcards" element={<Flashcards />} />
      <Route path="/chat" element={<Chat />} />
    </Routes>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;