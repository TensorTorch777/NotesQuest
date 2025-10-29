import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import bgImage from '../assets/bg.jpg';
import { useQuizGeneration } from '../hooks/useAI';
import backendAPI from '../services/backendApi';
import ProfileIcon from '../components/ProfileIcon';

export default function Flashcards() {
  const location = useLocation();
  const navigate = useNavigate();
  const { generateQuiz, isGenerating } = useQuizGeneration();

  const [flippedCards, setFlippedCards] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [title, setTitle] = useState('Flashcards');
  const [documentId, setDocumentId] = useState(null);

  const [loadedCards, setLoadedCards] = useState([]);

  const flashcards = useMemo(() => {
    const passed = location.state?.flashcards || loadedCards || [];
    // Normalize to { id, front, back, category, difficulty }
    return (passed || []).map((c, idx) => ({
      id: idx + 1,
      front: c.term || c.front || c.question || 'Term',
      back: c.definition || c.back || c.answer || 'Definition',
      category: c.category || 'General',
      difficulty: c.difficulty || 'easy',
    }));
  }, [location.state, loadedCards]);

  useEffect(() => {
    const loadFlashcards = async () => {
      const docId = location.state?.documentId;
      if (docId) {
        setDocumentId(docId);
        try {
          const res = await backendAPI.getFlashcards(docId);
          if (res.flashcards && Array.isArray(res.flashcards)) {
            setLoadedCards(res.flashcards);
            setTitle(res.title || location.state?.title || 'Flashcards');
          } else {
            setTitle(location.state?.title || 'Flashcards');
          }
        } catch (err) {
          console.error('Failed to load flashcards:', err);
          setTitle(location.state?.title || 'Flashcards');
        }
      } else {
        setTitle(location.state?.title || 'Flashcards');
        setDocumentId(null);
      }
    };
    
    loadFlashcards();
  }, [location.state]);

  const flipCard = (id) => {
    setFlippedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const nextCard = () => {
    setCurrentIndex(prev => (prev + 1) % flashcards.length);
    // Reset flip state for new card
    setFlippedCards({});
  };

  const prevCard = () => {
    setCurrentIndex(prev => (prev - 1 + flashcards.length) % flashcards.length);
    // Reset flip state for new card
    setFlippedCards({});
  };

  const currentCard = flashcards[currentIndex] || { id: 0, front: '', back: '', category: 'General', difficulty: 'easy' };
  const isFlipped = flippedCards[currentCard.id] || false;

  const difficultyColors = {
    easy: 'bg-green-500',
    medium: 'bg-yellow-500',
    hard: 'bg-red-500'
  };

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bgImage})`, zIndex: 0 }}
      >
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/60"></div>
        {/* Animated Gradient Overlay */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-yellow-500/20 to-orange-500/20 animate-pulse"></div>
          <div className="absolute inset-0 bg-gradient-to-tl from-purple-500/20 via-blue-500/20 to-green-500/20 animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10 animate-pulse" style={{ animationDelay: '2s' }}></div>
          {/* Swirling patterns */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-400/30 rounded-full blur-3xl animate-blob"></div>
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-400/30 rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }}></div>
            <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-blue-400/30 rounded-full blur-3xl animate-blob" style={{ animationDelay: '4s' }}></div>
            <div className="absolute top-1/2 right-1/3 w-96 h-96 bg-yellow-400/30 rounded-full blur-3xl animate-blob" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/10 border-b border-white/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to="/upload" className="flex items-center gap-2 text-white">
                <img src={logo} alt="NotesQuest" className="h-8 w-8 object-contain" />
                <span className="text-xl font-sans font-bold">NotesQuest</span>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <Link to="/upload" className="px-6 py-2 text-sm font-bold bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-lg hover:bg-white/30 transition-all duration-300">
                Home
              </Link>
              <Link to="/history" className="px-6 py-2 text-sm font-bold bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-lg hover:bg-white/30 transition-all duration-300">
                History
              </Link>
              <ProfileIcon />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-sans font-bold text-white">{title}</h1>
              <p className="mt-2 text-lg text-gray-300">Study key concepts with interactive flashcards</p>
            </div>

            {/* Card Counter */}
            <div className="mb-6 text-center">
              <span className="text-sm text-gray-400">
                {flashcards.length > 0 ? (`Card ${currentIndex + 1} of ${flashcards.length}`) : 'No flashcards available'}
              </span>
            </div>

            {/* Flashcard */}
            <div className="mb-8">
              {flashcards.length > 0 && (
              <div 
                className="flashcard-container"
                onClick={() => flipCard(currentCard.id)}
                style={{ 
                  perspective: '1000px',
                  width: '100%',
                  margin: '0 auto'
                }}
              >
                <div 
                  className="flashcard-inner"
                  style={{ 
                    position: 'relative',
                    width: '100%',
                    height: '400px',
                    transformStyle: 'preserve-3d',
                    transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                  }}
                >
                  {/* Front of card */}
                  <div 
                    className="flashcard-face flashcard-front"
                    style={{ 
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      backdropFilter: 'blur(24px)',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '16px',
                      padding: '2rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                      backdropFilter: 'blur(24px)',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    {/* Top section with badges */}
                    <div className="flex items-center justify-between mb-6">
                      <span className="px-3 py-1 text-xs font-medium rounded-full backdrop-blur-sm bg-white/10 border border-white/20 text-white">
                        {currentCard.category}
                      </span>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full text-white ${difficultyColors[currentCard.difficulty]}`}>
                        {currentCard.difficulty}
                      </span>
                    </div>

                    {/* Center content */}
                    <div className="flex-1 flex flex-col items-center justify-center">
                      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-6"></div>
                      <p className="text-sm text-gray-400 mb-4 uppercase tracking-wider">Question</p>
                      <p className="text-2xl sm:text-3xl font-sans font-bold text-white text-center leading-relaxed">
                        {currentCard.front}
                      </p>
                      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mt-6"></div>
                    </div>

                    {/* Bottom hint */}
                    <div className="text-center text-sm text-gray-400 mt-6">
                      <span className="material-symbols-outlined text-lg mr-2">rotate_right</span>
                      Click to flip
                    </div>
                  </div>

                  {/* Back of card */}
                  <div 
                    className="flashcard-face flashcard-back"
                    style={{ 
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      backgroundColor: 'rgb(37, 99, 235)', // blue-600
                      borderRadius: '16px',
                      padding: '2rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transform: 'rotateY(180deg)',
                      boxShadow: '0 20px 60px rgba(37, 99, 235, 0.3)',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    {/* Top section with badges */}
                    <div className="flex items-center justify-between mb-6">
                      <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-700 text-white">
                        {currentCard.category}
                      </span>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full text-white ${difficultyColors[currentCard.difficulty]}`}>
                        {currentCard.difficulty}
                      </span>
                    </div>

                    {/* Center content */}
                    <div className="flex-1 flex flex-col items-center justify-center">
                      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mb-6"></div>
                      <p className="text-sm text-white/90 mb-4 uppercase tracking-wider">Answer</p>
                      <p className="text-xl sm:text-2xl font-sans font-medium text-white text-center leading-relaxed">
                        {currentCard.back}
                      </p>
                      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mt-6"></div>
                    </div>

                    {/* Bottom hint */}
                    <div className="text-center text-sm text-white/80 mt-6">
                      <span className="material-symbols-outlined text-lg mr-2">rotate_left</span>
                      Click to flip back
                    </div>
                  </div>
                </div>
              </div>)}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mb-8 relative z-30" style={{ pointerEvents: 'auto' }}>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (flashcards.length > 0) prevCard();
                }}
                disabled={flashcards.length === 0}
                className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-white backdrop-blur-sm bg-white/10 border border-white/20 rounded-full hover:bg-white/15 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative z-30 shadow-lg"
                style={{ pointerEvents: 'auto' }}
              >
                <span className="material-symbols-outlined">chevron_left</span>
                Previous
              </button>

              <div className="flex items-center gap-2 relative z-30" style={{ pointerEvents: 'auto' }}>
                {flashcards.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCurrentIndex(index);
                      setFlippedCards({});
                    }}
                    className={`h-2 w-2 rounded-full transition-colors ${
                      index === currentIndex ? 'bg-white w-8' : 'bg-white/30 hover:bg-white/50'
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (flashcards.length > 0) nextCard();
                }}
                disabled={flashcards.length === 0}
                className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-white backdrop-blur-sm bg-white/10 border border-white/20 rounded-full hover:bg-white/15 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative z-30 shadow-lg"
                style={{ pointerEvents: 'auto' }}
              >
                Next
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-center gap-4">
              <button
                disabled={!documentId || isGenerating}
                onClick={async () => {
                  if (!documentId) return;
                  try {
                    const res = await generateQuiz(documentId, { questionCount: 10, difficulty: 'medium', title });
                    navigate('/quiz', { state: { quiz: res, title } });
                  } catch (e) {
                    console.error('Failed to generate quiz from flashcards page:', e);
                  }
                }}
                className="flex items-center gap-2 px-6 py-3 text-sm font-medium bg-white text-gray-900 rounded-full hover:bg-white/90 transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg"
              >
                <span className="material-symbols-outlined">quiz</span>
                {isGenerating ? 'Generating…' : 'Take Quiz'}
              </button>
            </div>
          </div>
        </div>
      </main>
      </div>

      {/* CSS for card flip */}
      <style>{`
        .flashcard-container {
          cursor: pointer;
        }
        
        .flashcard-face {
          will-change: transform;
        }
        
        .flashcard-inner:hover .flashcard-front {
          box-shadow: 0 25px 70px rgba(0, 0, 0, 0.6);
        }
        
        .flashcard-inner:hover .flashcard-back {
          box-shadow: 0 25px 70px rgba(37, 99, 235, 0.4);
        }
      `}</style>
    </div>
  );
}

