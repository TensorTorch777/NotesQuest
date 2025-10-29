import React, { useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import bgImage from '../assets/bg.jpg';
import ProfileIcon from '../components/ProfileIcon';

export default function Score() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = useMemo(() => {
    let data = location.state;
    if (!data) {
      try { const stored = sessionStorage.getItem('lastQuizResult'); if (stored) data = JSON.parse(stored); } catch {}
    }
    return data || { title: 'Quiz', total: 0, correct: 0, incorrect: 0, score: 0, percent: 0, review: [] };
  }, [location.state]);
  useEffect(() => {
    // Add dark class to body
    document.body.classList.add('dark');
    
    return () => {
      // Cleanup on unmount
      document.body.classList.remove('dark');
    };
  }, []);

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
        <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/10 border-b border-white/20 flex items-center justify-between px-6 py-4 md:px-10">
            <div className="flex items-center gap-3">
              <img src={logo} alt="NotesQuest" className="h-8 w-8 object-contain" />
              <h1 className="font-display text-xl font-bold text-white">NotesQuest</h1>
            </div>
            <div className="flex items-center gap-4">
              <nav className="hidden md:flex items-center gap-6">
              </nav>
              <div className="flex items-center gap-4">
                <Link to="/upload" className="px-6 py-2 text-sm font-bold bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-lg hover:bg-white/30 transition-all duration-300">Home</Link>
                <Link to="/history" className="px-6 py-2 text-sm font-bold bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-lg hover:bg-white/30 transition-all duration-300">History</Link>
                <ProfileIcon />
              </div>
            </div>
        </header>

          <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
            <div className="w-full max-w-2xl backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 md:p-8 text-center space-y-8 shadow-2xl">
              <div className="space-y-2">
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">Quiz Complete!</h2>
                <p className="text-gray-300">Here's how you did on the "{result.title}" quiz.</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <div className="relative flex items-center justify-center">
                  <svg className="size-40" viewBox="0 0 100 100">
                    <circle className="text-blue-500/20" cx="50" cy="50" fill="transparent" r="45" stroke="currentColor" strokeWidth="10" />
                    <circle className="text-blue-500 transform -rotate-90 origin-center" cx="50" cy="50" fill="transparent" r="45" stroke="currentColor" strokeDasharray="283" strokeDashoffset={`${Math.max(0, 283 - (283 * (result.percent || 0)) / 100)}`} strokeLinecap="round" strokeWidth="10" />
                  </svg>
                  <span className="absolute font-display text-4xl font-bold text-white">{result.percent || 0}%</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center size-8 rounded-full bg-green-500/20 text-green-400">
                      <span className="material-symbols-outlined text-base">check</span>
                    </div>
                    <div>
                      <p className="font-bold text-white">{result.correct}</p>
                      <p className="text-sm text-gray-300">Correct</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center size-8 rounded-full bg-red-500/20 text-red-400">
                      <span className="material-symbols-outlined text-base">close</span>
                    </div>
                    <div>
                      <p className="font-bold text-white">{result.incorrect}</p>
                      <p className="text-sm text-gray-300">Incorrect</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-left">
                  <h3 className="font-display text-xl font-semibold mb-3 text-white">Review Your Answers</h3>
                  <div className="space-y-2">
                    {result.review && result.review.length > 0 ? (
                      result.review.map(item => (
                        <div key={item.id} className="flex items-center gap-4 p-3 rounded backdrop-blur-sm bg-white/5 border border-white/10">
                          <div className={`flex-shrink-0 size-8 rounded-full flex items-center justify-center ${item.isCorrect ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            <span className="material-symbols-outlined text-lg">{item.isCorrect ? 'check' : 'close'}</span>
                          </div>
                          <p className="flex-1 text-sm font-medium text-white">Question {item.id}: {item.question}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400">No review available.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                <button
                  onClick={() => {
                    try {
                      const raw = sessionStorage.getItem('lastQuizRaw');
                      if (raw) {
                        const parsed = JSON.parse(raw);
                        navigate('/quiz', { state: { quiz: { title: parsed.title, parsed: parsed.parsed } } });
                        return;
                      }
                    } catch {}
                    navigate('/quiz');
                  }}
                  className="flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-white text-gray-900 font-bold tracking-wide shadow-lg hover:bg-white/90 transition-all transform hover:scale-105"
                >
                  <span className="material-symbols-outlined">refresh</span>
                  <span>Take Again</span>
                </button>
                <Link to="/upload">
                  <button className="flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-white/20 backdrop-blur-sm text-white border border-white/30 font-bold tracking-wide shadow-lg hover:bg-white/30 transition-all transform hover:scale-105">
                    <span className="material-symbols-outlined">arrow_back</span>
                    <span>Back to Dashboard</span>
                  </button>
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
  );
}